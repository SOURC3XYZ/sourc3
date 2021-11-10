#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

#include <utility>

using namespace GitRemoteBeam;

BEAM_EXPORT void Ctor(InitialParams& params)
{
	Env::SaveVar_T(0, params);
}

BEAM_EXPORT void Dtor(void*)
{
	Env::DelVar_T(0);
}

BEAM_EXPORT void Method_2(const CreateRepoParams& params)
{
	auto key = std::make_pair(params.repo.owner, params.repo.name);
	RepoInfo repo_info;

	// halt if repo with this owner exists
	if (Env::LoadVar_T(key, repo_info))
		Env::Halt();

	strncpy(repo_info.name, params.repo.name, MAX_NAME_SIZE);
	repo_info.owner = params.repo.owner;
	repo_info.users_number = 0;
	Env::AddSig(params.repo.owner);
	Env::SaveVar_T(key, repo_info);
}

BEAM_EXPORT void Method_3(const DeleteRepoParams& params)
{
	auto key = std::make_pair(params.repo.owner, params.repo.name);
	RepoInfo repo_info;
	if (Env::LoadVar_T(key, repo_info)) {
		Env::DelVar_T(key);
	} else {
		Env::Halt();
	}
	Env::AddSig(params.repo.owner);
}

BEAM_EXPORT void Method_4(AddUserParams& params)
{
	auto key = std::make_pair(params.repo.owner, params.repo.name);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	} else {
		if (params.repo.users_number == repo_info.users_number + 1) {
			params.repo.users[0] = params.user;
			for (size_t i = 1; i < params.repo.users_number; ++i) {
				params.repo.users[i] = repo_info.users[i - 1];
			}
			Env::SaveVar_T(key, params.repo);
		} else {
			Env::Halt();
		}
	}

	Env::AddSig(params.repo.owner);
}

BEAM_EXPORT void Method_5(RemoveUserParams& params)
{
	auto key = std::make_pair(params.repo.owner, params.repo.name);
	RepoInfo repo_info;

	if (!Env::LoadVar_T(key, repo_info)) {
		Env::Halt();
	} else {
		if (params.repo.users_number > 0 && params.repo.users_number + 1 == repo_info.users_number) {
			size_t last_idx = 0;
			PubKey deleted_user = params.user;
			for (size_t i = 0; i < repo_info.users_number; ++i) {
				if (Env::Memcmp(&deleted_user, &repo_info.users[i], sizeof(deleted_user)))
					params.repo.users[last_idx++] = repo_info.users[i];
			}
			Env::SaveVar_T(key, params.repo);
		} else {
			Env::Halt();
		}
	}

	Env::AddSig(params.repo.owner);
}
