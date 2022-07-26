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

#include "eth_wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace sourc3 {
namespace json = boost::json;

std::string EthWalletClient::PushObjects(const State& expected_state,
                                         const State& desired_state,
                                         uint32_t new_object_count,
                                         uint32_t new_metas_count) {
    auto desired_hash =
        ToHex(desired_state.hash.c_str(), desired_state.hash.size());
    auto expected_hash =
        ToHex(expected_state.hash.c_str(), expected_state.hash.size());
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "pushState"},
                           {"params",
                            {{"repoId", GetRepoID()},
                             {"objsCount", new_object_count},
                             {"metasCount", new_metas_count},
                             {"expectedState", expected_hash},
                             {"state", desired_hash}}}};

    auto r = json::parse(CallEthAPI(json::serialize(msg)));

    // TODO: at that moment TX is done. If response contains
    // "transactionHash" - completed, else - failed.

    if (auto* txid =
            r.as_object()["result"].as_object().if_contains("transactionHash");
        txid) {
        // transactions_.insert(txid->as_string().c_str());

        // TODO: should return string with JSON?
        return "{}";
    }

    // TODO: on failed
    return "";
}

bool EthWalletClient::WaitForCompletion(WaitFunc&& func) {
    // TODO: is this method necessary?
    // TODO: implement
    func(1, "");
    return true;
}

void EthWalletClient::EnsureConnected() {
    if (connected_) {
        return;
    }

    auto const results =
        resolver_.resolve(options().ethApiHost, options().ethApiPort);

    // Make the connection on the IP address we get from a lookup
    stream_.connect(results);
    connected_ = true;
}

std::string EthWalletClient::CallEthAPI(std::string&& request) {
    EnsureConnected();

    // Set up an HTTP POST request message
    constexpr int kHttpVersion = 11;
    // TODO: set in the options?
    constexpr auto kTarget = "/";
    http::request<http::string_body> req{http::verb::post, kTarget,
                                         kHttpVersion};
    req.set(http::field::host, options().ethApiHost);
    req.set(http::field::user_agent, BOOST_BEAST_VERSION_STRING);
    req.set(http::field::content_type, "application/json");
    req.body() = request; 
    req.prepare_payload();

    // Send the HTTP request to the remote host
    http::write(stream_, req);

    // This buffer is used for reading and must be persisted
    beast::flat_buffer buffer;

    // Declare a container to hold the response
    http::response<http::dynamic_body> res;

    // Receive the HTTP response
    http::read(stream_, buffer, res);

    return boost::beast::buffers_to_string(res.body().data());
}

const std::string& EthWalletClient::GetRepoID() {
    if (repo_id_.empty()) {
        auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                               {"id", 1},
                               {"method", "getRepoId"},
                               {"params",
                                {{"owner", options().repoOwner},
                                 {"name", options().repoName}}}};

        auto root = json::parse(CallEthAPI(json::serialize(msg)));
        assert(root.is_object());

        if (auto it = root.as_object().find("result");
            it != root.as_object().end()) {
            repo_id_ = (*it).value().as_string().c_str();
        }
    }
    return repo_id_;
}

void EthWalletClient::PrintVersion() {
    auto msg = json::value{
        {kJsonRpcHeader, kJsonRpcVersion},
        {"id", 1},
        {"method", "get_netid"},
    };
    auto response = CallEthAPI(json::serialize(msg));
    auto r = json::parse(response);

    if (auto* res = r.as_object().if_contains("result"); res) {
        std::cerr << "Connected to network id " << res->as_int64() << std::endl;
    }
}

std::string EthWalletClient::LoadActualState() {
    constexpr auto kStateHashKey = "state";

    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "loadState"},
                           {"params", {{"repoId", GetRepoID()}}}};

    auto root = json::parse(CallEthAPI(json::serialize(msg)));
    assert(root.is_object());
    if (auto it = root.as_object().find("result");
        it != root.as_object().end() && (*it).value().is_object()) {
        auto& result = (*it).value().as_object();

        if (result.contains(kStateHashKey)) {
            // TODO: change
            result.emplace("hash", result[kStateHashKey].as_string().c_str());
            return json::serialize(result);
        }
    }
    throw std::runtime_error("Invalid response of the loadState method");
}

uint64_t EthWalletClient::GetUploadedObjectCount() {
    constexpr auto kCurObjectsKey = "curObjects";
    constexpr auto kCurMetasKey = "curMetas";

    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "loadState"},
                           {"params", {{"repoId", GetRepoID()}}}};

    auto root = json::parse(CallEthAPI(json::serialize(msg)));
    assert(root.is_object());
    if (auto it = root.as_object().find("result");
        it != root.as_object().end() && (*it).value().is_object()) {
        auto& result = (*it).value().as_object();

        if (result.contains(kCurObjectsKey) && result.contains(kCurMetasKey)) {
            // TODO: check
            return std::stoull(result[kCurObjectsKey].get_string().c_str()) +
                   std::stoull(result[kCurMetasKey].get_string().c_str());
        }
    }
    return 0;
}
}  // namespace sourc3
