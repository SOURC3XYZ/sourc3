
#define _CRT_SECURE_NO_WARNINGS // getenv
#include "object_collector.h"
#include "utils.h"
#include "wallet_client.h"

#include <boost/filesystem.hpp>
#include <boost/program_options.hpp>
#include <boost/json.hpp>
#include <boost/algorithm/hex.hpp>

#include <algorithm>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <map>
#include <sstream>
#include <stack>
#include <string_view>
#include <string>
#include <vector>
#include "version.h"

namespace po = boost::program_options;
namespace json = boost::json;
using namespace std;
using namespace pit;

namespace
{
    template<typename String>
    ByteBuffer FromHex(const String& s)
    {
        ByteBuffer res;
        res.reserve(s.size() / 2);
        boost::algorithm::unhex(s.begin(), s.end(), std::back_inserter(res));
        return res;
    }
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

int DoList(SimpleWalletClient& wc, [[maybe_unused]] const vector<string_view>& args)
{
    auto refs = RequestRefs(wc);

    for (const auto& r : refs)
    {
        cout << to_string(r.target) << " " << r.name << '\n';
    }
    if (!refs.empty())
    {
        cout << "@" << refs.back().name << " HEAD\n";
    }
    cout << endl;
    return 0;
}

int DoOption([[maybe_unused]] SimpleWalletClient& wc
           , [[maybe_unused]] const vector<string_view>& args)
{
    cerr << "Option: " << args[1] << "=" << args[2] << endl;
    cout << "ok" << endl;
    return 0;
}

int DoFetch(SimpleWalletClient& wc, const vector<string_view>& args)
{
    std::deque<std::string> objectHashes;
    objectHashes.emplace_back( args[1].data(), args[1].size() );
    std::set<std::string> receivedObjects;

    auto enuqueObject = [&](const std::string& oid)
    {
        if (receivedObjects.find(oid) == receivedObjects.end())
            objectHashes.push_back(oid);
    };

    git::RepoAccessor accessor(wc.GetRepoDir());
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
            o.type = static_cast<int8_t>(obj["object_type"].to_number<uint32_t>());
            std::string s = obj["object_hash"].as_string().c_str();
            git_oid_fromstr(&o.hash, s.c_str());
            if (git_odb_exists(*accessor.m_odb, &o.hash))
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

        auto it = std::find_if(objects.begin(), objects.end(), [&](auto&& o) { return o.hash == oid; });
        if (it == objects.end())
        {
            cout << "failed\n";
            break;
        }
        cerr << "Received data for:  " << objectHashes.front() << '\n';
        receivedObjects.insert(to_string(oid));

        auto data = root.as_object()["object_data"].as_string();

        ByteBuffer buf;
        if (it->IsIPFSObject())
        {
            auto hash = FromHex(data);
            auto responce = wc.LoadObjectFromIPFS(std::string(hash.cbegin(), hash.cend()));
            auto r = json::parse(responce);
            auto d = r.as_object()["result"].as_object()["data"].as_array();
            buf.reserve(d.size());
            for (auto&& v : d)
            {
                buf.emplace_back(static_cast<uint8_t>(v.get_int64()));
            }
        }
        else
        {
            buf = FromHex(data);
        }

        git_oid res_oid;
        auto type = it->GetObjectType();
        git_oid r;
        git_odb_hash(&r, buf.data(), buf.size(), type);
        if (r != oid)
        {
            // invalid hash
            return -1;
        }
        git_odb_write(&res_oid, *accessor.m_odb, buf.data(), buf.size(), type);
        if (type == GIT_OBJECT_TREE)
        {
            git::Tree tree;
            git_tree_lookup(tree.Addr(), *accessor.m_repo, &oid);

            auto count = git_tree_entrycount(*tree);
            for (size_t i = 0; i < count; ++i)
            {
                auto* entry = git_tree_entry_byindex(*tree, i);
                auto s = to_string(*git_tree_entry_id(entry));
                enuqueObject(s);
            }
        }
        else if (type == GIT_OBJECT_COMMIT)
        {
            git::Commit commit;
            git_commit_lookup(commit.Addr(), *accessor.m_repo, &oid);
            auto count = git_commit_parentcount(*commit);
            for (unsigned i = 0; i < count; ++i)
            {
                auto* id = git_commit_parent_id(*commit, i);
                auto s = to_string(*id);
                enuqueObject(s);
            }
            enuqueObject(to_string(*git_commit_tree_id(*commit)));
        }

        objectHashes.pop_front();
    }
    cout << endl;
    return 0;
}

