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

#include <string_view>
#include <vector>
#include <memory>
#include <limits>

#include "utils.h"
#include "git/object_collector.h"

struct IWalletClient;

struct IEngine {
protected:
    struct BaseOptions;

public:
    enum struct CommandResult { Ok, Failed, Batch };

    explicit IEngine(IWalletClient& client, std::unique_ptr<BaseOptions> options)
        : client_(client), options_(std::move(options)) {
    }

    virtual ~IEngine() = default;

    virtual CommandResult DoCommand(std::string_view command, std::vector<std::string_view>& args);

protected:
    IWalletClient& client_;

    virtual CommandResult DoList([[maybe_unused]] const std::vector<std::string_view>& args);

    virtual CommandResult DoOption(const std::vector<std::string_view>& args);

    virtual CommandResult DoCapabilities(
        [[maybe_unused]] const std::vector<std::string_view>& args);

    virtual CommandResult DoFetch(const std::vector<std::string_view>& args) = 0;

    virtual CommandResult DoPush(const std::vector<std::string_view>& args) = 0;

    virtual std::vector<sourc3::Ref> RequestRefs() = 0;

    typedef CommandResult (IEngine::*Action)(const std::vector<std::string_view>& args);

    struct Command {
        std::string_view command;
        Action action;
    };

    Command commands_[5] = {{"capabilities", &IEngine::DoCapabilities},
                            {"list", &IEngine::DoList},
                            {"option", &IEngine::DoOption},
                            {"fetch", &IEngine::DoFetch},
                            {"push", &IEngine::DoPush}};

    struct BaseOptions {
        enum struct SetResult { InvalidValue, Ok, Unsupported };

        static constexpr uint32_t kInfiniteDepth = (uint32_t)std::numeric_limits<int32_t>::max();
        sourc3::ReporterType progress;
        int64_t verbosity = 0;
        uint32_t depth = kInfiniteDepth;
        bool is_async = true;
        bool cloning = false;

        virtual ~BaseOptions() = default;

        virtual SetResult Set(std::string_view option, std::string_view value);

        SetResult SetBool(bool& opt, std::string_view value);
    };

    std::unique_ptr<BaseOptions> options_;
};
