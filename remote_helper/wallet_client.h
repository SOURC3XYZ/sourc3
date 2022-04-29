#pragma once

#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <iostream>
#include <set>
#include "utils.h"

namespace sourc3 {
constexpr const char JsonRpcHeader[] = "jsonrpc";
constexpr const char JsonRpcVersion[] = "2.0";

namespace beast = boost::beast;  // from <boost/beast.hpp>
namespace http = beast::http;    // from <boost/beast/http.hpp>
namespace net = boost::asio;     // from <boost/asio.hpp>
using tcp = net::ip::tcp;        // from <boost/asio/ip/tcp.hpp>

class SimpleWalletClient {
 public:
  struct Options {
    std::string apiHost;
    std::string apiPort;
    std::string apiTarget;
    std::string appPath;
    std::string repoOwner;
    std::string repoName;
    std::string repoPath = ".";
    bool useIPFS = true;
  };

  SimpleWalletClient(const Options& options)
      : resolver_(ioc_), stream_(ioc_), options_(options) {
  }

  ~SimpleWalletClient() {
    // Gracefully close the socket
    if (connected_) {
      beast::error_code ec;
      stream_.socket().shutdown(tcp::socket::shutdown_both, ec);

      if (ec && ec != beast::errc::not_connected) {
        // doesn't throw, simply report
        std::cerr << "Error: " << beast::system_error{ec}.what() << std::endl;
      }
    }
  }

  std::string InvokeWallet(std::string args) {
    args.append(",repo_id=")
        .append(GetRepoID())
        .append(",cid=")
        .append(GetCID());
    return InvokeShader(std::move(args));
  }

  const std::string& GetRepoDir() const {
    return options_.repoPath;
  }

  std::string LoadObjectFromIPFS(std::string&& hash);
  std::string SaveObjectToIPFS(const uint8_t* data, size_t size);

  using WaitFunc = std::function<void(size_t, const std::string&)>;
  bool WaitForCompletion(WaitFunc&&);
  size_t GetTransactionCount() const {
    return transactions_.size();
  }

 private:
  std::string SubUnsubEvents(bool sub);
  void EnsureConnected();
  std::string ExtractResult(const std::string& response);
  std::string InvokeShader(const std::string& args);
  const std::string& GetCID();
  const std::string& GetRepoID();
  std::string CallAPI(std::string&& request);
  std::string ReadAPI();

 private:
  net::io_context ioc_;
  tcp::resolver resolver_;
  beast::tcp_stream stream_;
  bool connected_ = false;
  const Options& options_;
  std::string repo_id_;
  std::string cid_;
  std::set<std::string> transactions_;
  std::string data_;
};
}  // namespace sourc3