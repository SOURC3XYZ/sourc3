#pragma once

#include <cstddef>
#include <git2.h>

namespace GitRemoteBeam
{
	static const size_t MAX_NAME_SIZE = 256;
#pragma pack(push, 1)

	struct RepoInfo
	{
		char name[MAX_NAME_SIZE];
		PubKey owner;
		size_t users_number;
		PubKey users[];
	};

	struct GitObject
	{
		enum Type { BLOB, COMMIT, TREE } type;
		git_oid hash;
		size_t data_size;
		char data[];
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
		size_t objects_number;
		size_t refs_number;
		char objects_and_refs[];
	};

#pragma pack(pop)
}
