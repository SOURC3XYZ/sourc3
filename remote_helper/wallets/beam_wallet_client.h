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
#include "git/object_collector.h"
#include "contract_state.hpp"
#include "base_client.h"

namespace sourc3 {
constexpr const char kJsonRpcHeader[] = "jsonrpc";
constexpr const char kJsonRpcVersion[] = "2.0";

namespace beast = boost::beast;  // from <boost/beast.hpp>
namespace http = beast::http;    // from <boost/beast/http.hpp>
namespace net = boost::asio;     // from <boost/asio.hpp>
using Tcp = net::ip::tcp;        // from <boost/asio/ip/tcp.hpp>

class BeamWalletClient final : public IWalletClient {
public:
    explicit BeamWalletClient(const Options& options)
        : IWalletClient(options), resolver_(ioc_), stream_(ioc_) {
        PrintVersion();
    }

    ~BeamWalletClient() final {
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

    std::string PushObjects(const State& expected_state,
                            const State& desired_state,
                            uint32_t new_object_count,
                            uint32_t new_metas_count) final;
    std::string LoadActualState() final;
    uint64_t GetUploadedObjectCount() final;

    std::string LoadObjectFromIPFS(std::string hash) final;
    std::string SaveObjectToIPFS(const uint8_t* data, size_t size) final;

    bool WaitForCompletion(WaitFunc&&) final;
    size_t GetTransactionCount() const final {
        return transactions_.size();
    }

private:
    std::string InvokeWallet(std::string args) {
        args.append(",repo_id=")
            .append(GetRepoID())
            .append(",cid=")
            .append(GetCID());
        return InvokeShader(std::move(args));
    }
    std::string SubUnsubEvents(bool sub);
    void EnsureConnected();
    std::string ExtractResult(const std::string& response);
    std::string InvokeShader(const std::string& args);
    const std::string& GetCID();
    const std::string& GetRepoID();
    std::string CallAPI(std::string&& request);
    std::string ReadAPI();
    void PrintVersion();

private:
    net::io_context ioc_;
    Tcp::resolver resolver_;
    beast::tcp_stream stream_;
    bool connected_ = false;
    std::string repo_id_;
    std::string cid_;
    std::set<std::string> transactions_;
    std::string data_;
};
}  // namespace sourc3
