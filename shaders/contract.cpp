#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

#include <algorithm>
#include <tuple>

using namespace GitRemoteBeam;

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
	auto key1 = RepoInfo::Key(params.repo_owner, params.repo_name);
	uint64_t repo_id = 0;

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
	repo_info.repo_id = repo_id;

	auto key2 = std::make_pair(repo_id, Operations::REPO);
	Env::SaveVar_T(key2, repo_info);

	Env::AddSig(repo_info.owner);
}

BEAM_EXPORT void Method_3(const DeleteRepoParams& params)
{
	auto key = std::make_pair(params.repo_id, Operations::REPO);
	RepoInfo repo_info;
	
	if (Env::LoadVar_T(key, repo_info)) {
		Env::DelVar_T(RepoInfo::Key(repo_info.owner, repo_info.name));
		Env::DelVar_T(RepoUser::Key(repo_info.owner, repo_info.repo_id));
		Env::AddSig(repo_info.owner);
		for (auto op : ALL_OPERATIONS) {
			auto key = std::make_pair(params.repo_id, op);
			Env::DelVar_T(key);
		}
	} else {
		Env::Halt();
	}
}

BEAM_EXPORT void Method_4(const AddUserParams& params)
{
	auto key = std::make_pair(params.repo_id, Operations::REPO);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	}

	auto key_user = RepoUser::Key(params.user, repo_info.repo_id);
	Env::SaveVar_T(key_user, true);

	Env::AddSig(repo_info.owner);
}

BEAM_EXPORT void Method_5(const RemoveUserParams& params)
{
	auto key = std::make_pair(params.repo_id, Operations::REPO);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	}

	auto key_user = RepoUser::Key(params.user, repo_info.repo_id);
	bool is_exist;

	if (Env::LoadVar_T(key_user, is_exist)) {
		Env::DelVar_T(key_user);
	}

	Env::AddSig(repo_info.owner);
}

BEAM_EXPORT void Method_6(const PushObjectsParams& params)
{
	auto key = std::make_pair(params.repo_id, Operations::REPO);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	}

	auto key_user = RepoUser::Key(params.user, repo_info.repo_id);
	bool is_exist;

	if (!Env::LoadVar_T(key_user, is_exist)) {
		Env::Halt();
	}
	
	for (size_t i = 0; i < params.objects_info.objects_number; ++i) {
		auto key = std::make_tuple(params.repo_id, params.objects_info.objects[i].hash, Operations::OBJECTS);
		Env::SaveVar(&key, sizeof(key), &params.objects_info.objects[i], sizeof(GitObject) + params.objects_info.objects[i].data_size, KeyTag::Internal);
	}

	Env::AddSig(params.user);
}

BEAM_EXPORT void Method_7(const PushRefsParams& params)
{
	auto key = std::make_pair(params.repo_id, Operations::REPO);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	}

	auto key_user = RepoUser::Key(params.user, repo_info.repo_id);
	bool is_exist;

	if (!Env::LoadVar_T(key_user, is_exist)) {
		Env::Halt();
	}

	for (size_t i = 0; i < params.refs_info.refs_number; ++i) {
		auto key = std::make_tuple(params.repo_id, params.refs_info.refs[i].name, Operations::REFS);
		Env::SaveVar_T(key, params.refs_info.refs[i].commit_hash);
	}

	Env::AddSig(params.user);
}
