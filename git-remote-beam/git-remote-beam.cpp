// git-remote-beam.cpp : Defines the entry point for the application.
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

using namespace std;
using namespace beam;
using namespace beam::wallet;

namespace
{
	struct Ref
	{
		std::string hash;
		std::string name;
	};

	enum struct ObjectType
	{
		Blob,
		Commit,
		Tree
	};

	struct Object
	{
		enum Type
		{
			Blob,
			Commit,
			Tree
		};
		string	type;
		string	content;
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
		cout << "0e7dbc7b1e5b5b37183488594a5a5365ad3571ea" << " " << "refs/heads/master" <<'\n' << endl;
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
	map<string, Object> objects2;
	for (size_t i = 1; i < args.size(); ++i)
	{
		auto& ref = args[i];
		auto src = ref.substr(0, ref.find(':'));
		ostringstream ss;
		ss << "git rev-list --objects " << src;
		auto objects = DoSystemCall(ss.str());
		istringstream iss(objects);
		string object;
		while (getline(iss, object, '\n'))
		{
			auto hash = object.substr(0, object.find(' '));
			ss.str({});
			ss << "git cat-file -t " << hash;
			auto type = DoSystemCall(ss.str());
			ss.str({});
			ss << "git cat-file " << type << " " << hash;
			auto content = DoSystemCall(ss.str());
			objects2[hash] = Object { type, content };
			cerr
				<< object << '\n'
				<< hash << ' ' << type << endl;

			///
			{
				ofstream("f.txt") << content;
			}
			ss.str({});
			ss << "git hash-object -t " << type << " -w --stdin < f.txt";

			auto h = DoSystemCall(ss.str());
		}
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
