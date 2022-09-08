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

#include <string>
#include <cstdint>
#include <functional>

#include <boost/asio/spawn.hpp>

struct State;

struct IWalletClient {
    using AsyncContext = boost::asio::yield_context;

    struct Options {
        std::string apiHost;
        std::string apiPort;
        std::string apiTarget;
        std::string appPath;
        std::string repoOwner;
        std::string repoName;
        std::string repoPath = ".";
        bool useIPFS = true;
        bool async = true;
    };

    explicit IWalletClient(const Options& options)
        : options_(options) {
    }

    virtual ~IWalletClient() = default;

    virtual std::string PushObjects(const State& expected_state,
                            const State& desired_state,
                            uint32_t new_object_count,
                            uint32_t new_metas_count) = 0;
    virtual std::string LoadActualState() = 0;
    virtual uint64_t GetUploadedObjectCount() = 0;

    const std::string& GetRepoDir() const {
        return options_.repoPath;
    }

    virtual std::string LoadObjectFromIPFS(std::string hash) = 0;
    virtual std::string LoadObjectFromIPFSAsync(std::string hash, AsyncContext context) = 0;
    virtual std::string SaveObjectToIPFS(const uint8_t* data, size_t size) = 0;
    virtual std::string SaveObjectToIPFSAsync(const uint8_t* data, size_t size,
                                              AsyncContext context) = 0;

    using WaitFunc = std::function<void(size_t, const std::string&)>;

    virtual bool WaitForCompletion(WaitFunc&&) = 0;

    virtual size_t GetTransactionCount() const = 0;

    const Options& GetOptions() const {
        return options_;
    }

protected:
    Options options_;
};
