
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/filesystem.hpp>
#include <boost/program_options.hpp>
#include <boost/json/src.hpp>
#include <boost/algorithm/hex.hpp>

#include <algorithm>
#include <cstdlib>
#include <cstdlib>
#include <fstream>
#include <git2.h>
#include <iostream>
#include <map>
#include <sstream>
#include <stack>
#include <string_view>
#include <string>
#include <vector>

namespace beast = boost::beast;     // from <boost/beast.hpp>
namespace http = beast::http;       // from <boost/beast/http.hpp>
namespace net = boost::asio;        // from <boost/asio.hpp>
using tcp = net::ip::tcp;           // from <boost/asio/ip/tcp.hpp>

namespace json = boost::json;
namespace po = boost::program_options;

using namespace std;

namespace std
{
    string to_string(const git_oid& oid)
    {
        std::string r;
        r.resize(GIT_OID_HEXSZ);
        git_oid_fmt(r.data(), &oid);
        return r;
    }
}

bool operator<(const git_oid& left, const git_oid& right) noexcept
{
    return git_oid_cmp(&left, &right) < 0;
}

bool operator==(const git_oid& left, const git_oid& right) noexcept
{
    return git_oid_cmp(&left, &right) == 0;
}

namespace
{
    constexpr const char JsonRpcHeader[] = "jsonrpc";
    constexpr const char JsonRpcVersion[] = "2.0";

    using ByteBuffer = std::vector<uint8_t>;

    std::string ToHex(const void* p, size_t size)
    {
        std::string res;
        res.reserve(size * 2);
        const uint8_t* pp = static_cast<const uint8_t*>(p);
        boost::algorithm::hex(pp, pp + size, std::back_inserter(res));
        return res;
    }

    template<typename String>
    ByteBuffer FromHex(const String& s)
    {
        ByteBuffer res;
        res.reserve(s.size() / 2);
        boost::algorithm::unhex(s.begin(), s.end(), std::back_inserter(res));
        return res;
    }

#pragma pack(push, 1)
    struct GitObject
    {
        int8_t type;
        git_oid hash;
        uint32_t data_size;
        // followed by data
    };

    struct ObjectsInfo
    {
        uint32_t objects_number;
        //GitObject objects[];
    };
#pragma pack(pop)

    class SimpleWalletClient
    {
    public:
        struct Options
        {
            std::string apiHost;
            std::string apiPort;
            std::string apiTarget;
            std::string appPath;
            std::string repoName;
            std::string repoPath = ".";
#ifdef BEAM_IPFS_SUPPORT
            bool        useIPFS = true;
#endif // BEAM_IPFS_SUPPORT

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
                    cerr << "Error: " << beast::system_error{ec}.what() << endl;
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

            cerr << "Args: " << args << endl;
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

    struct GitInit
    {
        GitInit() noexcept
        {
            git_libgit2_init();
        }
        ~GitInit() noexcept
        {
            git_libgit2_shutdown();
        }
    };

    struct Refs
    {
        std::string localRef;
        std::string remoteRef;
    };

    struct Ref
    {
        std::string name;
        git_oid     target;
    };

    struct Object
    {
        git_oid			oid;
        git_object_t	type;
        git_odb_object* object;

        std::string		name;
        std::string     fullPath;
        bool            selected = false;

        Object(const git_oid& o, git_object_t t, git_odb_object* obj)
            : oid(o)
            , type(t)
            , object(obj)
        {

        }

        Object(const Object& other)
            : oid(other.oid)
            , type(other.type)
        {
            git_odb_object_dup(&object, other.object);
        }

        Object& operator=(const Object& other)
        {
            if (this != &other)
            {
                oid = other.oid;
                type = other.type;
                git_odb_object_dup(&object, other.object);
            }
            return *this;
        }

        Object(Object&& other) noexcept
            : oid(other.oid)
            , type(other.type)
            , object(std::exchange(other.object, nullptr))
        {
        }

        Object& operator=(Object&& other) noexcept
        {
            if (this != &other)
            {
                oid = other.oid;
                type = other.type;
                object = std::exchange(other.object, nullptr);
            }
            return *this;
        }

        ~Object()
        {
            git_odb_object_free(object);
        }

        std::string GetDataString() const
        {
            return ToHex(git_odb_object_data(object), git_odb_object_size(object));
        }

