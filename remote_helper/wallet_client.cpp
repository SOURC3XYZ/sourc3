#include "wallet_client.h"
#include <boost/json.hpp>
#include <boost/asio.hpp>

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

    template<typename Buf>
    std::size_t FindNewline(Buf const& buffers)
    {
        auto begin = net::buffers_iterator<Buf>::begin(buffers);
        auto end = net::buffers_iterator<Buf>::end(buffers);
        auto result = std::find(begin, end, '\n');

        if (result == end)
            return 0; // not found

        return result + 1 - begin;
    }

    std::string SimpleWalletClient::CallAPI(std::string&& request)
    {
        // snippet from boost beast sync http client example, there is no need for something complicated atm.
        EnsureConnected();
        request.push_back('\n');
        size_t s = request.size();
        size_t transferred = boost::asio::write(m_stream, boost::asio::buffer(request));
        if (s != transferred)
        {
            return "";
        }
        beast::multi_buffer buffer;
        boost::system::error_code ec;
        while (true)
        {
            auto pos = FindNewline(buffer.data());
            if (pos == 0)
            {
                auto bytesRead = m_stream.read_some(buffer.prepare(65536), ec);
                if (ec)
                {
                    std::cerr << "Error: " << ec.message() << std::endl;
                    return "";
                }
                buffer.commit(bytesRead);
            }
            else
            {
                break;
            }
            
        }
        

        return beast::buffers_to_string(buffer.data());
    }
}