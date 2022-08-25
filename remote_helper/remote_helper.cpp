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

#define _CRT_SECURE_NO_WARNINGS  // getenv
#include <algorithm>
#include <boost/algorithm/hex.hpp>
#include <boost/filesystem.hpp>
#include <boost/json.hpp>
#include <boost/program_options.hpp>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <map>
#include <optional>
#include <sstream>
#include <stack>
#include <string>
#include <string_view>
#include <vector>
#include <unordered_map>

#include "object_collector.h"
#include "utils.h"
#include "git_utils.h"
#include "version.h"
#include "wallet_client.h"

namespace po = boost::program_options;
namespace json = boost::json;
using namespace std;
using namespace sourc3;

#define PROTO_NAME "sourc3"

namespace {
class ProgressReporter {
public:
    ProgressReporter(std::string_view title, size_t total)
        : title_(title), total_(total) {
        UpdateProgress(0);
    }

    ~ProgressReporter() {
        if (failure_reason_.empty()) {
            Done();
        } else {
            StopProgress(failure_reason_);
        }
    }

    void UpdateProgress(size_t done) {
        done_ = done;
        ShowProgress("\r");
    }

    void AddProgress(size_t done) {
        done_ += done;
        ShowProgress("\r");
    }

    void Done() {
        StopProgress("done");
    }

    void Failed(const std::string& failure) {
        failure_reason_ = failure;
    }

    void StopProgress(std::string_view result) {
        std::stringstream ss;
        ss << ", " << result << ".\n";
        ShowProgress(ss.str());
    }

private:
    void ShowProgress(std::string_view eol) {
        std::stringstream ss;
        ss << title_ << ": ";
        if (total_ > 0) {
            size_t percent = done_ * 100 / total_;
            ss << percent << "%"
               << " (" << done_ << "/" << total_ << ")";
        } else {
            ss << done_;
        }
        ss << eol;
        cerr << ss.str();
        cerr.flush();
    }

private:
    std::string_view title_;
    std::string failure_reason_;
    size_t done_ = 0;
    size_t total_;
};

struct ObjectWithContent : public GitObject {
    std::string ipfs_hash;
    std::string content;
};

struct GitIdWithIPFS {
    GitIdWithIPFS() = default;

    GitIdWithIPFS(git_oid oid, string ipfs)
        : oid(std::move(oid)), ipfs(std::move(ipfs)) {
    }

    git_oid oid;
    std::string ipfs;

    std::string ToString() const {
        return ipfs + "\n" + ::ToString(oid);
    }

    bool operator==(const GitIdWithIPFS& other) const {
        return (oid == other.oid) && (ipfs == other.ipfs);
    }
};

struct MetaBlock {
    GitIdWithIPFS hash;

    virtual ~MetaBlock() = default;

    virtual std::string Serialize() const = 0;
};

struct CommitMetaBlock final : MetaBlock {
    std::string tree_meta_hash;
    std::vector<GitIdWithIPFS> parent_hashes;

    string Serialize() const final {
        std::string data = hash.ToString() + "\n" + tree_meta_hash + "\n";
        for (const auto& parent : parent_hashes) {
            data += parent.ToString() + "\n";
        }
        return data;
    }
};

struct TreeMetaBlock final : MetaBlock {
    std::vector<GitIdWithIPFS> entries;

