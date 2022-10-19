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
#include <boost/asio/spawn.hpp>
#include "utils.h"
#include "git/object_collector.h"
#include "contract_state.hpp"
#include "base_client.h"

namespace sourc3 {

namespace beast = boost::beast;    // from <boost/beast.hpp>
namespace http = beast::http;      // from <boost/beast/http.hpp>
using Tcp = boost::asio::ip::tcp;  // from <boost/asio/ip/tcp.hpp>

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
                std::cerr << "Error: " << beast::system_error{ec}.what() << std::endl;
            }
        }
    }

    std::string PushObjects(const State& expected_state, const State& desired_state,
                            uint32_t new_object_count, uint32_t new_metas_count) final;
    std::string LoadActualState() final;
    uint64_t GetUploadedObjectCount() final;

    std::string LoadObjectFromIPFS(std::string hash) final;
    std::string SaveObjectToIPFS(const uint8_t* data, size_t size) final;
    std::string LoadObjectFromIPFSAsync(std::string hash,
                                        boost::asio::yield_context context) override;
    void LoadObjectFromIPFSAsync2(size_t id, std::string hash,
                                  boost::asio::yield_context context) override;
    std::string SaveObjectToIPFSAsync(const uint8_t* data, size_t size,
                                      boost::asio::yield_context context) override;
    void LoadObjectsFromIPFSAsync(const std::vector<std::string>& objects,
                                  ReadCallback read_callback) override;
    void SaveObjectsToIPFSAsync(const std::vector<ObjectInfo>& objects,
                                ReadCallback read_callback) override;
    void Load(std::set<std::string> object_hashes, ReadCallback read_callback);
    void GetObjectsDataAsync(std::set<std::string> object_hashes, ReadCallback read_callback,
                             FilterCallback received_callback);
    std::string ReadAPIResponseAsync(boost::asio::yield_context context) override;
    bool WaitForCompletion(WaitFunc&&) final;
    size_t GetTransactionCount() const final {
        return transactions_.size();
    }

    boost::asio::io_context& GetContext() final {
        return ioc_;
    }

private:
    std::string InvokeWallet(std::string args, bool create_tx) {
        args.append(",repo_id=").append(GetRepoID()).append(",cid=").append(GetCID());
        return InvokeShader(std::move(args), create_tx);
    }
    std::string InvokeWalletAsync(std::string args, bool create_tx, AsyncContext context) {
        args.append(",repo_id=").append(GetRepoIDAsync(context)).append(",cid=").append(GetCID());
        return InvokeShaderAsync(std::move(args), create_tx, context);
    }

    std::string SubUnsubEvents(bool sub);
    void EnsureConnected();
    void EnsureConnectedAsync(AsyncContext context);

public:
    std::string ExtractResult(const std::string& response);
    std::string InvokeShader(const std::string& args, bool create_tx);
    std::string InvokeShaderAsync(const std::string& args, bool create_tx, AsyncContext context);
    const char* GetCID() const;
    const std::string& GetRepoID();
    const std::string& GetRepoIDAsync(AsyncContext context);
    std::string CallAPI(std::string&& request);
    void LoadObjectFromIPFSAsync(size_t id, const std::string& hash,
                                 boost::asio::yield_context context);
    void SendObjectToIPFSAsync(size_t id, const uint8_t* data, size_t size, AsyncContext context);
    std::string ReadAPIResponceAsync(AsyncContext context);

public:
    void ListenAPIResponceAsync(std::function<void(std::string)> cb) override;
    bool SendAPIRequestAsync(std::string request, AsyncContext context);
    std::string CallAPIAsync(std::string request, AsyncContext context);
    std::string ReadAPI();
    std::string ReadAPIAsync(AsyncContext context);
    void PrintVersion();
    std::string GetInvokeShaderArgs(std::string args, bool create_tx);
    std::string GetInvokeShaderRequest(size_t id, const std::string& args, bool create_tx);
    void GetObjectDataAsync(size_t id, const std::string& obj_id,
                            IWalletClient::AsyncContext context);

public:
    std::string PushObjects(const std::string& data, const std::vector<sourc3::Ref>& refs,
                            bool push_refs) override;
    std::string GetAllObjectsMetadata() override;
    std::string GetAllObjectsData() override;
    std::string GetObjectData(const std::string& obj_id) override;
    std::string GetObjectDataAsync(const std::string& obj_id, AsyncContext context) override;
    void GetObjectDataAsync2(size_t id, const std::string& obj_id, AsyncContext context) override;
    std::string GetReferences() override;

private:
    boost::asio::io_context ioc_;
    Tcp::resolver resolver_;
    beast::tcp_stream stream_;
    bool connected_ = false;
    std::string repo_id_;
    std::string cid_;
    std::set<std::string> transactions_;
    std::string data_;
};
}  // namespace sourc3
