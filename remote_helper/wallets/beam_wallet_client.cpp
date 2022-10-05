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

#include "beam_wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace sourc3 {
namespace json = boost::json;

std::string BeamWalletClient::PushObjects(const State& expected_state, const State& desired_state,
                                          uint32_t new_object_count, uint32_t new_metas_count) {
    std::stringstream ss;
    auto desired_hash = ToHex(desired_state.hash.c_str(), desired_state.hash.size());
    auto expected_hash = ToHex(expected_state.hash.c_str(), expected_state.hash.size());
    ss << "role=user,action=push_state,expected=" << expected_hash << ",desired=" << desired_hash
       << ",objects=" << new_object_count << ",metas=" << new_metas_count;
    return InvokeWallet(ss.str(), true);
}

std::string BeamWalletClient::LoadObjectFromIPFS(std::string hash) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_get"},
                           {"params", {{"hash", std::move(hash)}}}};
    return CallAPI(json::serialize(msg));
}

std::string BeamWalletClient::LoadObjectFromIPFSAsync(std::string hash,
                                                      boost::asio::yield_context context) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_get"},
                           {"params", {{"hash", std::move(hash)}}}};
    return CallAPIAsync(json::serialize(msg), context);
}

std::string BeamWalletClient::SaveObjectToIPFS(const uint8_t* data, size_t size) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_add"},
                           {"params",
                            {
                                {"data", json::array(data, data + size)},
                            }}};
    return CallAPI(json::serialize(msg));
}

std::string BeamWalletClient::SaveObjectToIPFSAsync(const uint8_t* data, size_t size,
                                                    boost::asio::yield_context context) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_add"},
                           {"params",
                            {
                                {"data", json::array(data, data + size)},
                            }}};
    return CallAPIAsync(json::serialize(msg), context);
}

bool BeamWalletClient::WaitForCompletion(WaitFunc&& func) {
    if (transactions_.empty()) {
        return true;  // ok
    }

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
            std::string tx_id = tx["txId"].as_string().c_str();
            auto it = transactions_.find(tx_id);
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
                transactions_.erase(tx_id);
            }
        }
    }
    return true;
}

std::string BeamWalletClient::SubUnsubEvents(bool sub) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ev_subunsub"},
                           {"params",
                            {
                                {"ev_txs_changed", sub},
                            }}};
    return CallAPI(json::serialize(msg));
}

void BeamWalletClient::EnsureConnected() {
    if (connected_) {
        return;
    }

    auto const results = resolver_.resolve(options_.apiHost, options_.apiPort);

    // Make the connection on the IP address we get from a lookup
    stream_.connect(results);
    connected_ = true;
}

void BeamWalletClient::EnsureConnectedAsync(AsyncContext context) {
    if (connected_) {
        return;
    }

    auto const results = resolver_.async_resolve(options_.apiHost, options_.apiPort, context);

    // Make the connection on the IP address we get from a lookup
    stream_.async_connect(results, context);
    connected_ = true;
}

std::string BeamWalletClient::ExtractResult(const std::string& response) {
    auto r = json::parse(response);
    if (auto* txid = r.as_object()["result"].as_object().if_contains("txid"); txid) {
        if (!std::all_of(txid->as_string().begin(), txid->as_string().end(), [](auto c) {
                return c == '0';
            })) {
            transactions_.insert(txid->as_string().c_str());
        }
    }
    return r.as_object()["result"].as_object()["output"].as_string().c_str();
}

std::string BeamWalletClient::InvokeShader(const std::string& args, bool create_tx) {
    auto msg = json::value{
        {kJsonRpcHeader, kJsonRpcVersion},
        {"id", 1},
        {"method", "invoke_contract"},
        {"params",
         {{"contract_file", options_.appPath}, {"args", args}, {"create_tx", create_tx}}}};

    return ExtractResult(CallAPI(json::serialize(msg)));
}

std::string BeamWalletClient::InvokeShaderAsync(const std::string& args, bool create_tx,
                                                IWalletClient::AsyncContext context) {
    auto msg = json::value{
        {kJsonRpcHeader, kJsonRpcVersion},
        {"id", 1},
        {"method", "invoke_contract"},
        {"params",
         {{"contract_file", options_.appPath}, {"args", args}, {"create_tx", create_tx}}}};

    return ExtractResult(CallAPIAsync(json::serialize(msg), context));
}

const char* BeamWalletClient::GetCID() const {
    return "202fd1ef42cd0b121b704fea306c8604f6065471f4c32a9192e7629b41558a60";
}

