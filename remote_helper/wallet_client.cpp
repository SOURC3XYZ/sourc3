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

#include "wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace sourc3 {
namespace json = boost::json;

std::string SimpleWalletClient::GetAllObjectsMetadata() {
    return InvokeWallet("role=user,action=repo_get_meta", false);
}

std::string SimpleWalletClient::GetObjectData(const std::string& obj_id) {
    std::stringstream ss;
    ss << "role=user,action=repo_get_data,obj_id=" << obj_id;
    return InvokeWallet(ss.str(), false);
}

std::string SimpleWalletClient::GetObjectDataAsync(const std::string& obj_id,
                                                   net::yield_context yield) {
    std::stringstream ss;
    ss << "role=user,action=repo_get_data,obj_id=" << obj_id;
    return InvokeWalletAsync(ss.str(), false, yield);
}

std::string SimpleWalletClient::GetReferences() {
    return InvokeWallet("role=user,action=list_refs", false);
}

std::string SimpleWalletClient::PushObjects(const std::string& data,
                                            const std::vector<Ref>& refs,
                                            bool push_refs) {
    std::stringstream ss;
    ss << "role=user,action=push_objects";
    if (!data.empty()) {
        ss << ",data=" << data;
    }

    if (push_refs) {
        for (const auto& r : refs) {
            ss << ",ref=" << r.name
               << ",ref_target=" << ToHex(&r.target, sizeof(r.target));
        }
    }
    return InvokeWallet(ss.str(), true);
}

std::string SimpleWalletClient::LoadObjectFromIPFS(std::string&& hash) {
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_get"},
                           {"params", {{"hash", std::move(hash)}}}};
    return CallAPI(json::serialize(msg));
}

std::string SimpleWalletClient::LoadObjectFromIPFSAsync(
    std::string&& hash, net::yield_context yield) {
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_get"},
                           {"params", {{"hash", std::move(hash)}}}};
    return CallAPIAsync(json::serialize(msg), yield);
}

std::string SimpleWalletClient::SaveObjectToIPFS(const uint8_t* data,
                                                 size_t size) {
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_add"},
                           {"params",
                            {
                                {"data", json::array(data, data + size)},
                            }}};
    return CallAPI(json::serialize(msg));
}

bool SimpleWalletClient::WaitForCompletion(WaitFunc&& func) {
    if (transactions_.empty())
        return true;  // ok

    SubUnsubEvents(true);
    BOOST_SCOPE_EXIT_ALL(&, this) {
        SubUnsubEvents(false);
    };
    size_t done = 0;
    while (!transactions_.empty()) {
        auto response = ReadAPI();
        auto r = json::parse(response);

        auto& res = r.as_object()["result"].as_object();

        for (auto& val : res["txs"].as_array()) {
            auto& tx = val.as_object();
            std::string txID = tx["txId"].as_string().c_str();
            auto it = transactions_.find(txID);
            if (it == transactions_.end()) {
                continue;
            }

            auto status = tx["status"].as_int64();
            if (status == 4) {
                func(++done, tx["failure_reason"].as_string().c_str());
                return false;
            } else if (status == 2) {
                func(++done, "canceled");
                return false;
            } else if (status == 3) {
                func(++done, "");
                transactions_.erase(txID);
            }
        }
    }
    return true;
}

std::string SimpleWalletClient::SubUnsubEvents(bool sub) {
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "ev_subunsub"},
                           {"params",
                            {
                                {"ev_txs_changed", sub},
                            }}};
    return CallAPI(json::serialize(msg));
}

void SimpleWalletClient::EnsureConnected() {
    if (connected_) {
        return;
    }

    auto const results = resolver_.resolve(options_.apiHost, options_.apiPort);

    // Make the connection on the IP address we get from a lookup
    stream_.connect(results);
    connected_ = true;
}

void SimpleWalletClient::EnsureConnectedAsync(net::yield_context yield) {
    if (connected_) {
        return;
    }

    auto const results =
        resolver_.async_resolve(options_.apiHost, options_.apiPort, yield);

    // Make the connection on the IP address we get from a lookup
    stream_.async_connect(results, yield);
    connected_ = true;
}

std::string SimpleWalletClient::ExtractResult(const std::string& response) {
    auto r = json::parse(response);
    if (auto* txid = r.as_object()["result"].as_object().if_contains("txid");
        txid) {
        if (!std::all_of(txid->as_string().begin(), txid->as_string().end(),
                         [](auto c) {
                             return c == '0';
                         })) {
            transactions_.insert(txid->as_string().c_str());
        }
    }
    return r.as_object()["result"].as_object()["output"].as_string().c_str();
}

