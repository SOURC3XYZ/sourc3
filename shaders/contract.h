#pragma once

#include <cstddef>
#include <git2.h>

namespace GitRemoteBeam
{
	static const size_t MAX_NAME_SIZE = 256;
	static const size_t MAX_DATA_SIZE = 1024;
	static const size_t MAX_REFS = 1024;
	static const size_t MAX_OBJECTS = 1024;
#pragma pack(push, 1)

	struct RepoInfo
	{
		static const size_t MAX_USERS = 100;

		char name[MAX_NAME_SIZE];
		PubKey owner;
		PubKey users[MAX_USERS];
	};

	struct GitObject
	{
		enum Type { BLOB, COMMIT, TREE } type;
		git_oid hash;
		char data[MAX_DATA_SIZE];
	};

	struct GitRef
	{
		char name[MAX_NAME_SIZE];
		git_oid commit_hash;
	};

	struct InitialParams
	{
		static const uint32_t METHOD = 0;
	};

	struct CreateRepoParams
	{
		static const uint32_t METHOD = 2;
		char repo_name[MAX_NAME_SIZE];
	};

	struct DeleteRepoParams
	{
		static const uint32_t METHOD = 3;
		char repo_name[MAX_NAME_SIZE];
	};

	struct AddUserParams
	{
		static const uint32_t METHOD = 4;
		char repo_name[MAX_NAME_SIZE];
		PubKey user;
	};

	struct RemoveUserParams
	{
		static const uint32_t METHOD = 5;
		char repo_name[MAX_NAME_SIZE];
		PubKey user;
	};

	struct PushParams
	{
		static const uint32_t METHOD = 6;
		char repo_name[MAX_NAME_SIZE];
		PubKey repo_owner;
		GitObject objects[MAX_OBJECTS];
		GitRef refs[MAX_REFS];
	};

#pragma pack(pop)
}