    string Serialize() const final {
        std::string data = hash.ToString() + "\n";
        for (const auto& entry : entries) {
            data += entry.ToString() + "\n";
        }
        return data;
    }
};

template <typename String>
ByteBuffer FromHex(const String& s) {
    ByteBuffer res;
    res.reserve(s.size() / 2);
    boost::algorithm::unhex(s.begin(), s.end(), std::back_inserter(res));
    return res;
}

vector<string_view> ParseArgs(std::string_view args_sv) {
    vector<string_view> args;
    while (!args_sv.empty()) {
        auto p = args_sv.find(' ');
        auto ss = args_sv.substr(0, p);
        args_sv.remove_prefix(p == string_view::npos ? ss.size()
                                                     : ss.size() + 1);
        if (!ss.empty()) {
            args.emplace_back(ss);
        }
    }
    return args;
}

struct OidHasher {
    std::hash<std::string> hasher;
    size_t operator()(const git_oid& oid) const {
        return hasher(ToString(oid));
    }
};

using HashMapping = std::unordered_map<git_oid, std::string, OidHasher>;

json::value ParseJsonAndTest(json::string_view sv) {
    auto r = json::parse(sv);
    if (!r.is_object()) {
        throw std::runtime_error{sv.to_string() + " isn't an object."};
    }

    if (const auto* error = r.as_object().if_contains("error"); error) {
        throw std::runtime_error(
            error->as_object().at("message").as_string().c_str());
    }
    return r;
}

std::string CreateRefsFile(const std::vector<Ref>& refs,
                           const HashMapping& mapping) {
    std::string file;
    for (const auto& ref : refs) {
        if (mapping.count(ref.target) == 0) {
            throw std::runtime_error{"Some refs are not used!"};
        }
        file += ref.name + "\t" + mapping.at(ref.target) + "\t" +
                ToString(ref.target) + "\n";
    }
    return file;
}

std::vector<Ref> ParseRefs(const std::string& refs_file) {
    std::vector<Ref> refs;
    if (refs_file.empty()) {
        return refs;
    }

    std::istringstream ss(refs_file);
    std::string ref_name;
    std::string target_ipfs;
    std::string target_oid;
    while (ss >> ref_name) {
        if (ref_name.empty()) {
            break;
        }
        ss >> target_ipfs;
        ss >> target_oid;
        refs.push_back(
            Ref{std::move(ref_name), target_ipfs, FromString(target_oid)});
    }
    return refs;
}

HashMapping ParseRefHashed(const std::string& refs_file) {
    HashMapping mapping;
    if (refs_file.empty()) {
        return mapping;
    }

    std::istringstream ss(refs_file);
    std::string ref_name;
    std::string target_ipfs;
    std::string target_oid;
    while (ss >> ref_name) {
        if (ref_name.empty()) {
            break;
        }
        ss >> target_ipfs;
        ss >> target_oid;
        mapping[FromString(target_oid)] = std::move(target_ipfs);
    }
    return mapping;
}

std::unique_ptr<CommitMetaBlock> GetCommitMetaBlock(
    const git::Commit& commit, const HashMapping& oid_to_meta,
    const HashMapping& oid_to_ipfs) {
    auto block = std::make_unique<CommitMetaBlock>();
    git_commit* raw_commit = *commit;
    const auto* commit_id = git_commit_id(raw_commit);
    block->hash.oid = *commit_id;
    block->hash.ipfs = oid_to_ipfs.at(*commit_id);
    if (oid_to_meta.count(*git_commit_tree_id(raw_commit)) == 0) {
        throw std::runtime_error{"Cannot find tree meta on IPFS"};
    }
    block->tree_meta_hash = oid_to_meta.at(*git_commit_tree_id(raw_commit));
    unsigned int parents_count = git_commit_parentcount(raw_commit);
    for (unsigned int i = 0; i < parents_count; ++i) {
        auto* parent_id = git_commit_parent_id(raw_commit, i);
        if (oid_to_meta.count(*parent_id) > 0) {
            block->parent_hashes.emplace_back(*parent_id,
                                              oid_to_meta.at(*parent_id));
        } else {
            throw std::runtime_error{
                "Something wrong with push, "
                "we cannot find meta object for parent " +
                ToString(*parent_id)};
        }
    }
    return block;
}

std::unique_ptr<TreeMetaBlock> GetTreeMetaBlock(
    const git::Tree& tree, const HashMapping& oid_to_ipfs) {
    git_tree* raw_tree = *tree;
    const auto* tree_id = git_tree_id(raw_tree);
    auto block = std::make_unique<TreeMetaBlock>();
    block->hash = {*tree_id, oid_to_ipfs.at(*tree_id)};
    for (size_t i = 0, size = git_tree_entrycount(raw_tree); i < size; ++i) {
        const auto& entry_id =
            *git_tree_entry_id(git_tree_entry_byindex(raw_tree, i));
        block->entries.emplace_back(entry_id, oid_to_ipfs.at(entry_id));
    }
    return block;
}

std::unique_ptr<MetaBlock> GetMetaBlock(
    const sourc3::git::RepoAccessor& accessor, const ObjectInfo& obj,
    const HashMapping& oid_to_meta, const HashMapping& oid_to_ipfs) {
    if (obj.type == GIT_OBJECT_COMMIT) {
        git::Commit commit;
        git_commit_lookup(commit.Addr(), *accessor.m_repo, &obj.oid);
        return GetCommitMetaBlock(commit, oid_to_meta, oid_to_ipfs);
    } else if (obj.type == GIT_OBJECT_TREE) {
        git::Tree tree;
        git_tree_lookup(tree.Addr(), *accessor.m_repo, &obj.oid);
        return GetTreeMetaBlock(tree, oid_to_ipfs);
    }

    return nullptr;
}

std::string GetStringFromIPFS(const std::string& hash,
                              SimpleWalletClient& wallet_client) {
    auto res = ParseJsonAndTest(wallet_client.LoadObjectFromIPFS(hash));
    if (!res.as_object().contains("result")) {
        throw std::runtime_error{""};
    }
    auto d = res.as_object()["result"].as_object()["data"].as_array();
    ByteBuffer buf;
    buf.reserve(d.size());
    for (auto&& v : d) {
        buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
    }
    return ByteBufferToString(buf);
}

ObjectWithContent CreateObject(int8_t type, git_oid hash,
                               std::string ipfs_hash, std::string content) {
    ObjectWithContent obj;
    obj.hash = std::move(hash);
    obj.type = type;
    obj.data_size = static_cast<uint32_t>(content.size());
    obj.ipfs_hash = std::move(ipfs_hash);
    obj.content = std::move(content);
    return obj;
}

}  // namespace

