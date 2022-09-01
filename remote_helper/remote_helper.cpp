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
#include <boost/asio.hpp>
#include <boost/asio/spawn.hpp>
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

#include "object_collector.h"
#include "utils.h"
#include "version.h"
#include "wallet_client.h"

namespace po = boost::program_options;
namespace json = boost::json;
using namespace std;
using namespace sourc3;

#define PROTO_NAME "sourc3"

namespace {
constexpr size_t kIpfsAddressSize = 46;

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

json::value ParseJsonAndTest(json::string_view sv) {
    auto r = json::parse(sv);
    if (const auto* error = r.as_object().if_contains("error"); error) {
        throw std::runtime_error(
            error->as_object().at("message").as_string().c_str());
    }
    return r;
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
        std::vector<GitObject> objects;
        {
            auto progress = MakeProgress("Enumerating objects", 0);
            // hack Collect objects metainfo
            auto res = wallet_client_.GetAllObjectsMetadata();
            auto root = ParseJsonAndTest(res);
            for (auto& obj_val : root.as_object()["objects"].as_array()) {
                if (progress) {
                    progress->UpdateProgress(++total_objects);
                }

                auto& o = objects.emplace_back();
                auto& obj = obj_val.as_object();
                o.data_size = obj["object_size"].to_number<uint32_t>();
                o.type = static_cast<int8_t>(
                    obj["object_type"].to_number<uint32_t>());
                std::string s = obj["object_hash"].as_string().c_str();
                git_oid_fromstr(&o.hash, s.c_str());

                if (git_odb_exists(*accessor.m_odb, &o.hash) != 0) {
                    received_objects.insert(s);
                } else if (options_.cloning) {
                    enuque_object(s);
                    continue;
                }
            }
        }

        auto to_receive = total_objects - received_objects.size();

        if (to_receive == 0) {
            return CommandResult::Batch;
        }

        auto progress = MakeProgress("Receiving objects", to_receive);

        size_t done = 0;
        while (!object_hashes.empty()) {
            auto it_to_receive = object_hashes.begin();
            const auto& object_to_receive = *it_to_receive;

            auto res = wallet_client_.GetObjectData(object_to_receive);
            auto root = ParseJsonAndTest(res);
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

            auto data = root.as_object()["object_data"].as_string();

            ByteBuffer buf;
            if (it->IsIPFSObject()) {
                auto hash = FromHex(data);
                auto responce = wallet_client_.LoadObjectFromIPFS(
                    std::string(hash.cbegin(), hash.cend()));
                auto r = ParseJsonAndTest(responce);
                if (r.as_object().find("result") == r.as_object().end()) {
                    cerr << "message: "
                         << r.as_object()["error"]
                                .as_object()["message"]
                                .as_string()
                         << "\ndata:    "
                         << r.as_object()["error"]
                                .as_object()["data"]
                                .as_string()
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
            if (git_odb_write(&res_oid, *accessor.m_odb, buf.data(), buf.size(),
                              type) < 0) {
                return CommandResult::Failed;
            }
            if (!options_.cloning) {
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
            }
            if (progress) {
                progress->UpdateProgress(++done);
            }

            object_hashes.erase(it_to_receive);
        }
        return CommandResult::Batch;
    }

    CommandResult DoFetchAsync(const vector<string_view>& args) {
        std::set<std::string> object_hashes;
        object_hashes.emplace(args[1].data(), args[1].size());
        size_t depth = 1;
        std::set<std::string> received_objects;

        auto enuque_object = [&](const std::string& oid) {
            if (received_objects.find(oid) == received_objects.end()) {
                object_hashes.emplace(oid);
            }
        };

        git::RepoAccessor accessor(wallet_client_.GetRepoDir());
        size_t total_objects = 0;
        std::vector<GitObject> objects;
        {
            auto progress = MakeProgress("Enumerating objects", 0);
            // hack Collect objects metainfo
            auto res = wallet_client_.GetAllObjectsMetadata();
            auto root = ParseJsonAndTest(res);
            for (auto& obj_val : root.as_object()["objects"].as_array()) {
                if (progress) {
                    progress->UpdateProgress(++total_objects);
                }

                auto& o = objects.emplace_back();
                auto& obj = obj_val.as_object();
                o.data_size = obj["object_size"].to_number<uint32_t>();
                o.type = static_cast<int8_t>(
                    obj["object_type"].to_number<uint32_t>());
                std::string s = obj["object_hash"].as_string().c_str();
                git_oid_fromstr(&o.hash, s.c_str());

                if (git_odb_exists(*accessor.m_odb, &o.hash) != 0) {
                    received_objects.insert(s);
                } else if (options_.cloning) {
                    enuque_object(s);
                    continue;
                }
            }
        }

        auto to_receive = total_objects - received_objects.size();
        if (to_receive == 0) {
            return CommandResult::Batch;
        }

        auto progress = MakeProgress("Receiving objects", to_receive);
        size_t done = 0;
        namespace ba = boost::asio;
        ba::io_context& io_context = wallet_client_.ioc_;
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

                ba::spawn(yield, [&, it2 = pit.first, obj = object_to_receive](
                                     ba::yield_context yield2) {
                    SimpleWalletClient wallet_client(
                        wallet_client_.ioc_, wallet_client_.options_, yield2);
                    auto res = wallet_client.GetObjectDataAsync(obj, yield2);
                    auto root = ParseJsonAndTest(res);
                    git_oid oid;
                    git_oid_fromstr(&oid, obj.data());

                    auto it = std::find_if(objects.begin(), objects.end(),
                                           [&](auto&& o) {
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
                            auto responce =
                                wallet_client.LoadObjectFromIPFSAsync(
                                    std::string(hash.cbegin(), hash.cend()),
                                    yield2);
                            auto r = ParseJsonAndTest(responce);
                            if (r.as_object().find("result") ==
                                r.as_object().end()) {
                                cerr << "message: "
                                     << r.as_object()["error"]
                                            .as_object()["message"]
                                            .as_string()
                                     << "\ndata:    "
                                     << r.as_object()["error"]
                                            .as_object()["data"]
                                            .as_string()
                                     << endl;
                                result = CommandResult::Failed;
                                return;
                            }
                            auto d = r.as_object()["result"]
                                         .as_object()["data"]
                                         .as_array();
                            buf.reserve(d.size());
                            for (auto&& v : d) {
                                buf.emplace_back(
                                    static_cast<uint8_t>(v.get_int64()));
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
                    if (git_odb_write(&res_oid, *accessor.m_odb, buf.data(),
                                      buf.size(), type) < 0) {
                        result = CommandResult::Failed;
                        return;
                    }
                    if (!options_.cloning) {
                        if (type == GIT_OBJECT_TREE) {
                            git::Tree tree;
                            git_tree_lookup(tree.Addr(), *accessor.m_repo,
                                            &oid);

                            auto count = git_tree_entrycount(*tree);
                            for (size_t i = 0; i < count; ++i) {
                                auto* entry = git_tree_entry_byindex(*tree, i);
                                auto s = ToString(*git_tree_entry_id(entry));
                                enuque_object(s);
                            }
                        } else if (type == GIT_OBJECT_COMMIT) {
                            git::Commit commit;
                            git_commit_lookup(commit.Addr(), *accessor.m_repo,
                                              &oid);
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
                            enuque_object(
                                ToString(*git_commit_tree_id(*commit)));
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

    CommandResult DoPush(const vector<string_view>& args) {
        ObjectCollector collector(wallet_client_.GetRepoDir());
        std::vector<Refs> refs;
        std::vector<git_oid> local_refs;
        for (size_t i = 1; i < args.size(); ++i) {
            auto& arg = args[i];
            auto p = arg.find(':');
            auto& r = refs.emplace_back();
            r.localRef = arg.substr(0, p);
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

        auto uploaded_objects = GetUploadedObjects();
        auto remote_refs = RequestRefs();
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

        for (auto& obj : collector.m_objects) {
            if (uploaded_objects.find(obj.oid) != uploaded_objects.end()) {
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

        {
            auto progress = MakeProgress("Uploading objects to IPFS",
                                         collector.m_objects.size());
            size_t i = 0;
            for (auto& obj : collector.m_objects) {
                if (obj.selected) {
                    continue;
                }

                if (obj.GetSize() > kIpfsAddressSize) {
                    auto res = wallet_client_.SaveObjectToIPFS(obj.GetData(),
                                                               obj.GetSize());
                    auto r = ParseJsonAndTest(res);
                    auto hash_str =
                        r.as_object()["result"].as_object()["hash"].as_string();
                    obj.ipfsHash =
                        ByteBuffer(hash_str.cbegin(), hash_str.cend());
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
                MakeProgress("Uploading metadata to blockchain", objs.size());
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
                wallet_client_.PushObjects(str_data, collector.m_refs, last);
                return last == false;  // continue
            });
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
        std::vector<Ref> refs;
        auto res = wallet_client_.GetReferences();
        if (!res.empty()) {
            auto root = ParseJsonAndTest(res);
            for (auto& rv : root.as_object()["refs"].as_array()) {
                auto& ref = refs.emplace_back();
                auto& r = rv.as_object();
                ref.name = r["name"].as_string().c_str();
                git_oid_fromstr(&ref.target,
                                r["commit_hash"].as_string().c_str());
            }
        }
        return refs;
    }

    std::set<git_oid> GetUploadedObjects() {
        std::set<git_oid> uploaded_objects;

        auto progress = MakeProgress("Enumerating uploaded objects", 0);
        // hack Collect objects metainfo
        auto res = wallet_client_.GetAllObjectsMetadata();
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
                            {"fetch", &RemoteHelper::DoFetchAsync},
                            {"push", &RemoteHelper::DoPush}};

    struct Options {
        enum struct SetResult { InvalidValue, Ok, Unsupported };

        static constexpr uint32_t kInfiniteDepth =
            (uint32_t)std::numeric_limits<int32_t>::max();
        bool progress = true;
        bool cloning = false;
        int64_t verbosity = 0;
        uint32_t depth = kInfiniteDepth;

        SetResult Set(string_view option, string_view value) {
            if (option == "progress") {
                return SetBool(progress, value);
            } else if (option == "cloning") {
                return SetBool(cloning, value);
            }
            /* else if (option == "verbosity") {
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

        SetResult SetBool(bool& opt, string_view value) {
            if (value == "true") {
                opt = true;
            } else if (value == "false") {
                opt = false;
            } else {
                return SetResult::InvalidValue;
            }
            return SetResult::Ok;
        }
    };

    Options options_;
};

int main(int argc, char* argv[]) {

    #ifdef __APPLE__
    pid_t pid = getpid();
    struct rlimit l;
    int ret = getrlimit(RLIMIT_CORE, &l);

    printf("getrlimit returned %d\n", ret);
    printf("rlim_cur = %llu\n", l.rlim_cur);
    printf("rlim_max = %llu\n", l.rlim_max);
    l.rlim_cur = l.rlim_max;
    printf("setrlimit returned %d\n", setrlimit(RLIMIT_CORE, &l));
    #endif  // __APPLE__

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
            po::value<std::string>(&options.apiPort)->default_value("47321"),
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
        net::io_context ioc;
        SimpleWalletClient wallet_client{ioc, options};
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
