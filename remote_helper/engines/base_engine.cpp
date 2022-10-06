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

#include "engines/base_engine.h"

#include <iostream>
#include <algorithm>

IEngine::BaseOptions::SetResult IEngine::BaseOptions::SetBool(bool& opt, std::string_view value) {
    if (value == "true") {
        opt = true;
    } else if (value == "false") {
        opt = false;
    } else {
        return SetResult::InvalidValue;
    }
    return SetResult::Ok;
}

IEngine::BaseOptions::SetResult IEngine::BaseOptions::Set(std::string_view option,
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

IEngine::CommandResult IEngine::DoList([[maybe_unused]] const std::vector<std::string_view>& args) {
    auto refs = RequestRefs();

    for (const auto& r : refs) {
        std::cout << sourc3::ToString(r.target) << " " << r.name << '\n';
    }
    if (!refs.empty()) {
        std::cout << "@" << refs.back().name << " HEAD\n";
    }

    return CommandResult::Ok;
}

IEngine::CommandResult IEngine::DoOption(const std::vector<std::string_view>& args) {
    static std::string_view results[] = {"error invalid value", "ok", "unsupported"};

    auto res = options_->Set(args[1], args[2]);

    std::cout << results[size_t(res)];
    return CommandResult::Ok;
}

IEngine::CommandResult IEngine::DoCapabilities(
    [[maybe_unused]] const std::vector<std::string_view>& args) {
    for (auto ib = std::begin(commands_) + 1, ie = std::end(commands_); ib != ie; ++ib) {
        std::cout << ib->command << '\n';
    }

    return CommandResult::Ok;
}

IEngine::CommandResult IEngine::DoCommand(std::string_view command,
                                          std::vector<std::string_view>& args) {
    auto it = std::find_if(std::begin(commands_), std::end(commands_), [&](const auto& c) {
        return command == c.command;
    });
    if (it == std::end(commands_)) {
        std::cerr << "Unknown command: " << command << std::endl;
        return CommandResult::Failed;
    }
    return std::invoke(it->action, this, args);
}
