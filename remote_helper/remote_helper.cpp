#include "wallet/core/contracts/shaders_manager.h"
#include "wallet/core/wallet_network.h"
#include "utility/cli/options.h"
#include "utility/logger.h"
#include "3rdparty/nlohmann/json.hpp"

#include <iostream>
#include <string>
#include <string_view>
#include <algorithm>
#include <vector>
#include <cstdlib>
#include <sstream>
#include <fstream>
#include <thread>
#include <map>
#include <stack>
#include <git2.h>
#include <boost/filesystem.hpp>
#include <boost/program_options.hpp>

using json = nlohmann::json;

using namespace std;
using namespace beam;
using namespace beam::wallet;

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

    struct MyManager
        :public ManagerStdInWallet
    {
        bool m_Done = false;
        bool m_Err = false;
        bool m_Async = false;

        using ManagerStdInWallet::ManagerStdInWallet;

        void OnDone(const std::exception* pExc) override
        {
            m_Done = true;
            m_Err = !!pExc;

            if (pExc)
                std::cerr << "Shader exec error: " << pExc->what() << std::endl;
            else
                std::cerr << "Shader output: " << m_Out.str() << std::endl;

            if (m_Async)
                io::Reactor::get_Current().stop();
        }

        static void Compile(ByteBuffer& res, const char* sz, Kind kind)
        {
            std::FStream fs;
            fs.Open(sz, true, true);

            res.resize(static_cast<size_t>(fs.get_Remaining()));
            if (!res.empty())
                fs.read(&res.front(), res.size());

            bvm2::Processor::Compile(res, res, kind);
        }
    };

    class SimpleWalletClient
    {
        static io::Address ResolveAddress(const std::string& uri)
        {
            io::Address addr;
            if (!addr.resolve(uri.c_str()))
                throw std::runtime_error("Failed to resolve node address");
            return addr;
        }
    public:
        struct Options
        {
            std::string nodeURI;
            std::string walletPath;
            std::string password;
            std::string appPath;
            std::string contractPath;
            std::string repoName;
            std::string repoPath = ".";
        };

        SimpleWalletClient(const Options& options)
            : m_WalletDB(WalletDB::open(options.walletPath, options.password))
            , m_Wallet(std::make_shared<Wallet>(m_WalletDB, [this](const auto& id) {OnTxCompleted(id); }))
            , m_NodeAddress(ResolveAddress(options.nodeURI))
            , m_NodeNet(std::make_shared<proto::FlyClient::NetworkStd>(*m_Wallet))
            , m_AppPath(options.appPath)
            , m_ContractPath(options.contractPath)
            , m_RepoName(options.repoName)
            , m_RepoPath(options.repoPath)
        {
            m_NodeNet->m_Cfg.m_vNodes.push_back(m_NodeAddress);
            m_NodeNet->Connect();
            m_Wallet->SetNodeEndpoint(m_NodeNet);
        }

        IWalletDB::Ptr GetWalletDB() const
        {
            return m_WalletDB;
        }

        Wallet::Ptr GetWallet() const
        {
            return m_Wallet;
        }

        void IncrementTxCount()
        {
            ++m_TxCount;
        }

        void Listen(bool waitForTxCompletion = false)
        {
            if (waitForTxCompletion && m_TxCount == 0)
                return;
            io::Reactor::get_Current().run();
        }

        bool InvokeShader(const std::string& appShader
            , const std::string& contractShader
            , std::string args)
        {
            //cerr << "Invoking shader: " << args << endl;
            m_Result = "";
            MyManager man(GetWalletDB(), GetWallet());

            if (appShader.empty())
                throw std::runtime_error("shader file not specified");

            MyManager::Compile(man.m_BodyManager, appShader.c_str(), MyManager::Kind::Manager);

            if (!contractShader.empty())
                MyManager::Compile(man.m_BodyContract, contractShader.c_str(), MyManager::Kind::Contract);

            if (!args.empty())
                man.AddArgs(&args[0]);

            man.set_Privilege(1);

            man.StartRun(man.m_Args.empty() ? 0 : 1); // scheme if no args

            if (!man.m_Done)
            {
                man.m_Async = true;
                io::Reactor::get_Current().run();

                if (!man.m_Done)
                {
                    // abort, propagate it
                    io::Reactor::get_Current().stop();
                    m_Result = man.m_Out.str();
                    return false;
                }
            }

            if (man.m_Err || man.m_vInvokeData.empty())
            {
                m_Result = man.m_Out.str();
                return false;
            }

            const auto comment = bvm2::getFullComment(man.m_vInvokeData);


            ByteBuffer msg(comment.begin(), comment.end());
            GetWallet()->StartTransaction(
                CreateTransactionParameters(TxType::Contract)
                .SetParameter(TxParameterID::ContractDataPacked, man.m_vInvokeData)
                .SetParameter(TxParameterID::Message, msg)
            );
            IncrementTxCount();
            return true;
        }

        const std::string& GetRepoDir() const
        {
            return m_RepoPath;
        }

        const std::string& GetCID()
        {
            if (m_cid.empty())
            {
                InvokeShader(m_AppPath, m_ContractPath, "role=manager,action=view_contracts");
                json root = json::parse(m_Result);
                
                assert(root.is_object());
                auto& contracts = root["contracts"];
                if (!contracts.empty())
                {
                    m_cid = contracts[0]["cid"].get<std::string>();
                }
            }
            return m_cid;
        }

        const std::string& GetRepoID()
        {
            if (m_RepoID.empty())
            {
                std::string request = "role=user,action=repo_id_by_name,repo_name=";
                request.append(m_RepoName)
                    .append(",cid=")
                    .append(GetCID());
                InvokeShader(m_AppPath, m_ContractPath, request);
                json root = json::parse(m_Result);

                assert(root.is_object());
                auto& id = root["repo_id"];
                m_RepoID = std::to_string(id.get<uint32_t>());
            }
            return m_RepoID;
        }


        std::string InvokeWallet(std::string args)
        {
            args.append(",repo_id=")
                .append(GetRepoID())
                .append(",cid=")
                .append(GetCID());
            InvokeShader(m_AppPath, m_ContractPath, std::move(args));
            return m_Result;
        }

    private:

        void OnTxCompleted(const TxID& id)
        {
            if (--m_TxCount == 0)
            {
                io::Reactor::get_Current().stop();
            }
        }

    private:
        IWalletDB::Ptr  m_WalletDB;
        Wallet::Ptr     m_Wallet;
        io::Address     m_NodeAddress;
        std::shared_ptr<proto::FlyClient::NetworkStd> m_NodeNet;
        size_t m_TxCount = 0;
        std::string     m_AppPath;
        std::string     m_ContractPath;
        std::string     m_RepoName;
        std::string     m_RepoPath;
        std::string     m_RepoID;
        std::string     m_Result;
        std::string     m_cid;
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
            return beam::to_hex(git_odb_object_data(object), git_odb_object_size(object));
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
        git_odb*        m_odb;
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
                }	break;
                case GIT_OBJECT_BLOB:
                {
                    auto& obj = CollectObject(*entry_oid);
                    obj.name = git_tree_entry_name(entry);
                    obj.fullPath = Join(m_path, obj.name);
                }	break;
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

    auto res = wc.InvokeWallet(ss.str());
    json root = json::parse(res);
    std::vector<Ref> refs;
    for (const auto& r : root["refs"])
    {
        auto& ref = refs.emplace_back();
        ref.name = r["name"].get<std::string>();
        git_oid_fromstr(&ref.target, r["commit_hash"].get<std::string>().c_str());
    }
    return refs;
}

