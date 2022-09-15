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
#include <boost/asio/spawn.hpp>
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
#include <variant>
#include <unordered_map>

#include "git/object_collector.h"
#include "utils.h"
#include "git/git_utils.h"
#include "version.h"
#include "wallets/client_factory.h"
#include "engines/engine_factory.h"

namespace po = boost::program_options;
namespace json = boost::json;
using namespace std;
using namespace sourc3;

#define PROTO_NAME "sourc3"

namespace {
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
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "USAGE: git-remote-sourc3 <remote> <url>" << endl;
        return -1;
    }
    try {
        IWalletClient::Options options;
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
            "Use IPFS to store large blobs")(
            "use-full-ipfs", po::value<bool>(&options.useFullIPFS)->default_value(true),
            "Use Full IPFS engine (Warning: shader-specific option, check it!)")(
            "use-async", po::value<bool>(&options.async)->default_value(true),
            "Use async clients for more faster work");
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

        auto client = CreateClient(PROTO_NAME, options);
        if (!client) {
            throw std::runtime_error{"Unsupported chain"};
        }
        auto engine = CreateEngine(*client);
        git::Init init;
        string input;
        auto res = IEngine::CommandResult::Ok;
        while (getline(cin, input, '\n')) {
            if (input.empty()) {
                if (res == IEngine::CommandResult::Batch) {
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
            res = engine->DoCommand(args[0], args);

            if (res == IEngine::CommandResult::Failed) {
                return -1;
            } else if (res == IEngine::CommandResult::Ok) {
                cout << endl;
            }
        }
    } catch (const exception& ex) {
        cerr << "Error: " << ex.what() << endl;
        return -1;
    }

    return 0;
}
