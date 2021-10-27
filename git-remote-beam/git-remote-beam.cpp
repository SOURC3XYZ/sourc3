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

using namespace std;

typedef int (*Action)(const vector<string_view>& args);

std::string DoSystemCall(const string& cmd)
{
	string t = cmd + " > t.txt";
	cerr << "System call: " << t << endl;
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
		cout << '\n' << endl;
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
			cerr << "Result: " << content << endl;
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