int DoCapabilities(SimpleWalletClient& wc, const vector<string_view>& args);
int DoList(SimpleWalletClient& wc, const vector<string_view>& args)
{
    auto refs = RequestRefs(wc);
    json head;
    assert(!head.is_object());
    for(const auto& r : refs)
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
    objectHashes.push_back({ args[1].data(), args[1].size()});
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
        json root = json::parse(res);
        for (const auto& obj : root["objects"])
        {
            auto& o = objects.emplace_back();
            o.data_size = obj["object_size"];
            o.type = obj["object_type"];
            auto s = obj["object_hash"].get<std::string>();
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
        json root = json::parse(res);
        git_oid oid;
        git_oid_fromstr(&oid, objectHashes.front().data());
        auto data = root["object_data"].get<std::string>();
        auto buf = from_hex(data);
        
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
        git_reference_lookup(&localRef, c.m_repo, r.localRef.c_str());
        auto& lr = localRefs.emplace_back();
        git_oid_cpy(&lr, git_reference_target(localRef));
        git_reference_free(localRef);
    }

    std::set<git_oid> uploadedObjects;
    {
        // hack Collect objects metainfo
        auto res = wc.InvokeWallet("role=user,action=repo_get_meta");
        json root = json::parse(res);
        for (const auto& obj : root["objects"])
        {
            auto s = obj["object_hash"].get<std::string>();
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

        auto strData = beam::to_hex(buf.data(), buf.size());
        std::stringstream ss;
        ss << "role=user,action=push_objects,data="
            << strData << ',';
        for (const auto& r : c.m_refs)
        {
            ss << "ref=" << r.name << ",ref_target=" << beam::to_hex(&r.target, sizeof(r.target));
        }

        wc.InvokeWallet(ss.str());
    }
    
    wc.Listen(true);

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

    SimpleWalletClient::Options options;
    po::options_description desc("PIT config options");

    desc.add_options()
        (cli::NODE_ADDR_FULL, po::value<std::string>(&options.nodeURI), "address of node")
        (cli::WALLET_STORAGE, po::value<std::string>(&options.walletPath)->default_value("wallet.db"), "path to wallet file")
        (cli::PASS, po::value<string>(&options.password), "wallet password")
        (cli::SHADER_BYTECODE_APP, po::value<string>(&options.appPath)->default_value("app.wasm"), "Path to the app shader file")
        (cli::SHADER_BYTECODE_CONTRACT, po::value<string>(&options.contractPath)->default_value("contract.wasm"), "Path to the shader file for the contract (if the contract is being-created)");

    po::variables_map vm;
#ifdef WIN32
    const auto* homeDir = std::getenv("HOMEPATH");
#else
    const auto* homeDir = std::getenv("HOME");
#endif
    std::string configPath = "pit-remote.cfg";
    if (homeDir)
    {
        configPath = std::string(homeDir) + "/.pit/" + configPath;
    }
    ReadCfgFromFile(vm, desc, configPath.c_str());
    vm.notify();

    Rules::get().UpdateChecksum();
    io::Reactor::Ptr reactor = io::Reactor::create();
    io::Reactor::Scope scope(*reactor);
    auto logger = beam::Logger::create(LOG_LEVEL_DEBUG, LOG_SINK_DISABLED, LOG_LEVEL_DEBUG, "", "");
    string_view sv(argv[2]);
    const string_view SCHEMA = "pit://";
    options.repoName = sv.substr(SCHEMA.size()).data();
    auto* gitDir = std::getenv("GIT_DIR"); // set during clone
    if (gitDir)
    {
        options.repoPath = gitDir;
    }
    cerr << "Hello PIT.\nRemote:\t" << argv[1]
        << "\nURL:\t" << argv[2]
        << "\nWorking dir:\t" << boost::filesystem::current_path()
        << "\nRepo folder:\t" << options.repoPath
        << "\nWallet folder:\t" << options.walletPath
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

    return 0;
}
