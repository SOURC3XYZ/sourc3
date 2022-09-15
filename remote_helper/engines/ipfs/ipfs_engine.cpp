// Copyright 2021-2022 SOURC3 Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "ipfs_engine.h"

#include <functional>
#include <iostream>
#include <set>
#include <variant>
#include <sstream>
#include <deque>
#include <unordered_set>
#include <unordered_map>

#include <boost/json.hpp>
#include <boost/asio.hpp>

#include "utils.h"
#include "contract_state.hpp"
#include "wallets/base_client.h"
#include "engines/ipfs/types.h"
#include "engines/ipfs/parsing.h"

using namespace std;
using namespace sourc3;

namespace {
struct ObjectWithContent : public sourc3::GitObject {
    std::string ipfs_hash;
    std::string content;

    ObjectWithContent(int8_t type, git_oid hash, std::string ipfs_hash, std::string content)
        : ipfs_hash(std::move(ipfs_hash)), content(std::move(content)) {
        this->hash = std::move(hash);
        this->type = type;
        data_size = static_cast<uint32_t>(content.size());
    }
};

std::string GetStringFromIPFS(const std::string& hash, IWalletClient& wallet_client) {
    auto res = ParseJsonAndTest(wallet_client.LoadObjectFromIPFS(hash));
    if (!res.as_object().contains("result")) {
        throw std::runtime_error{"No result in resulting JSON, probably error"};
    }
    auto d = res.as_object()["result"].as_object()["data"].as_array();
    ByteBuffer buf;
    buf.reserve(d.size());
    for (auto&& v : d) {
        buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
    }
    return ByteBufferToString(buf);
}

template <typename Context>
std::string GetStringFromIPFSAsync(const std::string& hash, IWalletClient& wallet_client,
                                   Context& context) {
    auto res = ParseJsonAndTest(wallet_client.LoadObjectFromIPFSAsync(hash, context));
    if (!res.as_object().contains("result")) {
        throw std::runtime_error{"No result in resulting JSON, probably error"};
    }
    auto d = res.as_object()["result"].as_object()["data"].as_array();
    ByteBuffer buf;
    buf.reserve(d.size());
    for (auto&& v : d) {
        buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
    }
    return ByteBufferToString(buf);
}

std::vector<ObjectWithContent> GetObjectsFromTreeMeta(const TreeMetaBlock& tree,
                                                      sourc3::IProgressReporter& progress,
                                                      IWalletClient& client) {
    std::vector<ObjectWithContent> objects;
    auto tree_content = GetStringFromIPFS(tree.hash.ipfs, client);
    objects.emplace_back(GIT_OBJECT_TREE, std::move(tree.hash.oid), std::move(tree.hash.ipfs),
                         std::move(tree_content));
    for (auto&& [oid, hash] : tree.entries) {
        auto file_content = GetStringFromIPFS(hash, client);
        objects.emplace_back(GIT_OBJECT_BLOB, std::move(oid), std::move(hash),
                             std::move(file_content));
        progress.AddProgress(1);
    }
    return objects;
}

template <typename Context>
std::vector<ObjectWithContent> GetObjectsFromTreeMetaAsync(const TreeMetaBlock& tree,
                                                           sourc3::IProgressReporter& progress,
                                                           IWalletClient& client,
                                                           Context& context) {
    namespace ba = boost::asio;
    std::vector<ObjectWithContent> objects;
    ba::spawn(context, [&](ba::yield_context context2) {
        auto tree_content = GetStringFromIPFSAsync(tree.hash.ipfs, client, context2);
        objects.emplace_back(GIT_OBJECT_TREE, std::move(tree.hash.oid), std::move(tree.hash.ipfs),
                             std::move(tree_content));
        for (auto&& [oid, hash] : tree.entries) {
            ba::spawn(context2, [&, hash = std::move(hash),
                                 oid = std::move(oid)](ba::yield_context context3) {
                auto file_content = GetStringFromIPFSAsync(hash, client, context3);
                objects.emplace_back(GIT_OBJECT_BLOB, std::move(oid), std::move(hash),
                                     std::move(file_content));
                progress.AddProgress(1);
            });
        }
    });
    return objects;
}

std::vector<ObjectWithContent> GetAllObjects(const std::string& root_ipfs_hash,
                                             sourc3::IProgressReporter& progress,
                                             IWalletClient& client) {
    std::vector<ObjectWithContent> objects;
    CommitMetaBlock commit(GetStringFromIPFS(root_ipfs_hash, client));
    auto commit_content = GetStringFromIPFS(commit.hash.ipfs, client);
    objects.emplace_back(GIT_OBJECT_COMMIT, std::move(commit.hash.oid), std::move(commit.hash.ipfs),
                         std::move(commit_content));
    progress.AddProgress(1);
    TreeMetaBlock tree(GetStringFromIPFS(commit.tree_meta_hash, client));
    auto tree_objects = GetObjectsFromTreeMeta(tree, progress, client);
    std::move(tree_objects.begin(), tree_objects.end(), std::back_inserter(objects));
    for (auto&& parent_hash : commit.parent_hashes) {
        auto parent_objects = GetAllObjects(parent_hash.ipfs, progress, client);
        std::move(parent_objects.begin(), parent_objects.end(), std::back_inserter(objects));
    }
    return objects;
}

template <typename Context>
std::vector<ObjectWithContent> GetAllObjectsAsync(const std::string& root_ipfs_hash,
                                                  sourc3::IProgressReporter& progress,
                                                  IWalletClient& client, Context& base_context) {
    namespace ba = boost::asio;
    std::vector<ObjectWithContent> objects;
    ba::spawn(base_context, [&objects, &root_ipfs_hash, &client,
                             &progress](IWalletClient::AsyncContext context) {
        CommitMetaBlock commit(GetStringFromIPFSAsync(root_ipfs_hash, client, context));
        ba::spawn(context, [&](IWalletClient::AsyncContext context2) {
            auto commit_content = GetStringFromIPFSAsync(commit.hash.ipfs, client, context2);
            objects.emplace_back(GIT_OBJECT_COMMIT, std::move(commit.hash.oid),
                                 std::move(commit.hash.ipfs), std::move(commit_content));
            progress.AddProgress(1);
            ba::spawn(context2, [&](IWalletClient::AsyncContext context3) {
                TreeMetaBlock tree(GetStringFromIPFSAsync(commit.tree_meta_hash, client, context3));
                auto tree_objects = GetObjectsFromTreeMetaAsync(tree, progress, client, context3);
                std::move(tree_objects.begin(), tree_objects.end(), std::back_inserter(objects));
                for (auto&& parent_hash : commit.parent_hashes) {
                    ba::spawn(context3, [&](IWalletClient::AsyncContext context4) {
                        auto parent_objects =
                            GetAllObjectsAsync(parent_hash.ipfs, progress, client, context4);
                        std::move(parent_objects.begin(), parent_objects.end(),
                                  std::back_inserter(objects));
                    });
                }
            });
        });
    });

    return objects;
}

std::vector<ObjectWithContent> GetUploadedObjects(const std::vector<sourc3::Ref>& refs,
                                                  IWalletClient& client,
                                                  sourc3::ReporterType reporter_type) {
    std::vector<ObjectWithContent> objects;
    auto progress =
        MakeProgress("Enumerate uploaded objects", client.GetUploadedObjectCount(), reporter_type);
    for (const auto& ref : refs) {
        auto ref_objects = GetAllObjects(ref.ipfs_hash, *progress, client);
        std::move(ref_objects.begin(), ref_objects.end(), std::back_inserter(objects));
    }
    progress->Done();
    return objects;
}

std::vector<ObjectWithContent> GetUploadedObjectsAsync(const std::vector<sourc3::Ref>& refs,
                                                       IWalletClient& client,
                                                       sourc3::ReporterType reporter_type,
                                                       boost::asio::io_context& context) {
    std::vector<ObjectWithContent> objects;
    auto progress =
        MakeProgress("Enumerate uploaded objects", client.GetUploadedObjectCount(), reporter_type);
    for (const auto& ref : refs) {
        auto ref_objects = GetAllObjectsAsync(ref.ipfs_hash, *progress, client, context);
        std::move(ref_objects.begin(), ref_objects.end(), std::back_inserter(objects));
    }
    progress->Done();
    return objects;
}

struct ObjectsAndMetas {
    std::vector<ObjectWithContent> objects;
    Metas metas;
};

ObjectsAndMetas GetAllObjectsWithMeta(const std::string& root_ipfs_hash,
                                      sourc3::IProgressReporter& progress, IWalletClient& client) {
    std::vector<ObjectWithContent> objects;
    unordered_map<string, variant<TreeMetaBlock, CommitMetaBlock>> metas;
    CommitMetaBlock commit(GetStringFromIPFS(root_ipfs_hash, client));
    metas[root_ipfs_hash] = commit;
    auto commit_content = GetStringFromIPFS(commit.hash.ipfs, client);
    objects.emplace_back(GIT_OBJECT_COMMIT, std::move(commit.hash.oid), std::move(commit.hash.ipfs),
                         std::move(commit_content));
    progress.AddProgress(1);
    TreeMetaBlock tree(GetStringFromIPFS(commit.tree_meta_hash, client));
    metas[commit.tree_meta_hash] = tree;
    auto tree_objects = GetObjectsFromTreeMeta(tree, progress, client);
    std::move(tree_objects.begin(), tree_objects.end(), std::back_inserter(objects));
    for (auto&& parent_hash : commit.parent_hashes) {
        auto [parent_objects, parent_metas] =
            GetAllObjectsWithMeta(parent_hash.ipfs, progress, client);
        std::move(parent_objects.begin(), parent_objects.end(), std::back_inserter(objects));
        for (auto&& [key, value] : parent_metas) {
            metas[std::move(key)] = std::move(value);
        }
    }
    return {std::move(objects), std::move(metas)};
}

template <typename Context>
ObjectsAndMetas GetAllObjectsWithMetaAsync(const std::string& root_ipfs_hash,
                                           sourc3::IProgressReporter& progress,
                                           IWalletClient& client, Context& base_context) {
    namespace ba = boost::asio;
    std::vector<ObjectWithContent> objects;
    unordered_map<string, variant<TreeMetaBlock, CommitMetaBlock>> metas;
    ba::spawn(base_context, [&](IWalletClient::AsyncContext context) {
        CommitMetaBlock commit(GetStringFromIPFSAsync(root_ipfs_hash, client, context));
        metas[root_ipfs_hash] = commit;
        ba::spawn(context, [&](IWalletClient::AsyncContext context2) {
            auto commit_content = GetStringFromIPFSAsync(commit.hash.ipfs, client, context2);
            objects.emplace_back(GIT_OBJECT_COMMIT, std::move(commit.hash.oid),
                                 std::move(commit.hash.ipfs), std::move(commit_content));
            progress.AddProgress(1);
            ba::spawn(context2, [&](IWalletClient::AsyncContext context3) {
                TreeMetaBlock tree(GetStringFromIPFSAsync(commit.tree_meta_hash, client, context3));
                metas[commit.tree_meta_hash] = tree;
                ba::spawn(context3, [&](IWalletClient::AsyncContext context4) {
                    auto tree_objects =
                        GetObjectsFromTreeMetaAsync(tree, progress, client, context4);
                    std::move(tree_objects.begin(), tree_objects.end(),
                              std::back_inserter(objects));
                    for (auto&& parent_hash : commit.parent_hashes) {
                        ba::spawn(context4, [&](IWalletClient::AsyncContext context5) {
                            auto [parent_objects, parent_metas] = GetAllObjectsWithMetaAsync(
                                parent_hash.ipfs, progress, client, context5);
                            std::move(parent_objects.begin(), parent_objects.end(),
                                      std::back_inserter(objects));
                            for (auto&& [key, value] : parent_metas) {
                                metas[std::move(key)] = std::move(value);
                            }
                        });
                    }
                });
            });
        });
    });
    return {std::move(objects), std::move(metas)};
}

ObjectsAndMetas GetUploadedObjectsWithMetas(const std::vector<sourc3::Ref>& refs,
                                            IWalletClient& client,
                                            sourc3::ReporterType reporter_type) {
    std::vector<ObjectWithContent> objects;
    unordered_map<string, variant<TreeMetaBlock, CommitMetaBlock>> metas;
    auto progress =
        MakeProgress("Enumerate uploaded objects", client.GetUploadedObjectCount(), reporter_type);
    for (const auto& ref : refs) {
        auto [ref_objects, ref_metas] = GetAllObjectsWithMeta(ref.ipfs_hash, *progress, client);
        std::move(ref_objects.begin(), ref_objects.end(), std::back_inserter(objects));
        for (auto&& [key, value] : ref_metas) {
            metas[std::move(key)] = std::move(value);
        }
    }
    progress->Done();
    return {std::move(objects), std::move(metas)};
}

ObjectsAndMetas GetUploadedObjectsWithMetasAsync(const std::vector<sourc3::Ref>& refs,
                                                 IWalletClient& client,
                                                 sourc3::ReporterType reporter_type,
                                                 boost::asio::io_context& context) {
    std::vector<ObjectWithContent> objects;
    unordered_map<string, variant<TreeMetaBlock, CommitMetaBlock>> metas;
    auto progress =
        MakeProgress("Enumerate uploaded objects", client.GetUploadedObjectCount(), reporter_type);
    for (const auto& ref : refs) {
        auto [ref_objects, ref_metas] =
            GetAllObjectsWithMetaAsync(ref.ipfs_hash, *progress, client, context);
        std::move(ref_objects.begin(), ref_objects.end(), std::back_inserter(objects));
        for (auto&& [key, value] : ref_metas) {
            metas[std::move(key)] = std::move(value);
        }
    }
    progress->Done();
    return {std::move(objects), std::move(metas)};
}

std::set<git_oid> GetOidsFromObjects(const std::vector<ObjectWithContent>& objects) {
    std::set<git_oid> oids;
    for (const auto& object : objects) {
        oids.insert(object.hash);
    }
    return oids;
}

void UploadObjects(ObjectCollector& collector, uint32_t& new_objects, uint32_t& new_metas,
                   Metas& metas, HashMapping& oid_to_ipfs, HashMapping& oid_to_meta,
                   sourc3::ReporterType reporter_type, IWalletClient& client) {
    auto progress =
        MakeProgress("Uploading objects to IPFS", collector.m_objects.size(), reporter_type);
    size_t i = 0;
    for (auto& obj : collector.m_objects) {
        if (obj.type == GIT_OBJECT_BLOB) {
            ++new_objects;
        } else {
            ++new_metas;
        }

        auto res = client.SaveObjectToIPFS(obj.GetData(), obj.GetSize());
        auto r = ParseJsonAndTest(res);
        auto hash_str = r.as_object()["result"].as_object()["hash"].as_string();
        obj.ipfsHash = ByteBuffer(hash_str.cbegin(), hash_str.cend());
        oid_to_ipfs[obj.oid] = std::string(hash_str.cbegin(), hash_str.cend());
        auto meta_object = GetMetaBlock(collector, obj, oid_to_meta, oid_to_ipfs);
        if (meta_object != nullptr) {
            auto meta_buffer = StringToByteBuffer(meta_object->Serialize());
            auto meta_res =
                ParseJsonAndTest(client.SaveObjectToIPFS(meta_buffer.data(), meta_buffer.size()));
            std::string hash =
                meta_res.as_object()["result"].as_object()["hash"].as_string().c_str();
            oid_to_meta[obj.oid] = hash;
            if (obj.type == GIT_OBJECT_COMMIT) {
                metas[hash] = *static_cast<CommitMetaBlock*>(meta_object.get());
            } else if (obj.type == GIT_OBJECT_TREE) {
                metas[hash] = *static_cast<TreeMetaBlock*>(meta_object.get());
            }
        }
        progress->UpdateProgress(++i);
    }
}

template <typename Context>
void UploadObjectsAsync(ObjectCollector& collector, uint32_t& new_objects, uint32_t& new_metas,
                        Metas& metas, HashMapping& oid_to_ipfs, HashMapping& oid_to_meta,
                        sourc3::ReporterType reporter_type, IWalletClient& client,
                        Context& base_context) {
    auto progress =
        MakeProgress("Uploading objects to IPFS", collector.m_objects.size(), reporter_type);
    size_t i = 0;
    for (auto& obj : collector.m_objects) {
        if (obj.type == GIT_OBJECT_BLOB) {
            ++new_objects;
        } else {
            ++new_metas;
        }
        boost::asio::spawn(base_context, [&](IWalletClient::AsyncContext context) {
            auto res = client.SaveObjectToIPFSAsync(obj.GetData(), obj.GetSize(), context);
            auto r = ParseJsonAndTest(res);
            auto hash_str = r.as_object()["result"].as_object()["hash"].as_string();
            obj.ipfsHash = ByteBuffer(hash_str.cbegin(), hash_str.cend());
            oid_to_ipfs[obj.oid] = std::string(hash_str.cbegin(), hash_str.cend());
            auto meta_object = GetMetaBlock(collector, obj, oid_to_meta, oid_to_ipfs);
            if (meta_object != nullptr) {
                auto meta_buffer = StringToByteBuffer(meta_object->Serialize());
                auto meta_res = ParseJsonAndTest(
                    client.SaveObjectToIPFSAsync(meta_buffer.data(), meta_buffer.size(), context));
                std::string hash =
                    meta_res.as_object()["result"].as_object()["hash"].as_string().c_str();
                oid_to_meta[obj.oid] = hash;
                if (obj.type == GIT_OBJECT_COMMIT) {
                    metas[hash] = *static_cast<CommitMetaBlock*>(meta_object.get());
                } else if (obj.type == GIT_OBJECT_TREE) {
                    metas[hash] = *static_cast<TreeMetaBlock*>(meta_object.get());
                }
            }
            progress->UpdateProgress(++i);
        });
    }
}

}  // namespace

