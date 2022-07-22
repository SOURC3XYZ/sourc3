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

#include "wallet_client.h"
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

class EthWalletClient : public SimpleWalletClient {
public:
    explicit EthWalletClient(const Options& options)
        : SimpleWalletClient(options), resolver_(ioc_), stream_(ioc_) {
        PrintVersion();
    }

    ~EthWalletClient() override {
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
                            uint32_t new_metas_count) override;
    std::string LoadActualState() override;
    uint64_t GetUploadedObjectCount() override;

    bool WaitForCompletion(WaitFunc&&) override;
    size_t GetTransactionCount() const override {
        return transactions_.size();
    }

private:
    void EnsureConnected();
    std::string CallEthAPI(std::string&& request);
    std::string ReadEthAPI();

    const std::string& GetRepoID();
    void PrintVersion();

private:
    net::io_context ioc_;
    Tcp::resolver resolver_;
    beast::tcp_stream stream_;
    bool connected_ = false;
    std::string data_;

    std::string repo_id_;
    std::string cid_;
    std::set<std::string> transactions_;
};
}  // namespace sourc3
