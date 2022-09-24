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

class FullIPFSEngine final : public IEngine {
public:
    explicit FullIPFSEngine(IWalletClient& client) : IEngine(client, std::make_unique<Options>()) {
    }

private:
    CommandResult DoFetch(const std::vector<std::string_view>& args) final;

    CommandResult DoPush(const std::vector<std::string_view>& args) final;

    std::vector<sourc3::Ref> RequestRefs() final;

    struct Options final : BaseOptions {
        SetResult Set(std::string_view option, std::string_view value) final;
    };

    boost::asio::io_context base_context_;
};
