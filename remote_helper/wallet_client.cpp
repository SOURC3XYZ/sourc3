#include "wallet_client.h"
#include <boost/json.hpp>

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

    std::string SimpleWalletClient::ExtractResult(const std::string& response)
    {
        auto r = json::parse(response);
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

        auto result = ExtractResult(CallAPI(json::serialize(msg)));
        //std::cerr << "Result: " << result << std::endl;
        return result;
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
        // snippet from boost beast sync http client example, there is no need for something complicated atm.
        EnsureConnected();
        // Set up an HTTP GET request message
        http::request<http::string_body> req{ http::verb::get, m_options.apiTarget, 11 };
        req.set(http::field::host, m_options.apiHost);
        req.set(http::field::user_agent, "PIT/0.0.1"); // TODO: add version here
        req.body() = std::move(request);
        req.content_length(req.body().size());

        // Send the HTTP request to the remote host
        http::write(m_stream, req);

        // This buffer is used for reading and must be persisted
        beast::flat_buffer buffer;

        // Declare a container to hold the response
        http::response<http::dynamic_body> res;

        // Receive the HTTP response
        http::read(m_stream, buffer, res);

        return beast::buffers_to_string(res.body().data());
    }
}