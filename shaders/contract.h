#pragma once

#include <cstddef>
#include "Shaders/common.h"

namespace GitRemoteBeam
{
    enum Operations {
        REPO,
        OBJECTS,
        REFS,
    };
    constexpr Operations ALL_OPERATIONS[] = { REPO, OBJECTS, REFS };

	static const size_t MAX_NAME_SIZE = 128;

#pragma pack(push, 1)

	typedef Opaque<20> git_oid;

	struct RepoInfo
	{
		struct Key
		{
			PubKey owner;
			char name[MAX_NAME_SIZE];
			Key(const PubKey& o, const char n[MAX_NAME_SIZE])
				: owner(o)
			{
				Env::Memcpy(&name, n, MAX_NAME_SIZE);
			}
		};
		using ID = uint64_t;
		char name[MAX_NAME_SIZE];
		ID repo_id;
		PubKey owner;
	};

	struct GitObject
	{
		enum Type { BLOB, COMMIT, TREE } type;
		git_oid hash;
		size_t data_size;
		char data[];

		GitObject& operator=(const GitObject& from)
		{
			this->hash = from.hash;
			this->data_size = from.data_size;
			this->type = from.type;
			Env::Memcpy(this->data, from.data, from.data_size);
			return *this;
		}
	};

	struct GitRef
	{
		char name[MAX_NAME_SIZE];
		git_oid commit_hash;

		GitRef& operator=(const GitRef& from)
		{
			this->commit_hash = from.commit_hash;
			Env::Memcpy(this->name, from.name, MAX_NAME_SIZE);
			return *this;
		}
	};

	struct ObjectsInfo 
	{
		size_t objects_number;
		GitObject objects[];
	};

	struct RefsInfo
	{
		size_t refs_number;
		GitRef refs[];
	};

	struct RepoUser
	{
		struct Key
		{
			PubKey user;
			RepoInfo::ID repo_id;
			Key(const PubKey& u, RepoInfo::ID id)
				: user(u)
				, repo_id(id)
			{}
		};
	};

	struct InitialParams
	{
		static const uint32_t METHOD = 0;
		uint64_t last_repo_id;
	};

	struct CreateRepoParams
	{
		static const uint32_t METHOD = 2;
		char repo_name[MAX_NAME_SIZE];
		PubKey repo_owner;
	};

	struct DeleteRepoParams
	{
		static const uint32_t METHOD = 3;
		uint64_t repo_id;
	};

	struct AddUserParams
	{
		static const uint32_t METHOD = 4;
		uint64_t repo_id;
		PubKey user;
	};

	struct RemoveUserParams
	{
		static const uint32_t METHOD = 5;
		uint64_t repo_id;
		PubKey user;
	};

	struct PushObjectsParams
	{
		static const uint32_t METHOD = 6;
		uint64_t repo_id;
		PubKey user;
		ObjectsInfo objects_info;
	};

	struct PushRefsParams
	{
		static const uint32_t METHOD = 7;
		uint64_t repo_id;
		PubKey user;
		RefsInfo refs_info;
	};

#pragma pack(pop)
}