std::string SimpleWalletClient::InvokeShader(const std::string& args,
                                             bool create_tx) {
    // std::cerr << "Args: " << args << std::endl;
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "invoke_contract"},
                           {"params",
                            {{"contract_file", options_.appPath},
                             {"args", args},
                             {"create_tx", create_tx}}}};

    return ExtractResult(CallAPI(json::serialize(msg)));
}

std::string SimpleWalletClient::InvokeShaderAsync(const std::string& args,
                                                  bool create_tx,
                                                  net::yield_context yield) {
    // std::cerr << "Args: " << args << std::endl;
    auto msg = json::value{{JsonRpcHeader, JsonRpcVersion},
                           {"id", 1},
                           {"method", "invoke_contract"},
                           {"params",
                            {{"contract_file", options_.appPath},
                             {"args", args},
                             {"create_tx", create_tx}}}};

    return ExtractResult(CallAPIAsync(json::serialize(msg), yield));
}

const char* SimpleWalletClient::GetCID() const {
    return "17885447b4c5f78b65ac01bfa5d63d6bc2dd7b239c6cd7ef57a918adba2071d3";
}

const std::string& SimpleWalletClient::GetRepoID() {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=\"";
        request.append(options_.repoName)
            .append("\",repo_owner=")
            .append(options_.repoOwner)
            .append(",cid=")
            .append(GetCID());

        auto root = json::parse(InvokeShader(request, false));
        assert(root.is_object());
        if (auto it = root.as_object().find("repo_id");
            it != root.as_object().end()) {
            auto& id = *it;
            repo_id_ = std::to_string(id.value().to_number<uint32_t>());
        }
    }
    return repo_id_;
}

const std::string& SimpleWalletClient::GetRepoIDAsync(
    net::yield_context yield) {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=\"";
        request.append(options_.repoName)
            .append("\",repo_owner=")
            .append(options_.repoOwner)
            .append(",cid=")
            .append(GetCID());

        auto root = json::parse(InvokeShaderAsync(request, false, yield));
        assert(root.is_object());
        if (auto it = root.as_object().find("repo_id");
            it != root.as_object().end()) {
            auto& id = *it;
            repo_id_ = std::to_string(id.value().to_number<uint32_t>());
        }
    }
    return repo_id_;
}

std::string SimpleWalletClient::CallAPI(std::string&& request) {
    EnsureConnected();
    request.push_back('\n');
    size_t s = request.size();
    size_t transferred =
        boost::asio::write(stream_, boost::asio::buffer(request));
    if (s != transferred) {
        return "";
    }
    return ReadAPI();
}

std::string SimpleWalletClient::CallAPIAsync(std::string request,
                                             net::yield_context yield) {
    EnsureConnectedAsync(yield);
    request.push_back('\n');
    size_t s = request.size();
    size_t transferred =
        boost::asio::async_write(stream_, boost::asio::buffer(request), yield);
    if (s != transferred) {
        return "";
    }
    return ReadAPIAsync(yield);
}

std::string SimpleWalletClient::ReadAPI() {
    auto n = boost::asio::read_until(stream_,
                                     boost::asio::dynamic_buffer(data_), '\n');
    auto line = data_.substr(0, n);
    data_.erase(0, n);
    return line;
}

std::string SimpleWalletClient::ReadAPIAsync(net::yield_context yield) {
    auto n = boost::asio::async_read_until(
        stream_, boost::asio::dynamic_buffer(data_), '\n', yield);
    auto line = data_.substr(0, n);
    data_.erase(0, n);
    return line;
}

void SimpleWalletClient::PrintVersion() {
    auto msg = json::value{
        {JsonRpcHeader, JsonRpcVersion},
        {"id", 1},
        {"method", "get_version"},
    };
    auto response = CallAPI(json::serialize(msg));
    auto r = json::parse(response);
    if (auto* res = r.as_object().if_contains("result"); res) {
        std::cerr << "Connected to Beam Wallet API "
                  << res->as_object()["beam_version"].as_string().c_str()
                  << " ("
                  << res->as_object()["beam_branch_name"].as_string().c_str()
                  << ")" << std::endl;
    }
}
}  // namespace sourc3