IEngine::CommandResult FullIPFSEngine::DoCommand(std::string_view command,
                                                 std::vector<std::string_view>& args) {
    auto it = find_if(begin(commands_), end(commands_), [&](const auto& c) {
        return command == c.command;
    });
    if (it == end(commands_)) {
        cerr << "Unknown command: " << command << endl;
        return CommandResult::Failed;
    }
    return invoke(it->action, this, args);
}

IEngine::CommandResult FullIPFSEngine::DoList(const vector<string_view>&) {
    auto refs = RequestRefs();

    for (const auto& r : refs) {
        cout << sourc3::ToString(r.target) << " " << r.name << '\n';
    }
    if (!refs.empty()) {
        cout << "@" << refs.back().name << " HEAD\n";
    }

    return CommandResult::Ok;
}

IEngine::CommandResult FullIPFSEngine::DoOption(const vector<string_view>& args) {
    static string_view results[] = {"error invalid value", "ok", "unsupported"};

    auto res = options_.Set(args[1], args[2]);

    cout << results[size_t(res)];
    return CommandResult::Ok;
}

IEngine::CommandResult FullIPFSEngine::DoFetch(const vector<std::string_view>& args) {
    using namespace sourc3;
    std::set<std::string> object_hashes;
    object_hashes.emplace(args[1].data(), args[1].size());
    size_t depth = 1;
    std::set<std::string> received_objects;

    auto enuque_object = [&](const std::string& oid) {
        if (received_objects.find(oid) == received_objects.end()) {
            object_hashes.insert(oid);
        }
    };

    git::RepoAccessor accessor(client_.GetRepoDir());
    size_t total_objects = 0;

    auto objects = options_.is_async
                       ? GetUploadedObjectsAsync(RequestRefs(), client_, options_.progress,
                                                 client_.GetContext())
                       : GetUploadedObjects(RequestRefs(), client_, options_.progress);
    for (const auto& obj : objects) {
        if (git_odb_exists(*accessor.m_odb, &obj.hash) != 0) {
            received_objects.insert(ToString(obj.hash));
            ++total_objects;
        }
    }
    auto progress = sourc3::MakeProgress(
        "Receiving objects", total_objects - received_objects.size(), options_.progress);
    size_t done = 0;
    while (!object_hashes.empty()) {
        auto it_to_receive = object_hashes.begin();
        const auto& object_to_receive = *it_to_receive;

        git_oid oid;
        git_oid_fromstr(&oid, object_to_receive.data());

        auto it = std::find_if(objects.begin(), objects.end(), [&](auto&& o) {
            return o.hash == oid;
        });
        if (it == objects.end()) {
            received_objects.insert(object_to_receive);  // move to received
            object_hashes.erase(it_to_receive);
            continue;
        }
        received_objects.insert(object_to_receive);

        auto buf = it->content;
        git_oid res_oid;
        auto type = it->GetObjectType();
        git_oid r;
        git_odb_hash(&r, buf.data(), buf.size(), type);
        if (r != oid) {
            // invalid hash
            return CommandResult::Failed;
        }
        if (git_odb_write(&res_oid, *accessor.m_odb, buf.data(), buf.size(), type) < 0) {
            return CommandResult::Failed;
        }
        if (type == GIT_OBJECT_TREE) {
            git::Tree tree;
            git_tree_lookup(tree.Addr(), *accessor.m_repo, &oid);

            auto count = git_tree_entrycount(*tree);
            for (size_t i = 0; i < count; ++i) {
                auto* entry = git_tree_entry_byindex(*tree, i);
                auto s = ToString(*git_tree_entry_id(entry));
                enuque_object(s);
            }
        } else if (type == GIT_OBJECT_COMMIT) {
            git::Commit commit;
            git_commit_lookup(commit.Addr(), *accessor.m_repo, &oid);
            if (depth < options_.depth || options_.depth == Options::kInfiniteDepth) {
                auto count = git_commit_parentcount(*commit);
                for (unsigned i = 0; i < count; ++i) {
                    auto* id = git_commit_parent_id(*commit, i);
                    auto s = ToString(*id);
                    enuque_object(s);
                }
                ++depth;
            }
            enuque_object(ToString(*git_commit_tree_id(*commit)));
        }
        progress->UpdateProgress(++done);

        object_hashes.erase(it_to_receive);
    }
    return CommandResult::Batch;
}