        const uint8_t* GetData() const
        {
            return static_cast<const uint8_t*>(git_odb_object_data(object));
        }

        size_t GetSize() const
        {
            return git_odb_object_size(object);
        }
    };

    struct GitRepoAccessor
    {
        GitRepoAccessor(const std::string& dir)
        {
            if (git_repository_open(&m_repo, dir.c_str()) < 0)
            {
                throw std::runtime_error("Failed to open repository!");
            }
            if (git_repository_odb(&m_odb, m_repo) < 0)
            {
                throw std::runtime_error("Failed to open repository database!");
            }
        }

        ~GitRepoAccessor()
        {
            git_odb_free(m_odb);
            git_repository_free(m_repo);
        }

        git_repository* m_repo;
        git_odb* m_odb;
    };

    struct ObjectCollector : GitRepoAccessor
    {
        using GitRepoAccessor::GitRepoAccessor;
        void Traverse(const std::vector<Refs> refs, const std::vector<git_oid>& hidden)
        {
            git_revwalk* walk = nullptr;
            git_revwalk_new(&walk, m_repo);
            git_revwalk_sorting(walk, GIT_SORT_TIME);
            for (const auto& h : hidden)
            {
                git_revwalk_hide(walk, &h);
            }
            for (const auto& ref : refs)
            {
                git_revwalk_push_ref(walk, ref.localRef.c_str());
                auto& r = m_refs.emplace_back();
                git_reference_name_to_id(&r.target, m_repo, ref.localRef.c_str());
                r.name = ref.remoteRef;
            }
            git_oid oid;
            while (!git_revwalk_next(&oid, walk))
            {
                // commits
                git_object* obj = nullptr;
                git_object_lookup(&obj, m_repo, &oid, GIT_OBJECT_ANY);
                auto p = m_set.emplace(oid);
                if (!p.second)
                {
                    continue;
                }
                git_odb_object* dbobj = nullptr;
                git_odb_read(&dbobj, m_odb, &oid);
                m_objects.emplace_back(oid, git_object_type(obj), dbobj);

                git_tree* tree = nullptr;
                git_commit* commit = nullptr;
                git_commit_lookup(&commit, m_repo, &oid);
                git_commit_tree(&tree, commit);

                m_set.emplace(*git_tree_id(tree));
                CollectObject(*git_tree_id(tree));
                TraverseTree(tree);
                git_commit_free(commit);
                git_tree_free(tree);
            }

            git_revwalk_free(walk);
        }

        void TraverseTree(const git_tree* tree)
        {
            for (size_t i = 0; i < git_tree_entrycount(tree); ++i)
            {
                auto* entry = git_tree_entry_byindex(tree, i);
                auto* entry_oid = git_tree_entry_id(entry);
                auto p = m_set.emplace(*entry_oid);
                if (!p.second)
                    continue; // already visited

                auto type = git_tree_entry_type(entry);
                switch (type)
                {
                case GIT_OBJECT_TREE:
                {
                    auto& obj = CollectObject(*entry_oid);
                    obj.name = git_tree_entry_name(entry);
                    obj.fullPath = Join(m_path, obj.name);
                    m_path.push_back(obj.name);
                    git_tree* subTree = nullptr;
                    git_tree_lookup(&subTree, m_repo, entry_oid);
                    TraverseTree(subTree);
                    m_path.pop_back();
                }   break;
                case GIT_OBJECT_BLOB:
                {
                    auto& obj = CollectObject(*entry_oid);
                    obj.name = git_tree_entry_name(entry);
                    obj.fullPath = Join(m_path, obj.name);
                }   break;
                default:
                    break;
                }
            }
        }

        std::string Join(const std::vector<std::string>& path, const std::string& name)
        {
            std::string res;
            for (const auto& p : m_path)
            {
                res.append(p);
                res.append("/");
            }
            res.append(name);
            return res;
        }

        Object& CollectObject(const git_oid& oid)
        {
            git_odb_object* dbobj = nullptr;
            git_odb_read(&dbobj, m_odb, &oid);

            auto objSize = git_odb_object_size(dbobj);
            auto& obj = m_objects.emplace_back(oid, git_odb_object_type(dbobj), dbobj);
            git_oid r;
            git_odb_hash(&r, git_odb_object_data(dbobj), objSize, git_odb_object_type(dbobj));

            m_maxSize = std::max(m_maxSize, objSize);
            m_totalSize += objSize;

            return obj;
        }

