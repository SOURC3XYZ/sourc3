#include "wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>
#include <boost/scope_exit.hpp>
#include <boost/beast/core/buffers_adaptor.hpp>

namespace pit
{
    namespace json = boost::json;

    std::string SimpleWalletClient::LoadObjectFromIPFS(std::string&& hash)
    {
        auto msg = json::value
        {
            {JsonRpcHeader, JsonRpcVersion},
            {"id", 1},
            {"method", "ipfs_get"},
            {"params",
                {
                    {"hash", std::move(hash)},
                    {"timeout", 5000}
                }
            }
        };
        return CallAPI(json::serialize(msg));
    }

    std::string SimpleWalletClient::SaveObjectToIPFS(const uint8_t* data, size_t size)
    {
        auto msg = json::value
        {
            {JsonRpcHeader, JsonRpcVersion},
            {"id", 1},
            {"method", "ipfs_add"},
            {"params",
                {
                    {"data", json::array(data, data + size)},
                }
            }
        };
        return CallAPI(json::serialize(msg));
    }

    bool SimpleWalletClient::WaitForCompletion()
    {
        if (m_transactions.empty())
            return true; // ok

        SubUnsubEvents(true);
        BOOST_SCOPE_EXIT_ALL(&, this) {
            SubUnsubEvents(false);
        };

        while(!m_transactions.empty())
        {
            auto response = ReadAPI();
            auto r = json::parse(response);

            auto& res = r.as_object()["result"].as_object();
            if (res["change_str"].as_string() != "updated")
            {
                continue;
            }
            for (auto& val : res["txs"].as_array())
            {
                auto& tx = val.as_object();
                std::string txID = tx["txId"].as_string().c_str();
                auto it = m_transactions.find(txID);
                if (it == m_transactions.end())
                {
                    continue;
                }

                auto status = tx["status"].as_int64();
                if (status == 2 || status == 4)
                {
                    // failed
                    return false;
                }
                else if (status == 4)
                {
                    m_transactions.erase(txID);
                }
            }
        }
        return true;
    }

    std::string SimpleWalletClient::SubUnsubEvents(bool sub)
    {
        auto msg = json::value
        {
            {JsonRpcHeader, JsonRpcVersion},
            {"id", 1},
            {"method", "ev_subunsub"},
            {"params",
                {
                    {"ev_txs_changed", sub},
                }
            }
        };
        return CallAPI(json::serialize(msg));
    }

    void SimpleWalletClient::EnsureConnected()
    {
        if (m_connected)
            return;

        auto const results = m_resolver.resolve(m_options.apiHost, m_options.apiPort);

        // Make the connection on the IP address we get from a lookup
        m_stream.connect(results);
        m_connected = true;
    }

    std::string SimpleWalletClient::ExtractResult(const std::string& response)
    {
        auto r = json::parse(response);
        if (auto* txid = r.as_object()["result"].as_object().if_contains("txid"); txid)
        {
            m_transactions.insert(txid->as_string().c_str());
        }
        return r.as_object()["result"].as_object()["output"].as_string().c_str();
    }

    std::string SimpleWalletClient::InvokeShader(const std::string& args)
    {
        //std::cerr << "Args: " << args << std::endl;
        auto msg = json::value
        {
            {JsonRpcHeader, JsonRpcVersion},
            {"id", 1},
            {"method", "invoke_contract"},
            {"params",
                {
                    {"contract_file", m_options.appPath},
                    {"args", args}
                }
            }
        };

        return ExtractResult(CallAPI(json::serialize(msg)));
    }

    const std::string& SimpleWalletClient::GetCID()
    {
        if (m_cid.empty())
        {
            auto root = json::parse(InvokeShader("role=manager,action=view_contracts"));

            assert(root.is_object());
            auto& contracts = root.as_object()["contracts"];
            if (contracts.is_array() && !contracts.as_array().empty())
            {
                m_cid = contracts.as_array()[0].as_object()["cid"].as_string().c_str();
            }
        }
        return m_cid;
    }

    const std::string& SimpleWalletClient::GetRepoID()
    {
        if (m_repoID.empty())
        {
            std::string request = "role=user,action=repo_id_by_name,repo_name=";
            request.append(m_options.repoName)
                .append(",repo_owner=")
                .append(m_options.repoOwner)
                .append(",cid=")
                .append(GetCID());

            auto root = json::parse(InvokeShader(request));
            assert(root.is_object());
            if (auto it = root.as_object().find("repo_id"); it != root.as_object().end())
            {
                auto& id = *it;
                m_repoID = std::to_string(id.value().to_number<uint32_t>());
            }
        }
        return m_repoID;
    }

    std::string SimpleWalletClient::CallAPI(std::string&& request)
    {
        EnsureConnected();
        request.push_back('\n');
        size_t s = request.size();
        size_t transferred = boost::asio::write(m_stream, boost::asio::buffer(request));
        if (s != transferred)
        {
            return "";
        }
        return ReadAPI();
    }

    std::string SimpleWalletClient::ReadAPI()
    {
        auto n = boost::asio::read_until(m_stream, boost::asio::dynamic_buffer(m_data), '\n');
        auto line = m_data.substr(0, n);
        m_data.erase(0, n);
        return line;
    }
}