IEngine::CommandResult FullIPFSEngine::DoPush(const vector<std::string_view>& args) {
    using namespace sourc3;
    ObjectCollector collector(client_.GetRepoDir());
    std::vector<Refs> refs;
    std::vector<git_oid> local_refs;
    bool is_forced = false;
    for (size_t i = 1; i < args.size(); ++i) {
        auto& arg = args[i];
        auto p = arg.find(':');
        auto& r = refs.emplace_back();
        is_forced = arg[0] == '+';
        size_t start_index = is_forced ? 1 : 0;
        r.localRef = arg.substr(start_index, p - start_index);
        r.remoteRef = arg.substr(p + 1);
        git::Reference local_ref;
        if (git_reference_lookup(local_ref.Addr(), *collector.m_repo, r.localRef.c_str()) < 0) {
            cerr << "Local reference \'" << r.localRef << "\' doesn't exist" << endl;
            return CommandResult::Failed;
        }
        auto& lr = local_refs.emplace_back();
        git_oid_cpy(&lr, git_reference_target(*local_ref));
    }

    boost::asio::io_context& context = client_.GetContext();

    auto remote_refs = RequestRefs();
    auto [uploaded_objects, metas] =
        (options_.is_async
             ? GetUploadedObjectsWithMetasAsync(remote_refs, client_, options_.progress, context)
             : GetUploadedObjectsWithMetas(remote_refs, client_, options_.progress));
    auto uploaded_oids = GetOidsFromObjects(uploaded_objects);
    std::vector<git_oid> merge_bases;
    for (const auto& remote_ref : remote_refs) {
        for (const auto& local_ref : local_refs) {
            auto& base = merge_bases.emplace_back();
            git_merge_base(&base, *collector.m_repo, &remote_ref.target, &local_ref);
        }
    }

    collector.Traverse(refs, merge_bases);

    auto& objs = collector.m_objects;
    std::sort(objs.begin(), objs.end(), [](auto&& left, auto&& right) {
        return left.oid < right.oid;
    });
    {
        auto it = std::unique(objs.begin(), objs.end(), [](auto&& left, auto& right) {
            return left.oid == right.oid;
        });
        objs.erase(it, objs.end());
    }
    {
        auto non_blob = std::partition(objs.begin(), objs.end(), [](const ObjectInfo& obj) {
            return obj.type == GIT_OBJECT_BLOB;
        });
        auto commits = std::partition(non_blob, objs.end(), [](const ObjectInfo& obj) {
            return obj.type == GIT_OBJECT_TREE;
        });
        SortCommitsByParents(commits, objs.end(), collector.m_repo);
    }

    for (auto& obj : collector.m_objects) {
        if (uploaded_oids.find(obj.oid) != uploaded_oids.end()) {
            obj.selected = true;
        }
    }

    {
        auto it = std::remove_if(objs.begin(), objs.end(), [](const auto& o) {
            return o.selected;
        });
        objs.erase(it, objs.end());
    }

    State prev_state;
    {
        auto state = ParseJsonAndTest(client_.LoadActualState());
        if (!state.is_object()) {
            cerr << "Cannot parse object state JSON: \'" << state << "\'" << endl;
            return CommandResult::Failed;
        }
        auto& state_obj = state.as_object();
        if (!state_obj.contains("hash")) {
            cerr << "Repo state not consists all objects.";
            if (state_obj.contains("error")) {
                cerr << " Error: " << state_obj["error"];
            }
            cerr << std::endl;
            return CommandResult::Failed;
        }
        auto state_str = ByteBufferToString(FromHex(state_obj["hash"].as_string()));
        prev_state.hash = state_str;
    }

    HashMapping oid_to_meta;
    std::vector<GitIdWithIPFS> prev_commits_parents;
    if (!std::all_of(prev_state.hash.begin(), prev_state.hash.end(), [](char c) {
            return c == '\0';
        })) {
        auto refs_file = GetStringFromIPFS(prev_state.hash, client_);
        oid_to_meta = ParseRefHashed(refs_file);
        for (const auto& [oid, hash] : oid_to_meta) {
            prev_commits_parents.emplace_back(oid, hash);
        }

        auto oid_copy = oid_to_meta;
        for (const auto& meta_hashes : oid_copy) {
            CommitMetaBlock commit(GetStringFromIPFS(meta_hashes.second, client_));
            TreeMetaBlock tree(GetStringFromIPFS(commit.tree_meta_hash, client_));
            oid_to_meta[tree.hash.oid] = commit.tree_meta_hash;
        }
    }

    for (const auto& [hash, meta] : metas) {
        auto oid = std::visit(
            [](const auto& value) {
                return value.hash.oid;
            },
            meta);
        oid_to_meta[oid] = hash;
    }

    HashMapping oid_to_ipfs;

    for (const auto& obj : uploaded_objects) {
        oid_to_ipfs[obj.hash] = obj.ipfs_hash;
    }

    uint32_t new_objects = 0;
    uint32_t new_metas = 0;
    {
        if (options_.is_async) {
            UploadObjectsAsync(collector, new_objects, new_metas, metas, oid_to_ipfs, oid_to_meta,
                               options_.progress, client_, context);
        } else {
            UploadObjects(collector, new_objects, new_metas, metas, oid_to_ipfs, oid_to_meta,
                          options_.progress, client_);
        }
    }
    if (!is_forced && !CheckCommitsLinking(metas, collector.m_refs, oid_to_meta)) {
        cerr << "Commits linking wrong, looks like you use force push "
                "without `--force` flag"
             << endl;
        return CommandResult::Failed;
    }
    std::string new_refs_content = CreateRefsFile(collector.m_refs, oid_to_meta);
    State new_state;
    auto new_refs_buffer = StringToByteBuffer(new_refs_content);
    auto new_state_res =
        ParseJsonAndTest(client_.SaveObjectToIPFS(new_refs_buffer.data(), new_refs_buffer.size()));
    new_state.hash = new_state_res.as_object()["result"].as_object()["hash"].as_string().c_str();
    {
        auto progress = MakeProgress("Uploading metadata to blockchain", 1, options_.progress);
        ParseJsonAndTest(client_.PushObjects(prev_state, new_state, new_objects, new_metas));
        progress->AddProgress(1);
    }
    {
        auto progress = MakeProgress("Waiting for the transaction completion",
                                     client_.GetTransactionCount(), options_.progress);

        auto res = client_.WaitForCompletion([&](size_t d, const auto& error) {
            if (error.empty()) {
                progress->UpdateProgress(d);
            } else {
                progress->Failed(error);
            }
        });
        cout << (res ? "ok " : "error ") << refs[0].remoteRef << '\n';
    }

    return CommandResult::Batch;
}