class RemoteHelper {
public:
    enum struct CommandResult { Ok, Failed, Batch };
    explicit RemoteHelper(SimpleWalletClient& wc) : wallet_client_{wc} {
    }

    CommandResult DoCommand(string_view command, vector<string_view>& args) {
        auto it = find_if(begin(commands_), end(commands_), [&](const auto& c) {
            return command == c.command;
        });
        if (it == end(commands_)) {
            cerr << "Unknown command: " << command << endl;
            return CommandResult::Failed;
        }
        return std::invoke(it->action, this, args);
    }

    CommandResult DoList([[maybe_unused]] const vector<string_view>& args) {
        auto refs = RequestRefs();

        for (const auto& r : refs) {
            cout << ToString(r.target) << " " << r.name << '\n';
        }
        if (!refs.empty()) {
            cout << "@" << refs.back().name << " HEAD\n";
        }

        return CommandResult::Ok;
    }

    CommandResult DoOption([[maybe_unused]] const vector<string_view>& args) {
        static string_view results[] = {"error invalid value", "ok",
                                        "unsupported"};

        auto res = options_.Set(args[1], args[2]);

        cout << results[size_t(res)];
        return CommandResult::Ok;
    }

    CommandResult DoFetch(const vector<string_view>& args) {
        std::set<std::string> object_hashes;
        object_hashes.emplace(args[1].data(), args[1].size());
        size_t depth = 1;
        std::set<std::string> received_objects;

        auto enuque_object = [&](const std::string& oid) {
            if (received_objects.find(oid) == received_objects.end()) {
                object_hashes.insert(oid);
            }
        };

        git::RepoAccessor accessor(wallet_client_.GetRepoDir());
        size_t total_objects = 0;

        std::vector<ObjectWithContent> objects =
            GetUploadedObjects(RequestRefs());
        for (const auto& obj : objects) {
            if (git_odb_exists(*accessor.m_odb, &obj.hash) != 0) {
                received_objects.insert(ToString(obj.hash));
                ++total_objects;
            }
        }
        auto progress = MakeProgress("Receiving objects",
                                     total_objects - received_objects.size());
        size_t done = 0;
        while (!object_hashes.empty()) {
            auto it_to_receive = object_hashes.begin();
            const auto& object_to_receive = *it_to_receive;

            git_oid oid;
            git_oid_fromstr(&oid, object_to_receive.data());

            auto it =
                std::find_if(objects.begin(), objects.end(), [&](auto&& o) {
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
            if (git_odb_write(&res_oid, *accessor.m_odb, buf.data(), buf.size(),
                              type) < 0) {
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
                if (depth < options_.depth ||
                    options_.depth == Options::kInfiniteDepth) {
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
            if (progress) {
                progress->UpdateProgress(++done);
            }

            object_hashes.erase(it_to_receive);
        }
        return CommandResult::Batch;
    }

    CommandResult DoPush(const vector<string_view>& args) {
        ObjectCollector collector(wallet_client_.GetRepoDir());
        std::vector<Refs> refs;
        std::vector<git_oid> local_refs;
        bool is_forced = false;
        for (size_t i = 1; i < args.size(); ++i) {
            auto& arg = args[i];
            auto p = arg.find(':');
            auto& r = refs.emplace_back();
            r.localRef = arg.substr(0, p);
            is_forced = r.localRef[0] == '+';
            r.remoteRef = arg.substr(p + 1);
            git::Reference local_ref;
            if (git_reference_lookup(local_ref.Addr(), *collector.m_repo,
                                     r.localRef.c_str()) < 0) {
                cerr << "Local reference \'" << r.localRef << "\' doesn't exist"
                     << endl;
                return CommandResult::Failed;
            }
            auto& lr = local_refs.emplace_back();
            git_oid_cpy(&lr, git_reference_target(*local_ref));
        }

        auto remote_refs = RequestRefs();
        auto uploaded_objects = GetUploadedObjects(remote_refs);
        auto uploaded_oids =
            GetOidsFromObjects(uploaded_objects);
        std::vector<git_oid> merge_bases;
        for (const auto& remote_ref : remote_refs) {
            for (const auto& local_ref : local_refs) {
                auto& base = merge_bases.emplace_back();
                git_merge_base(&base, *collector.m_repo, &remote_ref.target,
                               &local_ref);
            }
        }

        collector.Traverse(refs, merge_bases);

        auto& objs = collector.m_objects;
        std::sort(objs.begin(), objs.end(), [](auto&& left, auto&& right) {
            return left.oid < right.oid;
        });
        {
            auto it = std::unique(objs.begin(), objs.end(),
                                  [](auto&& left, auto& right) {
                                      return left.oid == right.oid;
                                  });
            objs.erase(it, objs.end());
        }
        {
            auto non_blob = std::partition(
                objs.begin(), objs.end(), [](const ObjectInfo& obj) {
                    return obj.type == GIT_OBJECT_BLOB;
                });
            auto commits =
                std::partition(non_blob, objs.end(), [](const ObjectInfo& obj) {
                    return obj.type == GIT_OBJECT_TREE;
                });
            std::sort(
                commits, objs.end(),
                [&collector](const ObjectInfo& lhs, const ObjectInfo& rhs) {
                    git::Commit rhs_commit;
                    git_commit_lookup(rhs_commit.Addr(), *collector.m_repo,
                                      &rhs.oid);
                    unsigned int parents_count =
                        git_commit_parentcount(*rhs_commit);
                    for (unsigned int i = 0; i < parents_count; ++i) {
                        if (*git_commit_parent_id(*rhs_commit, i) == lhs.oid) {
                            return true;
                        }
                    }
                    return false;
                });
        }

        for (auto& obj : collector.m_objects) {
            if (uploaded_oids.find(obj.oid) != uploaded_oids.end()) {
                obj.selected = true;
            }
        }

        {
            auto it =
                std::remove_if(objs.begin(), objs.end(), [](const auto& o) {
                    return o.selected;
                });
            objs.erase(it, objs.end());
        }

        State prev_state;
        {
            auto state = ParseJsonAndTest(wallet_client_.LoadActualState());
            if (!state.is_object()) {
                cerr << "Cannot parse object state JSON: \'" << state << "\'"
                     << endl;
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
            auto state_str =
                ByteBufferToString(FromHex(state_obj["hash"].as_string()));
            prev_state.hash = state_str;
        }

        HashMapping oid_to_meta;
        std::vector<GitIdWithIPFS> prev_commits_parents;
        if (!std::all_of(prev_state.hash.begin(), prev_state.hash.end(),
                         [](char c) {
                             return c == '\0';
                         })) {
            auto refs_file = GetStringFromIPFS(prev_state.hash, wallet_client_);
            oid_to_meta = ParseRefHashed(refs_file);
            for (const auto& [oid, hash] : oid_to_meta) {
                prev_commits_parents.emplace_back(oid, hash);
            }
        }

        HashMapping oid_to_ipfs;

        for (const auto& obj : uploaded_objects) {
            oid_to_ipfs[obj.hash] = obj.ipfs_hash;
        }

        uint32_t new_objects = 0;
        uint32_t new_metas = 0;
        {
            auto progress = MakeProgress("Uploading objects to IPFS",
                                         collector.m_objects.size());
            size_t i = 0;
            for (auto& obj : collector.m_objects) {
                if (obj.type == GIT_OBJECT_BLOB) {
                    ++new_objects;
                } else {
                    ++new_metas;
                }

                auto res = wallet_client_.SaveObjectToIPFS(obj.GetData(),
                                                           obj.GetSize());
                auto r = ParseJsonAndTest(res);
                auto hash_str =
                    r.as_object()["result"].as_object()["hash"].as_string();
                obj.ipfsHash = ByteBuffer(hash_str.cbegin(), hash_str.cend());
                oid_to_ipfs[obj.oid] =
                    std::string(hash_str.cbegin(), hash_str.cend());
                std::cerr << "Process object " << ToString(obj.oid) << " with IPFS hash: " << ByteBufferToString(obj.ipfsHash) << " with type: " << obj.type << std::endl;
                auto meta_object =
                    GetMetaBlock(collector, obj, oid_to_meta, oid_to_ipfs);
                if (meta_object != nullptr) {
                    if (obj.type == GIT_OBJECT_COMMIT && !is_forced &&
                        !prev_commits_parents.empty()) {
                        // We need to check linking of commits
                        auto commit = static_cast<CommitMetaBlock*>(
                                meta_object.get());
                        if (!std::all_of(
                                commit->parent_hashes.begin(),
                                commit->parent_hashes.end(),
                                [&prev_commits_parents](
                                    const GitIdWithIPFS& obj) {
                                    return std::any_of(
                                        prev_commits_parents.begin(),
                                        prev_commits_parents.end(),
                                        [&obj](const GitIdWithIPFS& other) {
                                            return other == obj;
                                        });
                                })) {
                            cerr << "Seems like commit history wrong "
                                    "linked. "
                                    "If you want to rewrite history, use "
                                    "`--force` flag"
                                 << endl;
                            return CommandResult::Failed;
                        }
                        prev_commits_parents = commit->parent_hashes;
                    }

                    auto meta_buffer =
                        StringToByteBuffer(meta_object->Serialize());
                    auto meta_res =
                        ParseJsonAndTest(wallet_client_.SaveObjectToIPFS(
                            meta_buffer.data(), meta_buffer.size()));
                    std::string hash = meta_res.as_object()["result"]
                                           .as_object()["hash"]
                                           .as_string()
                                           .c_str();
                    oid_to_meta[obj.oid] = hash;
                }
                if (progress) {
                    progress->UpdateProgress(++i);
                }
            }
        }
        std::string new_refs_content =
            CreateRefsFile(collector.m_refs, oid_to_meta);
        State new_state;
        auto new_refs_buffer = StringToByteBuffer(new_refs_content);
        auto new_state_res = ParseJsonAndTest(wallet_client_.SaveObjectToIPFS(
            new_refs_buffer.data(), new_refs_buffer.size()));
        new_state.hash = new_state_res.as_object()["result"]
                             .as_object()["hash"]
                             .as_string()
                             .c_str();
        {
            auto progress = MakeProgress("Uploading metadata to blockchain", 1);
            ParseJsonAndTest(wallet_client_.PushObjects(
                prev_state, new_state, new_objects, new_metas));
            if (progress) {
                progress->AddProgress(1);
            }
        }
        {
            auto progress =
                MakeProgress("Waiting for the transaction completion",
                             wallet_client_.GetTransactionCount());

            auto res = wallet_client_.WaitForCompletion(
                [&](size_t d, const auto& error) {
                    if (progress) {
                        if (error.empty()) {
                            progress->UpdateProgress(d);
                        } else {
                            progress->Failed(error);
                        }
                    }
                });
            cout << (res ? "ok " : "error ") << refs[0].remoteRef << '\n';
        }

        return CommandResult::Batch;
    }

    CommandResult DoCapabilities(
        [[maybe_unused]] const vector<string_view>& args) {
        for (auto ib = begin(commands_) + 1, ie = end(commands_); ib != ie;
             ++ib) {
            cout << ib->command << '\n';
        }

        return CommandResult::Ok;
    }

private:
    std::optional<ProgressReporter> MakeProgress(std::string_view title,
                                                 size_t total) {
        if (options_.progress) {
            return std::optional<ProgressReporter>(std::in_place, title, total);
        }

        return {};
    }

    std::vector<Ref> RequestRefs() {
        auto actual_state = ParseJsonAndTest(wallet_client_.LoadActualState());
        auto actual_state_str = actual_state.as_object()["hash"].as_string();
        if (std::all_of(actual_state_str.begin(), actual_state_str.end(),
                        [](char c) {
                            return c == '0';
                        })) {
            return {};
        }
        return ParseRefs(GetStringFromIPFS(
            ByteBufferToString(FromHex(actual_state_str)), wallet_client_));
    }

    std::vector<ObjectWithContent> GetUploadedObjects(
        const std::vector<Ref>& refs) {
        std::vector<ObjectWithContent> objects;
        auto progress = MakeProgress("Enumerate uploaded objects",
                                     wallet_client_.GetUploadedObjectCount());
        for (const auto& ref : refs) {
            auto ref_objects = GetAllObjects(ref.ipfs_hash, progress);
            std::move(ref_objects.begin(), ref_objects.end(),
                      std::back_inserter(objects));
        }
        if (progress) {
            progress->Done();
        }
        return objects;
    }

private:
    SimpleWalletClient& wallet_client_;

    typedef CommandResult (RemoteHelper::*Action)(
        const vector<string_view>& args);

    struct Command {
        string_view command;
        Action action;
    };

    Command commands_[5] = {{"capabilities", &RemoteHelper::DoCapabilities},
                            {"list", &RemoteHelper::DoList},
                            {"option", &RemoteHelper::DoOption},
                            {"fetch", &RemoteHelper::DoFetch},
                            {"push", &RemoteHelper::DoPush}};

    struct Options {
        enum struct SetResult { InvalidValue, Ok, Unsupported };

        static constexpr uint32_t kInfiniteDepth =
            (uint32_t)std::numeric_limits<int32_t>::max();
        bool progress = true;
        int64_t verbosity = 0;
        uint32_t depth = kInfiniteDepth;

        SetResult Set(string_view option, string_view value) {
            if (option == "progress") {
                if (value == "true") {
                    progress = true;
                } else if (value == "false") {
                    progress = false;
                } else {
                    return SetResult::InvalidValue;
                }
                return SetResult::Ok;
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
    };

    Options options_;

    std::vector<ObjectWithContent> GetAllObjects(
        const std::string& root_ipfs_hash,
        std::optional<ProgressReporter>& progress) {
        std::vector<ObjectWithContent> objects;
        auto res = GetStringFromIPFS(root_ipfs_hash, wallet_client_);
        std::istringstream ss(res);
        std::string commit_hash;
        ss >> commit_hash;
        std::string commit_oid;
        ss >> commit_oid;
        std::string tree_meta_hash;
        ss >> tree_meta_hash;
        std::vector<std::string> parent_meta_hashes;
        std::string hash;
        while (ss >> hash) {
            if (hash.empty()) {
                break;
            }
            parent_meta_hashes.push_back(std::move(hash));
            ss >> hash;
        }
        auto commit_content = GetStringFromIPFS(commit_hash, wallet_client_);
        objects.push_back(CreateObject(GIT_OBJECT_COMMIT,
                                       FromString(commit_oid),
                                       std::move(commit_hash),
                                       std::move(commit_content)));
        if (progress) {
            progress->AddProgress(1);
        }
        auto tree_objects = GetObjectsFromTreeMeta(tree_meta_hash, progress);
        std::move(tree_objects.begin(), tree_objects.end(),
                  std::back_inserter(objects));
        for (auto&& parent_hash : parent_meta_hashes) {
            auto parent_objects = GetAllObjects(parent_hash, progress);
            std::move(parent_objects.begin(), parent_objects.end(),
                      std::back_inserter(objects));
        }
        return objects;
    }

    std::vector<ObjectWithContent> GetObjectsFromTreeMeta(
        const std::string& tree_meta_hash,
        std::optional<ProgressReporter>& progress) {
        std::vector<ObjectWithContent> objects;
        auto meta = GetStringFromIPFS(tree_meta_hash, wallet_client_);
        std::string tree_hash;
        std::string tree_oid;
        std::istringstream ss(meta);
        ss >> tree_hash;
        ss >> tree_oid;
        auto tree_content = GetStringFromIPFS(tree_hash, wallet_client_);
        objects.push_back(
            CreateObject(GIT_OBJECT_TREE, FromString(tree_oid),
                         std::move(tree_hash), std::move(tree_content)));
        if (progress) {
            progress->AddProgress(1);
        }
        std::string file_hash;
        std::string file_oid;
        while (ss >> file_hash) {
            if (file_hash.empty()) {
                break;
            }
            auto file_content = GetStringFromIPFS(file_hash, wallet_client_);
            ss >> file_oid;
            objects.push_back(CreateObject(
                GIT_OBJECT_BLOB, FromString(file_oid), std::move(file_hash),
                std::move(file_content)));
            if (progress) {
                progress->AddProgress(1);
            }
        }
        return objects;
    }

    std::set<git_oid> GetOidsFromObjects(
        const std::vector<ObjectWithContent>& objects) {
        std::set<git_oid> oids;
        for (const auto& object : objects) {
            oids.insert(object.hash);
        }
        return oids;
    }
};

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "USAGE: git-remote-sourc3 <remote> <url>" << endl;
        return -1;
    }
    try {
        SimpleWalletClient::Options options;
        po::options_description desc("SOURC3 config options");

        desc.add_options()("api-host",
                           po::value<std::string>(&options.apiHost)
                               ->default_value("localhost"),
                           "Wallet API host")(
            "api-port",
            po::value<std::string>(&options.apiPort)->default_value("9100"),
            "Wallet API port")("api-target",
                               po::value<std::string>(&options.apiTarget)
                                   ->default_value("/api/wallet"),
                               "Wallet API target")(
            "app-shader-file",
            po::value<string>(&options.appPath)->default_value("app.wasm"),
            "Path to the app shader file")(
            "use-ipfs", po::value<bool>(&options.useIPFS)->default_value(true),
            "Use IPFS to store large blobs");
        po::variables_map vm;
#ifdef WIN32
        const auto* home_dir = std::getenv("USERPROFILE");
#else
        const auto* home_dir = std::getenv("HOME");
#endif
        std::string config_path = PROTO_NAME "-remote.cfg";
        if (home_dir != nullptr) {
            config_path =
                std::string(home_dir) + "/." PROTO_NAME "/" + config_path;
        }
        cerr << "Reading config from: " << config_path << "..." << endl;
        const auto full_path =
            boost::filesystem::system_complete(config_path).string();
        std::ifstream cfg(full_path);
        if (cfg) {
            po::store(po::parse_config_file(cfg, desc), vm);
        }
        vm.notify();
        string_view sv(argv[2]);
        const string_view schema = PROTO_NAME "://";
        sv = sv.substr(schema.size());
        auto delimiter_owner_name_pos = sv.find('/');
        options.repoOwner = sv.substr(0, delimiter_owner_name_pos);
        options.repoName = sv.substr(delimiter_owner_name_pos + 1);
        auto* git_dir = std::getenv("GIT_DIR");  // set during clone
        if (git_dir != nullptr) {
            options.repoPath = git_dir;
        }
        cerr << "     Remote: " << argv[1] << "\n        URL: " << argv[2]
             << "\nWorking dir: " << boost::filesystem::current_path()
             << "\nRepo folder: " << options.repoPath << endl;
        SimpleWalletClient wallet_client{options};
        RemoteHelper helper{wallet_client};
        git::Init init;
        string input;
        auto res = RemoteHelper::CommandResult::Ok;
        while (getline(cin, input, '\n')) {
            if (input.empty()) {
                if (res == RemoteHelper::CommandResult::Batch) {
                    cout << endl;
                    continue;
                } else {
                    // end of the command sequence
                    return 0;
                }
            }

            string_view args_sv(input.data(), input.size());
            vector<string_view> args = ParseArgs(args_sv);
            if (args.empty()) {
                return -1;
            }

            cerr << "Command: " << input << endl;
            res = helper.DoCommand(args[0], args);

            if (res == RemoteHelper::CommandResult::Failed) {
                return -1;
            } else if (res == RemoteHelper::CommandResult::Ok) {
                cout << endl;
            }
        }
    } catch (const exception& ex) {
        cerr << "Error: " << ex.what() << endl;
        return -1;
    }

    return 0;
}
