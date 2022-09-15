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

#pragma once

#include <optional>
#include <boost/asio/io_context.hpp>
#include "engines/base_engine.h"
#include "git/object_collector.h"

class IPFSBlockChainEngine final : public IEngine {
public:
    explicit IPFSBlockChainEngine(IWalletClient& client) : IEngine(client) {
    }

    CommandResult DoCommand(std::string_view command, std::vector<std::string_view>& args) final;

private:
    CommandResult DoList([[maybe_unused]] const std::vector<std::string_view>& args);

    CommandResult DoOption([[maybe_unused]] const std::vector<std::string_view>& args);

    CommandResult DoFetch(const std::vector<std::string_view>& args);
    CommandResult DoFetchSync(const std::vector<std::string_view>& args);
    CommandResult DoFetchAsync(const std::vector<std::string_view>& args);

    CommandResult DoPush(const std::vector<std::string_view>& args);

    CommandResult DoCapabilities([[maybe_unused]] const std::vector<std::string_view>& args);

    std::vector<sourc3::Ref> RequestRefs();

    std::set<git_oid> GetUploadedObjects();

    typedef CommandResult (IPFSBlockChainEngine::*Action)(const std::vector<std::string_view>& args);

    struct Command {
        std::string_view command;
        Action action;
    };

    Command commands_[5] = {{"capabilities", &IPFSBlockChainEngine::DoCapabilities},
                            {"list", &IPFSBlockChainEngine::DoList},
                            {"option", &IPFSBlockChainEngine::DoOption},
                            {"fetch", &IPFSBlockChainEngine::DoFetch},
                            {"push", &IPFSBlockChainEngine::DoPush}};

    struct Options final : BaseOptions {
        SetResult Set(std::string_view option, std::string_view value) final;
    };

    Options options_;
    boost::asio::io_context base_context_;
};