IEngine::CommandResult FullIPFSEngine::DoCapabilities(
    [[maybe_unused]] const vector<std::string_view>& args) {
    for (auto ib = begin(commands_) + 1, ie = end(commands_); ib != ie; ++ib) {
        cout << ib->command << '\n';
    }

    return CommandResult::Ok;
}

std::vector<sourc3::Ref> FullIPFSEngine::RequestRefs() {
    auto actual_state = ParseJsonAndTest(client_.LoadActualState());
    auto actual_state_str = actual_state.as_object()["hash"].as_string();
    if (std::all_of(actual_state_str.begin(), actual_state_str.end(), [](char c) {
            return c == '0';
        })) {
        return {};
    }
    return ParseRefs(
        GetStringFromIPFS(ByteBufferToString(sourc3::FromHex(actual_state_str)), client_));
}

IEngine::BaseOptions::SetResult FullIPFSEngine::Options::Set(std::string_view option,
                                                             std::string_view value) {
    if (option == "progress") {
        if (value == "true") {
            progress = sourc3::ReporterType::Progress;
        } else if (value == "false") {
            progress = sourc3::ReporterType::NoOp;
        } else {
            return SetResult::InvalidValue;
        }
        return SetResult::Ok;
    } else if (option == "is_async") {
        SetBool(is_async, value);
    } /* else if (option == "verbosity") {
         char* endPos;
         auto v = std::strtol(value.data(), &endPos, 10);
         if (endPos == value.data()) {
             return SetResult::InvalidValue;
         }
         verbosity = v;
         return SetResult::Ok;
     } else if (option == "depth") {
         char* endPos;
         auto v = std::strtoul(value.data(), &endPos, 10);
         if (endPos == value.data()) {
             return SetResult::InvalidValue;
         }
         depth = v;
         return SetResult::Ok;
     }*/

    return SetResult::Unsupported;
}