int DoPush(SimpleWalletClient& wc, const vector<string_view>& args)
{
    ObjectCollector collector(wc.GetRepoDir());
    std::vector<Refs> refs;
    std::vector<git_oid> localRefs;
    for (size_t i = 1; i < args.size(); ++i)
    {
        auto& arg = args[i];
        auto p = arg.find(':');
        auto& r = refs.emplace_back();
        r.localRef = arg.substr(0, p);
        r.remoteRef = arg.substr(p + 1);
        git::Reference localRef;
        if (git_reference_lookup(localRef.Addr(), *collector.m_repo, r.localRef.c_str()) < 0)
        {
            cerr << "Local reference \'" << r.localRef << "\' doesn't exist" << endl;
            return -1;
        }
        auto& lr = localRefs.emplace_back();
        git_oid_cpy(&lr, git_reference_target(*localRef));
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
            git_merge_base(&base, *collector.m_repo, &remoteRef.target, &localRef);
        }
    }

    collector.Traverse(refs, mergeBases);

    for (auto& obj : collector.m_objects)
    {
        if (uploadedObjects.find(obj.oid) != uploadedObjects.end())
        {
            obj.selected = true;
        }
    }

    for (auto& obj : collector.m_objects)
    {
        if (obj.selected)
            continue;

        if (obj.type == GIT_OBJECT_BLOB && obj.GetSize() > 46)
        {
            auto res = wc.SaveObjectToIPFS(obj.GetData(), obj.GetSize());
            auto r = json::parse(res);
            auto hashStr = r.as_object()["result"].as_object()["hash"].as_string();
            obj.ipfsHash = ByteBuffer(hashStr.cbegin(), hashStr.cend());
        }
    }

    collector.Serialize([&](const auto& buf)
        {
            // log
            {
                const auto* p = reinterpret_cast<const ObjectsInfo*>(buf.data());
                const auto* cur = reinterpret_cast<const GitObject*>(p + 1);
                for (uint32_t i = 0; i < p->objects_number; ++i)
                {
                    size_t s = cur->data_size;
                    std::cerr << to_string(cur->hash) << '\t' << s << '\t' << (int)cur->type << '\n';
                    ++cur;
                    cur = reinterpret_cast<const GitObject*>(reinterpret_cast<const uint8_t*>(cur) + s);
                }
                std::cerr << std::endl;
            }

            auto strData = ToHex(buf.data(), buf.size());
            std::stringstream ss;
            ss << "role=user,action=push_objects,data="
                << strData << ',';
            for (const auto& r : collector.m_refs)
            {
                ss << "ref=" << r.name << ",ref_target=" << ToHex(&r.target, sizeof(r.target));
            }

            wc.InvokeWallet(ss.str());
        });

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

int DoCapabilities([[maybe_unused]] SimpleWalletClient& wc
                 , [[maybe_unused]] const vector<string_view>& args)
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
    cerr << "PIT v." << PROJECT_VERSION.data() << endl;
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
            ("use-ipfs", po::value<bool>(&options.useIPFS)->default_value(true), "Use IPFS to store large blobs")
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
        sv = sv.substr(SCHEMA.size());
        auto delimiterOwnerNamePos = sv.find('/');
        options.repoOwner = sv.substr(0, delimiterOwnerNamePos);
        options.repoName = sv.substr(delimiterOwnerNamePos + 1);
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
        git::Init init;
        string input;
        while (getline(cin, input, '\n'))
        {
            string_view args_sv(input.data(), input.size());
            vector<string_view> args;
            while (!args_sv.empty())
            {
                auto p = args_sv.find(' ');
                auto ss = args_sv.substr(0, p);
                args_sv.remove_prefix(p == string_view::npos ? ss.size() : ss.size() + 1);
                if (!ss.empty())
                {
                    args.emplace_back(ss);
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
