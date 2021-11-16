﻿// git-remote-beam.cpp : Defines the entry point for the application.
//

#include "git-remote-beam.h"

#include <iostream>
#include <string>
#include <string_view>
#include <algorithm>
#include <vector>
#include <cstdlib>
#include <sstream>
#include <fstream>
#include "wallet/core/contracts/shaders_manager.h"
#include <thread>
#include <map>
#include <git2.h>

using namespace std;
using namespace beam;
using namespace beam::wallet;


bool operator<(const git_oid& left, const git_oid& right) noexcept
{
    return git_oid_cmp(&left, &right) < 0;
}

namespace
{
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

    struct Object
    {
        git_oid			oid;
        git_object_t	type;
        ByteBuffer		data;
        std::string		name;

        Object(const git_oid& o, git_object_t t, ByteBuffer&& b)
            : oid(o)
            , type(t)
            , data(std::move(b))
        {

        }
    };

    struct ObjectCollector
    {
        ObjectCollector()
        {
            git_repository_open(&m_repo, ".");
        }

        ~ObjectCollector()
        {
            git_repository_free(m_repo);
        }

        void Traverse(const std::vector<Refs> refs)
        {
            git_revwalk* walk = nullptr;
            git_revwalk_new(&walk, m_repo);
            git_revwalk_sorting(walk, GIT_SORT_TIME);
            for (const auto& ref : refs)
            {
                git_revwalk_push_ref(walk, ref.localRef.c_str());
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
                m_objects.emplace_back(oid, git_object_type(obj), ByteBuffer{});

                git_tree* tree = nullptr;
                git_commit* commit = nullptr;
                git_commit_lookup(&commit, m_repo, &oid);
                git_commit_tree(&tree, commit);

                m_set.emplace(*git_tree_id(tree));
                m_objects.emplace_back(*git_tree_id(tree), GIT_OBJECT_TREE, ByteBuffer{});
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
                    auto& obj = m_objects.emplace_back(*entry_oid, GIT_OBJECT_TREE, ByteBuffer{});
                    obj.name = git_tree_entry_name(entry);
                    git_tree* subTree = nullptr;
                    git_tree_lookup(&subTree, m_repo, entry_oid);
                    TraverseTree(subTree);
                }	break;
                case GIT_OBJECT_BLOB:
                {
                    auto& obj = m_objects.emplace_back(*entry_oid, GIT_OBJECT_BLOB, ByteBuffer{});
                    obj.name = git_tree_entry_name(entry);
                }	break;
                default:
                    break;
                }
            }
        }

        void ThrowIfError(int res, std::string_view sv)
        {
            if (res < 0)
            {
                throw std::runtime_error(sv.data());
            }
        }
        git_repository* m_repo;
        std::set<git_oid>			m_set;
        std::vector<Object>			m_objects;
    };

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
                std::cout << "Shader exec error: " << pExc->what() << std::endl;
            else
                std::cout << "Shader output: " << m_Out.str() << std::endl;

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

    bool InvokeShader(Wallet::Ptr wallet
        , IWalletDB::Ptr walletDB
        , const std::string& appShader
        , const std::string& contractShader
        , std::string args)
    {
        MyManager man(walletDB, wallet);

        if (appShader.empty())
            throw std::runtime_error("shader file not specified");

        MyManager::Compile(man.m_BodyManager, appShader.c_str(), MyManager::Kind::Manager);

        if (!contractShader.empty())
            MyManager::Compile(man.m_BodyContract, contractShader.c_str(), MyManager::Kind::Contract);

        if (!args.empty())
            man.AddArgs(args);

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
                return false;
            }
        }

        if (man.m_Err || man.m_vInvokeData.empty())
            return false;

        const auto comment = bvm2::getFullComment(man.m_vInvokeData);


        ByteBuffer msg(comment.begin(), comment.end());
        wallet->StartTransaction(
            CreateTransactionParameters(TxType::Contract)
            .SetParameter(TxParameterID::ContractDataPacked, man.m_vInvokeData)
            .SetParameter(TxParameterID::Message, msg)
        );
        return true;
    }
}

typedef int (*Action)(const vector<string_view>& args);

std::string DoSystemCall(const string& cmd)
{
    string t = cmd + " > t.txt";
    //cerr << "System call: " << t << endl;
    std::system(t.c_str());
    ostringstream ss;
    ss << ifstream("t.txt").rdbuf();
    string res = ss.str();
    if (!res.empty() && *res.rbegin() == '\n')
        res.pop_back();
    return res;
}

struct Command
{
    string_view command;
    Action action;
};

int DoCapabilities(const vector<string_view>& args);
int DoList(const vector<string_view>& args)
{
    //if (args[1] == "for-push")
    //{
    //	cout
    //		<< "@" << "refs/heads/master " << "HEAD" << '\n'
    //		<< "0f7dbc7b1e5b5b37183488594a5a5365ad3571ea" << " " << "refs/heads/master" << '\n'
    //		<< endl;
    //}
    //else
    {
        cout << "0e7dbc7b1e5b5b37183488594a5a5365ad3571ea" << " " << "refs/heads/master" << '\n' << endl;
    }
    return 0;
}

int DoOption(const vector<string_view>& args)
{
    cerr << "Option: " << args[1] << "=" << args[2] << endl;
    cout << "ok" << endl;
    return 0;
}

int DoFetch(const vector<string_view>& args)
{
    return 0;
}

int DoPush(const vector<string_view>& args)
{
    std::vector<Refs> refs;
    for (size_t i = 1; i < args.size(); ++i)
    {
        auto& arg = args[i];
        auto p = arg.find(':');
        auto& r = refs.emplace_back();
        r.localRef = arg.substr(0, p);
        r.remoteRef = arg.substr(p + 1);
    }

    ObjectCollector c;
    c.Traverse(refs);

    char buf[GIT_OID_HEXSZ + 1];
    for (const auto& obj : c.m_objects)
    {
        git_oid_fmt(buf, &obj.oid);
        buf[GIT_OID_HEXSZ] = '\0';
        cout << buf << '\t' << git_object_type2string(obj.type) << '\t' << obj.name;
        cout << '\n';

    }
    cout << endl;
    return 0;
}

Command g_Commands[] =
{
    {"capabilities",	DoCapabilities},
    {"list",			DoList },
    {"option",			DoOption},
    {"fetch",			DoFetch},
    {"push",			DoPush}
};

int DoCapabilities(const vector<string_view>& args)
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
        cerr << "USAGE: git-remote-beam <remote> <url>" << endl;
        return -1;
    }
    GitInit init;
    cerr << "Hello Beam.\nRemote:\t" << argv[1] << "\nURL:\t" << argv[2] << endl;
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

        if (it->action(args) == -1)
        {
            return -1;
        }
    }

    return 0;
}
