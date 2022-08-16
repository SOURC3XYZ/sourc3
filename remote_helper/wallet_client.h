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
#include <boost/asio.hpp>
#include <boost/asio/spawn.hpp>
#include <iostream>
#include <set>
#include "utils.h"
#include "object_collector.h"

namespace sourc3 {
constexpr const char JsonRpcHeader[] = "jsonrpc";
constexpr const char JsonRpcVersion[] = "2.0";

namespace beast = boost::beast;  // from <boost/beast.hpp>
namespace http = beast::http;    // from <boost/beast/http.hpp>
namespace net = boost::asio;     // from <boost/asio.hpp>
using tcp = net::ip::tcp;        // from <boost/asio/ip/tcp.hpp>

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
    };

    SimpleWalletClient(net::io_context& ioc, const Options& options,
                       boost::optional<net::yield_context> yield = boost::none)
        : ioc_(ioc),
          resolver_(ioc_),
          stream_(ioc_),
          options_(options),
          yield_(yield) {
        // PrintVersion();
    }

    ~SimpleWalletClient() {
        // Gracefully close the socket
        if (connected_) {
            beast::error_code ec;
            stream_.socket().shutdown(tcp::socket::shutdown_both, ec);

            if (ec && ec != beast::errc::not_connected) {
                // doesn't throw, simply report
                std::cerr << "Error: " << beast::system_error{ec}.what()
                          << std::endl;
            }
        }
    }

    std::string GetAllObjectsMetadata();
    std::string GetObjectData(const std::string& obj_id);
    std::string GetObjectDataAsync(const std::string& obj_id);
    std::string GetReferences();
    std::string PushObjects(const std::string& data,
                            const std::vector<Ref>& refs,
                            bool push_refs = false);

    const std::string& GetRepoDir() const {
        return options_.repoPath;
    }

    std::string LoadObjectFromIPFS(std::string&& hash);
    std::string LoadObjectFromIPFSAsync(std::string&& hash);
    std::string SaveObjectToIPFS(const uint8_t* data, size_t size);

    using WaitFunc = std::function<void(size_t, const std::string&)>;
    bool WaitForCompletion(WaitFunc&&);
    size_t GetTransactionCount() const {
        return transactions_.size();
    }

private:
    std::string InvokeWallet(std::string args, bool create_tx) {
        args.append(",repo_id=")
            .append(GetRepoID())
            .append(",cid=")
            .append(GetCID());
        return InvokeShader(std::move(args), create_tx);
    }
    std::string InvokeWalletAsync(std::string args, bool create_tx) {
        args.append(",repo_id=")
            .append(GetRepoIDAsync())
            .append(",cid=")
            .append(GetCID());
        return InvokeShaderAsync(std::move(args), create_tx);
    }

    std::string SubUnsubEvents(bool sub);
    void EnsureConnected();
    void EnsureConnectedAsync();
    std::string ExtractResult(const std::string& response);
    std::string InvokeShader(const std::string& args, bool create_tx);
    std::string InvokeShaderAsync(const std::string& args, bool create_tx);
    const char* GetCID() const;
    const std::string& GetRepoID();
    const std::string& GetRepoIDAsync();
    std::string CallAPI(std::string&& request);
    std::string CallAPIAsync(std::string request);
    std::string ReadAPI();
    std::string ReadAPIAsync();
    void PrintVersion();
    // private:
public:
    net::io_context& ioc_;
    tcp::resolver resolver_;
    beast::tcp_stream stream_;
    bool connected_ = false;
    const Options& options_;
    std::string repo_id_;
    std::set<std::string> transactions_;
    std::string data_;
    boost::optional<net::yield_context> yield_ = boost::none;
};
}  // namespace sourc3
