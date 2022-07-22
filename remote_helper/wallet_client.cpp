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
#include "beam_wallet_client.h"
#include "eth_wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace sourc3 {
namespace json = boost::json;

std::unique_ptr<SimpleWalletClient> SimpleWalletClient::CreateInstance(
    std::string_view network_name, const Options& options) {
    // TODO
    if (network_name == "eth") {
        return std::make_unique<EthWalletClient>(options);
    }
    return std::make_unique<BeamWalletClient>(options);
}

std::string SimpleWalletClient::LoadObjectFromIPFS(std::string hash) {
    auto msg =
        json::value{{kJsonRpcHeader, kJsonRpcVersion},
                    {"id", 1},
                    {"method", "ipfs_get"},
                    {"params", {{"hash", std::move(hash)}, {"timeout", 5000}}}};
    return CallAPI(json::serialize(msg));
}

std::string SimpleWalletClient::SaveObjectToIPFS(const uint8_t* data,
                                                 size_t size) {
    auto msg = json::value{{kJsonRpcHeader, kJsonRpcVersion},
                           {"id", 1},
                           {"method", "ipfs_add"},
                           {"params",
                            {
                                {"data", json::array(data, data + size)},
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

std::string SimpleWalletClient::ReadAPI() {
    auto n = boost::asio::read_until(stream_,
                                     boost::asio::dynamic_buffer(data_), '\n');
    auto line = data_.substr(0, n);
    data_.erase(0, n);
    return line;
}
}  // namespace sourc3
