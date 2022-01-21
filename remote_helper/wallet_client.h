#pragma once

#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/json/src.hpp>
#include <iostream>

namespace pit
{
    constexpr const char JsonRpcHeader[] = "jsonrpc";
    constexpr const char JsonRpcVersion[] = "2.0";

    namespace beast = boost::beast;     // from <boost/beast.hpp>
    namespace http = beast::http;       // from <boost/beast/http.hpp>
    namespace net = boost::asio;        // from <boost/asio.hpp>
    using tcp = net::ip::tcp;           // from <boost/asio/ip/tcp.hpp>

    namespace json = boost::json;

    class SimpleWalletClient
    {
    public:
        struct Options
        {
            std::string apiHost;
            std::string apiPort;
            std::string apiTarget;
            std::string appPath;
            std::string repoOwner;
            std::string repoName;
            std::string repoPath = ".";
        };

        SimpleWalletClient(const Options& options)
            : m_resolver(m_ioc)
            , m_stream(m_ioc)
            , m_options(options)
        {

        }

        ~SimpleWalletClient()
        {
            // Gracefully close the socket
            if (m_connected)
            {
                beast::error_code ec;
                m_stream.socket().shutdown(tcp::socket::shutdown_both, ec);

                if (ec && ec != beast::errc::not_connected)
                {
                    // doesn't throw, simply report
                    std::cerr << "Error: " << beast::system_error{ ec }.what() << std::endl;
                }
            }
        }

        std::string InvokeWallet(std::string args)
        {
            args.append(",repo_id=")
                .append(GetRepoID())
                .append(",cid=")
                .append(GetCID());
            return InvokeShader(std::move(args));
        }

        const std::string& GetRepoDir() const
        {
            return m_options.repoPath;
        }

    private:

        void EnsureConnected()
        {
            if (m_connected)
                return;

            auto const results = m_resolver.resolve(m_options.apiHost, m_options.apiPort);

            // Make the connection on the IP address we get from a lookup
            m_stream.connect(results);
            m_connected = true;
        }

        std::string ExtractResult(const std::string& response)
        {
            auto r = json::parse(response);
            return r.as_object()["result"].as_object()["output"].as_string().c_str();
        }

        std::string InvokeShader(const std::string& args)
        {
            // snippet from boost beast sync http client example, there is no need for something complicated atm.

            EnsureConnected();

            std::cerr << "Args: " << args << std::endl;
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

            // Set up an HTTP GET request message
            http::request<http::string_body> req{ http::verb::get, m_options.apiTarget, 11 };
            req.set(http::field::host, m_options.apiHost);
            req.set(http::field::user_agent, "PIT/0.0.1");
            req.body() = json::serialize(msg);
            req.content_length(req.body().size());


            // Send the HTTP request to the remote host
            http::write(m_stream, req);

            // This buffer is used for reading and must be persisted
            beast::flat_buffer buffer;

            // Declare a container to hold the response
            http::response<http::dynamic_body> res;

            // Receive the HTTP response
            http::read(m_stream, buffer, res);

            // Write the message to standard out
            //std::cerr << res << std::endl;
            auto result = ExtractResult(beast::buffers_to_string(res.body().data()));
            std::cerr << "Result: " << result << std::endl;
            return result;
        }

        const std::string& GetCID()
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

        const std::string& GetRepoID()
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

    private:
        net::io_context     m_ioc;
        tcp::resolver       m_resolver;
        beast::tcp_stream   m_stream;
        bool                m_connected = false;
        const Options&      m_options;
        std::string         m_repoID;
        std::string         m_cid;
    };
}