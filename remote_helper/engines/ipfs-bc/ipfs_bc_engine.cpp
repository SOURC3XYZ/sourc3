#include "ipfs_bc_engine.h"

#include <iostream>
#include <boost/asio/steady_timer.hpp>
#include <boost/json.hpp>

#include "wallets/base_client.h"

namespace json = boost::json;
using namespace std;
using namespace sourc3;

constexpr size_t kIpfsAddressSize = 46;

IEngine::CommandResult IPFSBlockChainEngine::DoFetch(const std::vector<std::string_view>& args) {
    return (options_->is_async ? DoFetchAsync(args) : DoFetchSync(args));
}

IEngine::CommandResult IPFSBlockChainEngine::DoFetchSync(const vector<string_view>& args) {
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
    std::vector<GitObject> objects;
    {
        auto progress = MakeProgress("Enumerating objects", 0, options_->progress);
        // hack Collect objects metainfo
        auto res = client_.GetAllObjectsMetadata();
        auto root = ParseJsonAndTest(res);
        for (auto& obj_val : root.as_object()["objects"].as_array()) {
            if (progress) {
                progress->UpdateProgress(++total_objects);
            }

            auto& o = objects.emplace_back();
            auto& obj = obj_val.as_object();
            o.data_size = obj["object_size"].to_number<uint32_t>();
            o.type = static_cast<int8_t>(obj["object_type"].to_number<uint32_t>());
            std::string s = obj["object_hash"].as_string().c_str();
            git_oid_fromstr(&o.hash, s.c_str());

            if (git_odb_exists(*accessor.m_odb, &o.hash) != 0) {
                received_objects.insert(s);
            } else if (options_->cloning) {
                enuque_object(s);
                continue;
            }
        }
    }

    auto to_receive = total_objects - received_objects.size();

    if (to_receive == 0) {
        return CommandResult::Batch;
    }

    auto progress = MakeProgress("Receiving objects", to_receive, options_->progress);

    size_t done = 0;
    while (!object_hashes.empty()) {
        auto it_to_receive = object_hashes.begin();
        const auto& object_to_receive = *it_to_receive;

        auto res = client_.GetObjectData(object_to_receive);
        auto root = ParseJsonAndTest(res);
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

        auto data = root.as_object()["object_data"].as_string();

        ByteBuffer buf;
        if (it->IsIPFSObject()) {
            auto hash = FromHex(data);
            auto responce = client_.LoadObjectFromIPFS(std::string(hash.cbegin(), hash.cend()));
            auto r = ParseJsonAndTest(responce);
            if (r.as_object().find("result") == r.as_object().end()) {
                cerr << "message: " << r.as_object()["error"].as_object()["message"].as_string()
                     << "\ndata:    " << r.as_object()["error"].as_object()["data"].as_string()
                     << endl;
                return CommandResult::Failed;
            }
            auto d = r.as_object()["result"].as_object()["data"].as_array();
            buf.reserve(d.size());
            for (auto&& v : d) {
                buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
            }
        } else {
            buf = FromHex(data);
        }

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
        if (!options_->cloning) {
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
                if (depth < options_->depth || options_->depth == Options::kInfiniteDepth) {
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
        }
        if (progress) {
            progress->UpdateProgress(++done);
        }

        object_hashes.erase(it_to_receive);
    }
    return CommandResult::Batch;
}

IEngine::CommandResult IPFSBlockChainEngine::DoFetchAsync(const vector<string_view>& args) {
    std::set<std::string> object_hashes;
    object_hashes.emplace(args[1].data(), args[1].size());
    size_t depth = 1;
    std::set<std::string> received_objects;

    auto enuque_object = [&](const std::string& oid) {
        if (received_objects.find(oid) == received_objects.end()) {
            object_hashes.emplace(oid);
        }
    };

    git::RepoAccessor accessor(client_.GetRepoDir());
    size_t total_objects = 0;
    std::vector<GitObject> objects;
    {
        auto progress = MakeProgress("Enumerating objects", 0, options_->progress);
        // hack Collect objects metainfo
        auto res = client_.GetAllObjectsMetadata();
        auto root = ParseJsonAndTest(res);
        for (auto& obj_val : root.as_object()["objects"].as_array()) {
            if (progress) {
                progress->UpdateProgress(++total_objects);
            }

            auto& o = objects.emplace_back();
            auto& obj = obj_val.as_object();
            o.data_size = obj["object_size"].to_number<uint32_t>();
            o.type = static_cast<int8_t>(obj["object_type"].to_number<uint32_t>());
            std::string s = obj["object_hash"].as_string().c_str();
            git_oid_fromstr(&o.hash, s.c_str());

            if (git_odb_exists(*accessor.m_odb, &o.hash) != 0) {
                received_objects.insert(s);
            } else if (options_->cloning) {
                enuque_object(s);
                continue;
            }
        }
    }

    auto to_receive = total_objects - received_objects.size();
    if (to_receive == 0) {
        return CommandResult::Batch;
    }

    auto progress = MakeProgress("Receiving objects", to_receive, options_->progress);
    size_t done = 0;
    namespace ba = boost::asio;
    ba::io_context& io_context = client_.GetContext();
    boost::asio::steady_timer timer(io_context);

    CommandResult result = CommandResult::Batch;
    ba::spawn(io_context, [&](ba::yield_context yield) {
        std::set<std::string> processing_hashes;
        while (!object_hashes.empty() || !processing_hashes.empty()) {
            if (object_hashes.empty() || processing_hashes.size() >= 400) {
                timer.expires_from_now(std::chrono::milliseconds(100));
                timer.async_wait(yield);
                continue;
            }
            auto it_to_receive = object_hashes.begin();
            const auto& object_to_receive = *it_to_receive;
            auto pit = processing_hashes.insert(object_to_receive);
            if (pit.second == false) {
                object_hashes.erase(it_to_receive);
                continue;
            }

            ba::spawn(yield, [&, it2 = pit.first,
                              obj = object_to_receive](ba::yield_context yield2) {
                auto res = client_.GetObjectDataAsync(obj, yield2);
                auto root = ParseJsonAndTest(res);
                git_oid oid;
                git_oid_fromstr(&oid, obj.data());

                auto it = std::find_if(objects.begin(), objects.end(), [&](auto&& o) {
                    return o.hash == oid;
                });
                if (it == objects.end()) {
                    received_objects.insert(obj);  // move to received
                    processing_hashes.erase(it2);

                    return;
                }

                auto data = root.as_object()["object_data"].as_string();

                ByteBuffer buf;
                if (it->IsIPFSObject()) {
                    auto hash = FromHex(data);
                    try {
                        auto responce = client_.LoadObjectFromIPFSAsync(
                            std::string(hash.cbegin(), hash.cend()), yield2);
                        auto r = ParseJsonAndTest(responce);
                        if (r.as_object().find("result") == r.as_object().end()) {
                            cerr << "message: "
                                 << r.as_object()["error"].as_object()["message"].as_string()
                                 << "\ndata:    "
                                 << r.as_object()["error"].as_object()["data"].as_string() << endl;
                            result = CommandResult::Failed;
                            return;
                        }
                        auto d = r.as_object()["result"].as_object()["data"].as_array();
                        buf.reserve(d.size());
                        for (auto&& v : d) {
                            buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
                        }
                    } catch (...) {
                        object_hashes.emplace(obj);
                        processing_hashes.erase(it2);
                        return;
                    }

                } else {
                    buf = FromHex(data);
                }

                git_oid res_oid;
                auto type = it->GetObjectType();
                git_oid r;
                git_odb_hash(&r, buf.data(), buf.size(), type);
                if (r != oid) {
                    // invalid hash
                    result = CommandResult::Failed;
                    return;
                }
                if (git_odb_write(&res_oid, *accessor.m_odb, buf.data(), buf.size(), type) < 0) {
                    result = CommandResult::Failed;
                    return;
                }
                if (!options_->cloning) {
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
                        if (depth < options_->depth || options_->depth == Options::kInfiniteDepth) {
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
                }
                received_objects.insert(obj);
                if (progress) {
                    progress->UpdateProgress(++done);
                }
                processing_hashes.erase(it2);
            });
            object_hashes.erase(it_to_receive);
        }
    });

    io_context.run();

    return result;
}

IEngine::CommandResult IPFSBlockChainEngine::DoPush(const vector<string_view>& args) {
    ObjectCollector collector(client_.GetRepoDir());
    std::vector<Refs> refs;
    std::vector<git_oid> local_refs;
    for (size_t i = 1; i < args.size(); ++i) {
        auto& arg = args[i];
        auto p = arg.find(':');
        auto& r = refs.emplace_back();
        r.localRef = arg.substr(0, p);
        r.remoteRef = arg.substr(p + 1);
        git::Reference local_ref;
        if (git_reference_lookup(local_ref.Addr(), *collector.m_repo, r.localRef.c_str()) < 0) {
            cerr << "Local reference \'" << r.localRef << "\' doesn't exist" << endl;
            return CommandResult::Failed;
        }
        auto& lr = local_refs.emplace_back();
        git_oid_cpy(&lr, git_reference_target(*local_ref));
    }

    auto uploaded_objects = GetUploadedObjects();
    auto remote_refs = RequestRefs();
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

    for (auto& obj : collector.m_objects) {
        if (uploaded_objects.find(obj.oid) != uploaded_objects.end()) {
            obj.selected = true;
        }
    }

    {
        auto it = std::remove_if(objs.begin(), objs.end(), [](const auto& o) {
            return o.selected;
        });
        objs.erase(it, objs.end());
    }

    {
        auto progress = MakeProgress("Uploading objects to IPFS", collector.m_objects.size(),
                                     options_->progress);
        size_t i = 0;
        for (auto& obj : collector.m_objects) {
            if (obj.selected) {
                continue;
            }

            if (obj.GetSize() > kIpfsAddressSize) {
                auto res = client_.SaveObjectToIPFS(obj.GetData(), obj.GetSize());
                auto r = ParseJsonAndTest(res);
                auto hash_str = r.as_object()["result"].as_object()["hash"].as_string();
                obj.ipfsHash = ByteBuffer(hash_str.cbegin(), hash_str.cend());
            }
            if (progress) {
                progress->UpdateProgress(++i);
            }
        }
    }

    std::sort(objs.begin(), objs.end(), [](auto&& left, auto&& right) {
        return left.GetSize() > right.GetSize();
    });

    {
        auto progress =
            MakeProgress("Uploading metadata to blockchain", objs.size(), options_->progress);
        collector.Serialize([&](const auto& buf, size_t done) {
            std::string str_data;
            if (!buf.empty()) {
                // log
                //{
                //    const auto* p =
                //        reinterpret_cast<const ObjectsInfo*>(buf.data());
                //    const auto* cur =
                //        reinterpret_cast<const GitObject*>(p + 1);
                //    for (uint32_t i = 0; i < p->objects_number; ++i) {
                //        size_t s = cur->data_size;
                //        std::cerr << to_string(cur->hash) << '\t' << s
                //                  << '\t' << (int)cur->type << '\n';
                //        ++cur;
                //        cur = reinterpret_cast<const GitObject*>(
                //            reinterpret_cast<const uint8_t*>(cur) + s);
                //    }
                //    std::cerr << std::endl;
                //}
                str_data = ToHex(buf.data(), buf.size());
            }

            if (progress) {
                progress->UpdateProgress(done);
            }

            bool last = (done == objs.size());
            client_.PushObjects(str_data, collector.m_refs, last);
            return last == false;  // continue
        });
    }
    {
        auto progress = MakeProgress("Waiting for the transaction completion",
                                     client_.GetTransactionCount(), options_->progress);

        auto res = client_.WaitForCompletion([&](size_t d, const auto& error) {
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

std::vector<Ref> IPFSBlockChainEngine::RequestRefs() {
    std::vector<Ref> refs;
    auto res = client_.GetReferences();
    if (!res.empty()) {
        auto root = ParseJsonAndTest(res);
        for (auto& rv : root.as_object()["refs"].as_array()) {
            auto& ref = refs.emplace_back();
            auto& r = rv.as_object();
            ref.name = r["name"].as_string().c_str();
            git_oid_fromstr(&ref.target, r["commit_hash"].as_string().c_str());
        }
    }
    return refs;
}

std::set<git_oid> IPFSBlockChainEngine::GetUploadedObjects() {
    std::set<git_oid> uploaded_objects;

    auto progress = MakeProgress("Enumerating uploaded objects", 0, options_->progress);
    // hack Collect objects metainfo
    auto res = client_.GetAllObjectsMetadata();
    auto root = ParseJsonAndTest(res);
    for (auto& obj : root.as_object()["objects"].as_array()) {
        auto s = obj.as_object()["object_hash"].as_string();
        git_oid oid;
        git_oid_fromstr(&oid, s.c_str());
        uploaded_objects.insert(oid);
        if (progress) {
            progress->UpdateProgress(uploaded_objects.size());
        }
    }
    return uploaded_objects;
}

IEngine::BaseOptions::SetResult IPFSBlockChainEngine::Options::Set(std::string_view option,
                                                                   std::string_view value) {
    if (option == "cloning") {
        return SetBool(cloning, value);
    }
    return IEngine::BaseOptions::Set(std::move(option), std::move(value));
}
