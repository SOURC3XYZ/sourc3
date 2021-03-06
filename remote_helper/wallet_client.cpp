#include "wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace sourc3 {
namespace json = boost::json;

std::string SimpleWalletClient::LoadObjectFromIPFS(std::string&& hash) {
    auto msg =
        json::value{{JsonRpcHeader, JsonRpcVersion},
                    {"id", 1},
                    {"method", "ipfs_get"},
                    {"params", {{"hash", std::move(hash)}, {"timeout", 5000}}}};
    return CallAPI(json::serialize(msg));
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

std::string SimpleWalletClient::InvokeShader(const std::string& args) {
    // std::cerr << "Args: " << args << std::endl;
    auto msg = json::value{
        {JsonRpcHeader, JsonRpcVersion},
        {"id", 1},
        {"method", "invoke_contract"},
        {"params", {{"contract_file", options_.appPath}, {"args", args}}}};

    return ExtractResult(CallAPI(json::serialize(msg)));
}

const std::string& SimpleWalletClient::GetCID() {
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

const std::string& SimpleWalletClient::GetRepoID() {
    if (repo_id_.empty()) {
        std::string request = "role=user,action=repo_id_by_name,repo_name=";
        request.append(options_.repoName)
            .append(",repo_owner=")
            .append(options_.repoOwner)
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
