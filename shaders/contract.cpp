#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

#include <algorithm>
#include <tuple>

using namespace GitRemoteBeam;

namespace {
	enum Operations {
		REPO_SIZE,
		REPO,
		OBJECTS,
		REFS_NUMBER,
		REFS,
	};
	constexpr Operations ALL_OPERATIONS[] = { REPO_SIZE, REPO, OBJECTS, REFS_NUMBER, REFS };
}

BEAM_EXPORT void Ctor(InitialParams& params)
{
	params.last_repo_id = 1;
	Env::SaveVar_T(0, params);
}

BEAM_EXPORT void Dtor(void*)
{
	Env::DelVar_T(0);
}

BEAM_EXPORT void Method_2(const CreateRepoParams& params)
{
	auto key1 = std::make_pair(params.repo_owner, params.repo_name);
	uint64_t repo_id;

	// halt if repo exists
	if (Env::LoadVar_T(key1, repo_id) && repo_id != 0) {
		Env::Halt();
	}

	InitialParams initial_params;
	Env::LoadVar_T(0, initial_params);

	repo_id = initial_params.last_repo_id++;

	Env::SaveVar_T(key1, initial_params.last_repo_id);
	Env::SaveVar_T(0, initial_params);

	RepoInfo repo_info;

	strncpy(repo_info.name, params.repo_name, MAX_NAME_SIZE);
	repo_info.owner = params.repo_owner;
	repo_info.users_number = 0;
	repo_info.repo_id = initial_params.last_repo_id++;

	auto key2 = std::make_pair(repo_id, ::Operations::REPO_SIZE);
	Env::SaveVar_T(key2, sizeof(repo_info));
	
	key2 = std::make_pair(repo_id, ::Operations::REPO);
	Env::SaveVar_T(key2, repo_info);

	key2 = std::make_pair(repo_id, ::Operations::REFS_NUMBER);
	Env::SaveVar_T(key2, size_t(0));

	Env::AddSig(repo_info.owner);
}

BEAM_EXPORT void Method_3(const DeleteRepoParams& params)
{
	auto key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	size_t repo_size;
	
	if (Env::LoadVar_T(key, repo_size)) {
		for (auto op : ::ALL_OPERATIONS) {
			auto key = std::make_pair(params.repo_id, op);
			if (op == ::Operations::REPO) {
				RepoInfo repo_info;
				Env::LoadVar_T(key, repo_info);	
				Env::DelVar_T(std::make_pair(repo_info.owner, repo_info.name));
				Env::AddSig(repo_info.owner);
			}
			Env::DelVar_T(key);
		}
	} else {
		Env::Halt();
	}
}

BEAM_EXPORT void Method_4(const AddUserParams& params)
{
	auto key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	Env::SaveVar_T(key, repo_size + sizeof(PubKey));

	key = std::make_pair(params.repo_id, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size + sizeof(PubKey));
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	repo_info->users[repo_info->users_number++] = params.user;
	Env::SaveVar(&key, sizeof(key), repo_info, repo_size + sizeof(PubKey), KeyTag::Internal);
	Env::Heap_Free(repo_info);

	Env::AddSig(repo_info->owner);
}

BEAM_EXPORT void Method_5(const RemoveUserParams& params)
{
	auto key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	key = std::make_pair(params.repo_id, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size);
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	size_t deleted_users_number = 0;
	for (size_t i = 0; i < repo_info->users_number; ++i) {
		if (Env::Memcmp(&params.user, &repo_info->users[i], sizeof(params.user))) {
			++deleted_users_number;
		} else if (deleted_users_number > 0) {
			repo_info->users[i - deleted_users_number] = repo_info->users[i];
		}
	}

	Env::SaveVar(&key, sizeof(key), repo_info, repo_size - deleted_users_number * sizeof(PubKey), KeyTag::Internal);
	key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	Env::SaveVar_T(key, repo_size - deleted_users_number * sizeof(PubKey));
	Env::Heap_Free(repo_info);

	Env::AddSig(repo_info->owner);
}

BEAM_EXPORT void Method_6(const PushObjectsParams& params)
{
	auto key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	key = std::make_pair(params.repo_id, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size);
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	auto it = std::find_if(repo_info->users, repo_info->users + repo_info->users_number, [&](const auto& a) {
		return !Env::Memcmp(&params.user, &a, sizeof(params.user));
	});

	if (!Env::Memcmp(&repo_info->owner, &params.user, sizeof(params.user)) || it == &repo_info->users[repo_info->users_number]) {
		Env::Halt();
	}

	for (size_t i = 0; i < params.objects_info.objects_number; ++i) {
		auto key = std::make_tuple(params.repo_id, params.objects_info.objects[i].hash, ::Operations::OBJECTS);
		Env::SaveVar(&key, sizeof(key), &params.objects_info.objects[i], sizeof(GitObject) + params.objects_info.objects[i].data_size, KeyTag::Internal);
	}

	Env::AddSig(params.user);
}

BEAM_EXPORT void Method_7(const PushRefsParams& params)
{
	auto key = std::make_pair(params.repo_id, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	key = std::make_pair(params.repo_id, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size);
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	auto it = std::find_if(repo_info->users, repo_info->users + repo_info->users_number, [&](const auto& a) {
		return !Env::Memcmp(&params.user, &a, sizeof(params.user));
	});

	if (!Env::Memcmp(&repo_info->owner, &params.user, sizeof(params.user)) || it == &repo_info->users[repo_info->users_number]) {
		Env::Halt();
	}

	for (size_t i = 0; i < params.refs_info.refs_number; ++i) {
		auto key = std::make_tuple(params.repo_id, params.refs_info.refs[i].name, ::Operations::REFS);
		Env::SaveVar_T(key, params.refs_info.refs[i].commit_hash);
	}

	Env::AddSig(params.user);
}