const std::string& BeamWalletClient::GetRepoID() {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=\"";
        request.append(options_.repoName)
            .append("\",repo_owner=")
            .append(options_.repoOwner)
            .append(",cid=")
            .append(GetCID());

        auto root = json::parse(InvokeShader(request, false));
        assert(root.is_object());
        if (auto it = root.as_object().find("repo_id"); it != root.as_object().end()) {
            auto& id = *it;
            repo_id_ = std::to_string(id.value().to_number<uint32_t>());
        }
    }
    return repo_id_;
}

const std::string& BeamWalletClient::GetRepoIDAsync(AsyncContext context) {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=";
        request.append(options_.repoName)
            .append(",repo_owner=")
            .append(options_.repoOwner)
            .append(",cid=")
            .append(GetCID());

        auto root = json::parse(InvokeShaderAsync(request, false, context));
        assert(root.is_object());
        if (auto it = root.as_object().find("repo_id"); it != root.as_object().end()) {
            auto& id = *it;
            repo_id_ = std::to_string(id.value().to_number<uint32_t>());
        }
    }
    return repo_id_;
}

std::string BeamWalletClient::CallAPI(std::string&& request) {
    EnsureConnected();
    request.push_back('\n');
    size_t s = request.size();
    size_t transferred = boost::asio::write(stream_, boost::asio::buffer(request));
    if (s != transferred) {
        return "";
    }
    return ReadAPI();
}

std::string BeamWalletClient::CallAPIAsync(std::string request, AsyncContext context) {
    EnsureConnectedAsync(context);
    request.push_back('\n');
    size_t s = request.size();
    size_t transferred = boost::asio::async_write(stream_, boost::asio::buffer(request), context);
    if (s != transferred) {
        return "";
    }
    return ReadAPIAsync(context);
}

std::string BeamWalletClient::ReadAPI() {
    auto n = boost::asio::read_until(stream_, boost::asio::dynamic_buffer(data_), '\n');
    auto line = data_.substr(0, n);
    data_.erase(0, n);
    return line;
}

std::string BeamWalletClient::ReadAPIAsync(AsyncContext context) {
    auto n =
        boost::asio::async_read_until(stream_, boost::asio::dynamic_buffer(data_), '\n', context);
    auto line = data_.substr(0, n);
    data_.erase(0, n);
    return line;
}

void BeamWalletClient::PrintVersion() {
    auto msg = json::value{
        {kJsonRpcHeader, kJsonRpcVersion},
        {"id", 1},
        {"method", "get_version"},
    };
    auto response = CallAPI(json::serialize(msg));
    auto r = json::parse(response);
    if (auto* res = r.as_object().if_contains("result"); res) {
        std::cerr << "Connected to Beam Wallet API "
                  << res->as_object()["beam_version"].as_string().c_str() << " ("
                  << res->as_object()["beam_branch_name"].as_string().c_str() << ")" << std::endl;
    }
}

std::string BeamWalletClient::LoadActualState() {
    return InvokeWallet("role=user,action=repo_get_state", false);
}

uint64_t BeamWalletClient::GetUploadedObjectCount() {
    auto res = json::parse(InvokeWallet("role=user,action=repo_get_statistic", false));
    if (!res.is_object() || !res.as_object().contains("cur_objects") ||
        !res.as_object().contains("cur_metas")) {
        return 0;
    }
    auto res_obj = res.as_object();
    return res_obj["cur_objects"].as_int64() + res_obj["cur_metas"].as_int64();
}

std::string BeamWalletClient::PushObjects(const std::string& data,
                                          const std::vector<sourc3::Ref>& refs, bool push_refs) {
    std::stringstream ss;
    ss << "role=user,action=push_objects";
    if (!data.empty()) {
        ss << ",data=" << data;
    }

    if (push_refs) {
        for (const auto& r : refs) {
            ss << ",ref=" << r.name << ",ref_target=" << ToHex(&r.target, sizeof(r.target));
        }
    }
    return InvokeWallet(ss.str(), true);
}

std::string BeamWalletClient::GetAllObjectsMetadata() {
    return InvokeWallet("role=user,action=repo_get_meta", false);
}

std::string BeamWalletClient::GetObjectData(const std::string& obj_id) {
    std::stringstream ss;
    ss << "role=user,action=repo_get_data,obj_id=" << obj_id;
    return InvokeWallet(ss.str(), false);
}

std::string BeamWalletClient::GetObjectDataAsync(const std::string& obj_id,
                                                 IWalletClient::AsyncContext context) {
    std::stringstream ss;
    ss << "role=user,action=repo_get_data,obj_id=" << obj_id;
    return InvokeWalletAsync(ss.str(), false, context);
}

std::string BeamWalletClient::GetReferences() {
    return InvokeWallet("role=user,action=list_refs", false);
}

}  // namespace sourc3