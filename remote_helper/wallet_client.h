/*
 * Copyright 2021-2022 SOURC3 Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <iostream>
#include <set>
#include "utils.h"
#include "object_collector.h"
#include "contract_state.hpp"

namespace sourc3 {
constexpr const char kJsonRpcHeader[] = "jsonrpc";
constexpr const char kJsonRpcVersion[] = "2.0";

namespace beast = boost::beast;  // from <boost/beast.hpp>
namespace http = beast::http;    // from <boost/beast/http.hpp>
namespace net = boost::asio;     // from <boost/asio.hpp>
using Tcp = net::ip::tcp;        // from <boost/asio/ip/tcp.hpp>

class SimpleWalletClient {
public:
    struct Options {
        std::string apiHost;
        std::string apiPort;
        std::string apiTarget;
        std::string appPath;
        std::string repoOwner;
        std::string repoName;
        std::string repoPath = ".";
        bool useIPFS = true;
        std::string ethApiHost;
        std::string ethApiPort;
    };

    explicit SimpleWalletClient(const Options& options)
        : resolver_(ioc_), stream_(ioc_), options_(options) {
    }

    virtual ~SimpleWalletClient() {
        // Gracefully close the socket
        if (connected_) {
            beast::error_code ec;
            stream_.socket().shutdown(Tcp::socket::shutdown_both, ec);

            if (ec && ec != beast::errc::not_connected) {
                // doesn't throw, simply report
                std::cerr << "Error: " << beast::system_error{ec}.what()
                          << std::endl;
            }
        }
    }

    static std::unique_ptr<SimpleWalletClient> CreateInstance(
        std::string_view network_name, const Options& options);

    virtual std::string PushObjects(const State& expected_state,
                                    const State& desired_state,
                                    uint32_t new_object_count,
                                    uint32_t new_metas_count) = 0;
    virtual std::string LoadActualState() = 0;
    virtual uint64_t GetUploadedObjectCount() = 0;

    const std::string& GetRepoDir() const {
        return options_.repoPath;
    }

    std::string LoadObjectFromIPFS(std::string hash);
    std::string SaveObjectToIPFS(const uint8_t* data, size_t size);

    using WaitFunc = std::function<void(size_t, const std::string&)>;
    virtual bool WaitForCompletion(WaitFunc&&) = 0;
    virtual size_t GetTransactionCount() const = 0;

protected:
    std::string CallAPI(std::string&& request);
    std::string ReadAPI();
    const Options& options() const {
        return options_;
    }

private:
    void EnsureConnected();

private:
    net::io_context ioc_;
    Tcp::resolver resolver_;
    beast::tcp_stream stream_;
    bool connected_ = false;
    const Options& options_;
    std::string data_;
};
}  // namespace sourc3