        void ThrowIfError(int res, std::string_view sv)
        {
            if (res < 0)
            {
                throw std::runtime_error(sv.data());
            }
        }
        std::set<git_oid>           m_set;
        std::vector<Object>         m_objects;
        std::vector<Ref>            m_refs;
        size_t                      m_maxSize = 0;
        size_t                      m_totalSize = 0;
        std::vector<std::string>    m_path;
    };
}

typedef int (*Action)(SimpleWalletClient& wc, const vector<string_view>& args);

struct Command
{
    string_view command;
    Action action;
};

std::vector<Ref> RequestRefs(SimpleWalletClient& wc)
{
    std::stringstream ss;
    ss << "role=user,action=list_refs";

    std::vector<Ref> refs;
    auto res = wc.InvokeWallet(ss.str());
    if (!res.empty())
    {
        auto root = json::parse(res);
        for (auto& rv : root.as_object()["refs"].as_array())
        {
            auto& ref = refs.emplace_back();
            auto& r = rv.as_object();
            ref.name = r["name"].as_string().c_str();
            git_oid_fromstr(&ref.target, r["commit_hash"].as_string().c_str());
        }
    }
    return refs;
}

int DoCapabilities(SimpleWalletClient& wc, const vector<string_view>& args);

int DoList(SimpleWalletClient& wc, const vector<string_view>& args)
{
    auto refs = RequestRefs(wc);

    for (const auto& r : refs)
    {
        cout << std::to_string(r.target) << " " << r.name << '\n';
    }
    if (!refs.empty())
    {
        cout << "@" << refs.back().name << " HEAD\n";
    }
    cout << endl;
    return 0;
}

int DoOption(SimpleWalletClient& wc, const vector<string_view>& args)
{
    cerr << "Option: " << args[1] << "=" << args[2] << endl;
    cout << "ok" << endl;
    return 0;
}

int DoFetch(SimpleWalletClient& wc, const vector<string_view>& args)
{
    std::deque<std::string> objectHashes;
    objectHashes.push_back({ args[1].data(), args[1].size() });
    std::set<std::string> receivedObjects;

    auto enuqueObject = [&](const std::string& oid)
    {
        if (receivedObjects.find(oid) == receivedObjects.end())
            objectHashes.push_back(oid);
    };

    GitRepoAccessor accessor(wc.GetRepoDir());
    std::vector<GitObject> objects;
    {
        // hack Collect objects metainfo
        auto res = wc.InvokeWallet("role=user,action=repo_get_meta");
        auto root = json::parse(res);
        for (auto& objVal : root.as_object()["objects"].as_array())
        {
            auto& o = objects.emplace_back();
            auto& obj = objVal.as_object();
            o.data_size = obj["object_size"].to_number<uint32_t>();
            o.type = obj["object_type"].to_number<uint8_t>();
            std::string s = obj["object_hash"].as_string().c_str();
            git_oid_fromstr(&o.hash, s.c_str());
            if (git_odb_exists(accessor.m_odb, &o.hash))
                receivedObjects.insert(s);
        }
    }

    while (!objectHashes.empty())
    {
        std::stringstream ss;
        ss << "role=user,action=repo_get_data,obj_id=" << objectHashes.front();

        auto res = wc.InvokeWallet(ss.str());
        auto root = json::parse(res);
        git_oid oid;
        git_oid_fromstr(&oid, objectHashes.front().data());
        auto data = root.as_object()["object_data"].as_string();
        auto buf = FromHex(data);

        auto it = std::find_if(objects.begin(), objects.end(), [&](const auto& o) {return o.hash == oid; });
        if (it == objects.end())
        {
            cout << "failed\n";
            break;
        }
        cerr << "Received data for:  " << objectHashes.front() << '\n';
        receivedObjects.insert(to_string(oid));
        git_oid res_oid;
        git_object_t type = git_object_t(it->type);
        git_oid r;
        git_odb_hash(&r, buf.data(), buf.size(), type);
        git_odb_write(&res_oid, accessor.m_odb, buf.data(), buf.size(), type);
        if (type == GIT_OBJECT_TREE)
        {
            git_tree* tree = nullptr;
            git_tree_lookup(&tree, accessor.m_repo, &oid);

            auto count = git_tree_entrycount(tree);
            for (size_t i = 0; i < count; ++i)
            {
                auto* entry = git_tree_entry_byindex(tree, i);
                auto s = to_string(*git_tree_entry_id(entry));
                enuqueObject(s);
            }

            git_tree_free(tree);
        }
        else if (type == GIT_OBJECT_COMMIT)
        {
            git_commit* commit = nullptr;
            git_commit_lookup(&commit, accessor.m_repo, &oid);
            auto count = git_commit_parentcount(commit);
            for (unsigned i = 0; i < count; ++i)
            {
                auto* id = git_commit_parent_id(commit, i);
                auto s = to_string(*id);
                enuqueObject(s);
            }
            enuqueObject(to_string(*git_commit_tree_id(commit)));

            git_commit_free(commit);
        }

        objectHashes.pop_front();
    }
    cout << endl;
    return 0;
}

int DoPush(SimpleWalletClient& wc, const vector<string_view>& args)
{
    ObjectCollector c(wc.GetRepoDir());
    std::vector<Refs> refs;
    std::vector<git_oid> localRefs;
    for (size_t i = 1; i < args.size(); ++i)
    {
        auto& arg = args[i];
        auto p = arg.find(':');
        auto& r = refs.emplace_back();
        r.localRef = arg.substr(0, p);
        r.remoteRef = arg.substr(p + 1);
        git_reference* localRef = nullptr;
        if (git_reference_lookup(&localRef, c.m_repo, r.localRef.c_str()) < 0)
        {
            cerr << "Local reference \'" << r.localRef << "\' doesn't exist" << endl;
            return -1;
        }
        auto& lr = localRefs.emplace_back();
        git_oid_cpy(&lr, git_reference_target(localRef));
        git_reference_free(localRef);
    }

    std::set<git_oid> uploadedObjects;
    {
        // hack Collect objects metainfo
        auto res = wc.InvokeWallet("role=user,action=repo_get_meta");
        auto root = json::parse(res);
        for (auto& obj : root.as_object()["objects"].as_array())
        {
            auto s = obj.as_object()["object_hash"].as_string();
            git_oid oid;
            git_oid_fromstr(&oid, s.c_str());
            uploadedObjects.insert(oid);
        }
    }

    auto remoteRefs = RequestRefs(wc);
    std::vector<git_oid> mergeBases;
    for (const auto& remoteRef : remoteRefs)
    {
        for (const auto& localRef : localRefs)
        {
            auto& base = mergeBases.emplace_back();
            git_merge_base(&base, c.m_repo, &remoteRef.target, &localRef);
        }
    }

    c.Traverse(refs, mergeBases);

    for (auto& obj : c.m_objects)
    {
        if (uploadedObjects.find(obj.oid) != uploadedObjects.end())
        {
            obj.selected = true;
        }
    }

    constexpr size_t SIZE_THRESHOLD = 500000;
    while (true)
    {
        uint32_t count = 0;
        size_t size = 0;
        std::vector<size_t> indecies;
        for (size_t i = 0; i < c.m_objects.size(); ++i)
        {
            auto& obj = c.m_objects[i];
            if (obj.selected)
                continue;

            auto s = sizeof(GitObject) + obj.GetSize();
            if (size + s <= SIZE_THRESHOLD)
            {
                size += s;
                ++count;
                indecies.push_back(i);
                obj.selected = true;
            }
            if (size == SIZE_THRESHOLD)
                break;
        }
        if (count == 0)
            break;

        // serializing
        ByteBuffer buf;
        buf.resize(size + sizeof(ObjectsInfo)); // objects count size
        auto* p = reinterpret_cast<ObjectsInfo*>(buf.data());
        p->objects_number = count;
        auto* serObj = reinterpret_cast<GitObject*>(p + 1);
        for (size_t i = 0; i < count; ++i)
        {
            const auto& obj = c.m_objects[indecies[i]];
            serObj->data_size = static_cast<uint32_t>(obj.GetSize());
            serObj->type = static_cast<int8_t>(obj.type);
            git_oid_cpy(&serObj->hash, &obj.oid);
            auto* data = reinterpret_cast<uint8_t*>(serObj + 1);
            std::copy_n(obj.GetData(), obj.GetSize(), data);
            serObj = reinterpret_cast<GitObject*>(data + obj.GetSize());
        }

        {
            const GitObject* cur = reinterpret_cast<const GitObject*>(p + 1);
            for (uint32_t i = 0; i < p->objects_number; ++i)
            {
                size_t s = cur->data_size;
                cerr << to_string(cur->hash) << '\t' << s << '\t' << (int)cur->type << '\n';
                ++cur;
                cur = reinterpret_cast<const GitObject*>(reinterpret_cast<const uint8_t*>(cur) + s);
            }
            cerr << endl;
        }

        auto strData = ToHex(buf.data(), buf.size());
        std::stringstream ss;
        ss << "role=user,action=push_objects,data="
            << strData << ',';
        for (const auto& r : c.m_refs)
        {
            ss << "ref=" << r.name << ",ref_target=" << ToHex(&r.target, sizeof(r.target));
        }

        wc.InvokeWallet(ss.str());
    }

    cout << endl;
    return 0;
}

Command g_Commands[] =
{
    {"capabilities",	DoCapabilities},
    {"list",			DoList },
    //{"option",			DoOption},
    {"fetch",			DoFetch},
    {"push",			DoPush}
};

int DoCapabilities(SimpleWalletClient& wc, const vector<string_view>& args)
{
    for (auto ib = begin(g_Commands) + 1, ie = end(g_Commands); ib != ie; ++ib)
    {
        cout << ib->command << '\n';
    }
    cout << endl;
    return 0;
}

int main(int argc, char* argv[])
{
    if (argc != 3)
    {
        cerr << "USAGE: git-remote-pit <remote> <url>" << endl;
        return -1;
    }
    try
    {
        SimpleWalletClient::Options options;
        po::options_description desc("PIT config options");

        desc.add_options()
            ("api-host", po::value<std::string>(&options.apiHost)->default_value("localhost"), "Wallet API host")
            ("api-port", po::value<std::string>(&options.apiPort)->default_value("10000"), "Wallet API port")
            ("api-target", po::value<std::string>(&options.apiTarget)->default_value("/api/wallet"), "Wallet API target")
            ("app-shader-file", po::value<string>(&options.appPath)->default_value("app.wasm"), "Path to the app shader file")
            ;
        po::variables_map vm;
#ifdef WIN32
        const auto* homeDir = std::getenv("USERPROFILE");
#else
        const auto* homeDir = std::getenv("HOME");
#endif
        std::string configPath = "pit-remote.cfg";
        if (homeDir)
        {
            configPath = std::string(homeDir) + "/.pit/" + configPath;
        }
        cerr << "Reading config from: " << configPath << "..." << endl;
        const auto fullPath = boost::filesystem::system_complete(configPath).string();
        std::ifstream cfg(fullPath);
        if (cfg)
        {
            po::store(po::parse_config_file(cfg, desc), vm);
        }
        vm.notify();

        string_view sv(argv[2]);
        const string_view SCHEMA = "pit://";
        options.repoName = sv.substr(SCHEMA.size()).data();
        auto* gitDir = std::getenv("GIT_DIR"); // set during clone
        if (gitDir)
        {
            options.repoPath = gitDir;
        }
        cerr << "Hello PIT."
            "\n     Remote: " << argv[1]
            << "\n        URL: " << argv[2]
            << "\nWorking dir: " << boost::filesystem::current_path()
            << "\nRepo folder: " << options.repoPath
            << endl;
        SimpleWalletClient walletClient(options);
        GitInit init;
        string input;
        while (getline(cin, input, '\n'))
        {
            string_view sv(input.data(), input.size());
            vector<string_view> args;
            while (!sv.empty())
            {
                auto p = sv.find(' ');
                auto ss = sv.substr(0, p);
                sv.remove_prefix(p == string_view::npos ? ss.size() : ss.size() + 1);
                if (!ss.empty())
                {
                    args.emplace_back(move(ss));
                }
            }
            if (args.empty())
                return 0;

            const auto& command = args[0];

            auto it = find_if(begin(g_Commands), end(g_Commands),
                [&](const auto& c)
                {
                    return command == c.command;
                });
            if (it == end(g_Commands))
            {
                cerr << "Unknown command: " << command << endl;
                return -1;
            }
            cerr << "Command: " << input << endl;

            if (it->action(walletClient, args) == -1)
            {
                return -1;
            }
        }
    }
    catch (const exception& ex)
    {
        cerr << "Error: " << ex.what() << endl;
        return -1;
    }

    return 0;
}
