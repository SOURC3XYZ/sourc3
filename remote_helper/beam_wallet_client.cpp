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

std::string BeamWalletClient::PushObjects(const State& expected_state,
                                            const State& desired_state,
                                            uint32_t new_object_count,
                                            uint32_t new_metas_count) {
    std::stringstream ss;
    auto desired_hash = ToHex(desired_state.hash.c_str(), desired_state.hash.size());
    auto expected_hash = ToHex(expected_state.hash.c_str(), expected_state.hash.size());
    ss << "role=user,action=push_state,expected=" << expected_hash
       << ",desired=" << desired_hash << ",objects=" << new_object_count
       << ",metas=" << new_metas_count;
    return InvokeWallet(ss.str());
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

std::string BeamWalletClient::ExtractResult(const std::string& response) {
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

std::string BeamWalletClient::InvokeShader(const std::string& args) {
    // std::cerr << "Args: " << args << std::endl;
    auto msg = json::value{
        {kJsonRpcHeader, kJsonRpcVersion},
        {"id", 1},
        {"method", "invoke_contract"},
        {"params", {{"contract_file", options().appPath}, {"args", args}}}};

    return ExtractResult(CallAPI(json::serialize(msg)));
}

const std::string& BeamWalletClient::GetCID() {
    if (cid_.empty()) {
        auto root =
            json::parse(InvokeShader("role=manager,action=view_contracts"));

        assert(root.is_object());
        auto& contracts = root.as_object()["contracts"];
        if (contracts.is_array() && !contracts.as_array().empty()) {
            cid_ =
                contracts.as_array()[0].as_object()["cid"].as_string().c_str();
        }
    }
    return cid_;
}

const std::string& BeamWalletClient::GetRepoID() {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=";
        request.append(options().repoName)
            .append(",repo_owner=")
            .append(options().repoOwner)
            .append(",cid=")
            .append(GetCID());

        auto root = json::parse(InvokeShader(request));
        assert(root.is_object());
        if (auto it = root.as_object().find("repo_id");
            it != root.as_object().end()) {
            auto& id = *it;
            repo_id_ = std::to_string(id.value().to_number<uint32_t>());
        }
    }
    return repo_id_;
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
                  << res->as_object()["beam_version"].as_string().c_str()
                  << " ("
                  << res->as_object()["beam_branch_name"].as_string().c_str()
                  << ")" << std::endl;
    }
}

std::string BeamWalletClient::LoadActualState() {
    return InvokeWallet("role=user,action=repo_get_state");
}

uint64_t BeamWalletClient::GetUploadedObjectCount() {
    auto res = json::parse(InvokeWallet("role=user,action=repo_get_statistic"));
    if (!res.is_object() || !res.as_object().contains("cur_objects") ||
        !res.as_object().contains("cur_metas")) {
        return 0;
    }
    auto res_obj = res.as_object();
    return res_obj["cur_objects"].as_uint64() +
           res_obj["cur_metas"].as_uint64();
}

}  // namespace sourc3
