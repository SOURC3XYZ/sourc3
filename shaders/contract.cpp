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
		OBJECTS_NUMBER,
		OBJECTS,
		REFS_NUMBER,
		REFS,
	};
	constexpr Operations ALL_OPERATIONS[] = { REPO_SIZE, REPO, OBJECTS_NUMBER, OBJECTS, REFS_NUMBER, REFS };
}

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
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;

	// halt if repo with this owner exists
	if (Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	RepoInfo repo_info;

	strncpy(repo_info.name, params.repo_name, MAX_NAME_SIZE);
	repo_info.owner = params.repo_owner;
	repo_info.users_number = 0;

	Env::SaveVar_T(key, sizeof(repo_info));
	
	key = std::make_tuple(repo_info.owner, repo_info.name, ::Operations::REPO);
	Env::SaveVar_T(key, repo_info);

	key = std::make_tuple(repo_info.owner, repo_info.name, ::Operations::OBJECTS_NUMBER);
	Env::SaveVar_T(key, size_t(0));

	key = std::make_tuple(repo_info.owner, repo_info.name, ::Operations::REFS_NUMBER);
	Env::SaveVar_T(key, size_t(0));

	Env::AddSig(repo_info.owner);
}

BEAM_EXPORT void Method_3(const DeleteRepoParams& params)
{
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;
	
	if (Env::LoadVar_T(key, repo_size)) {
		for (auto op : ::ALL_OPERATIONS) {
			auto key = std::make_tuple(params.repo_owner, params.repo_name, op);
			Env::DelVar_T(key);
		}
	} else {
		Env::Halt();
	}
	Env::AddSig(params.repo_owner);
}

BEAM_EXPORT void Method_4(const AddUserParams& params)
{
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	} else {
		Env::SaveVar_T(key, repo_size + sizeof(PubKey));

		key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO);
		RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size + sizeof(PubKey));
		Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

		repo_info->users[repo_info->users_number++] = params.user;
		Env::SaveVar(&key, sizeof(key), repo_info, repo_size + sizeof(PubKey), KeyTag::Internal);
		Env::Heap_Free(repo_info);
	}

	Env::AddSig(params.repo_owner);
}

BEAM_EXPORT void Method_5(const RemoveUserParams& params)
{
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	} else {
		key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO);
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
		key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
		Env::SaveVar_T(key, repo_size - deleted_users_number * sizeof(PubKey));
		Env::Heap_Free(repo_info);
	}

	Env::AddSig(params.repo_owner);
}


BEAM_EXPORT void Method_6(const PushObjectsParams& params)
{
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size);
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	auto it = std::find_if(repo_info->users, repo_info->users + repo_info->users_number, [&](const auto& a) {
		return !Env::Memcmp(&params.user, &a, sizeof(params.user));
	});

	if (!Env::Memcmp(&params.repo_owner, &params.user, sizeof(params.user)) || it == &repo_info->users[repo_info->users_number]) {
		Env::Halt();
	}

	size_t objects_number;
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::OBJECTS_NUMBER);
	Env::LoadVar_T(key, objects_number);

	ObjectsInfo* obj_info = (ObjectsInfo*)Env::Heap_Alloc(sizeof(ObjectsInfo) + (objects_number + params.objects_info.objects_number) * sizeof(GitObject));
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::OBJECTS);
	if (objects_number != 0) {
		Env::LoadVar(&key, sizeof(key), obj_info, sizeof(ObjectsInfo) + objects_number * sizeof(GitObject), KeyTag::Internal);
	}
	for (size_t i = objects_number; i < objects_number + params.objects_info.objects_number; ++i) {
		obj_info->objects[i] = params.objects_info.objects[i - objects_number];
	}
	Env::SaveVar(&key, sizeof(key), obj_info, sizeof(ObjectsInfo) + (objects_number + params.objects_info.objects_number) * sizeof(GitObject), KeyTag::Internal);
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::OBJECTS_NUMBER);
	Env::SaveVar_T(key, objects_number + params.objects_info.objects_number);

	Env::AddSig(params.user);
}

BEAM_EXPORT void Method_7(const PushRefsParams& params)
{
	auto key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO_SIZE);
	size_t repo_size;

	if (!Env::LoadVar_T(key, repo_size)) {
		Env::Halt();
	}

	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REPO);
	RepoInfo* repo_info = (RepoInfo*)Env::Heap_Alloc(repo_size);
	Env::LoadVar(&key, sizeof(key), repo_info, repo_size, KeyTag::Internal);

	auto it = std::find_if(repo_info->users, repo_info->users + repo_info->users_number, [&](const auto& a) {
		return !Env::Memcmp(&params.user, &a, sizeof(params.user));
	});

	if (!Env::Memcmp(&params.repo_owner, &params.user, sizeof(params.user)) || it == &repo_info->users[repo_info->users_number]) {
		Env::Halt();
	}

	size_t refs_number;
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REFS_NUMBER);
	Env::LoadVar_T(key, refs_number);

	RefsInfo* obj_info = (RefsInfo*)Env::Heap_Alloc(sizeof(RefsInfo) + (refs_number + params.refs_info.refs_number) * sizeof(GitRef));
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REFS);
	if (refs_number != 0) {
		Env::LoadVar(&key, sizeof(key), obj_info, sizeof(RefsInfo) + refs_number * sizeof(GitRef), KeyTag::Internal);
	}
	for (size_t i = refs_number; i < refs_number + params.refs_info.refs_number; ++i) {
		obj_info->refs[i] = params.refs_info.refs[i - refs_number];
	}
	Env::SaveVar(&key, sizeof(key), obj_info, sizeof(RefsInfo) + (refs_number + params.refs_info.refs_number) * sizeof(GitRef), KeyTag::Internal);
	key = std::make_tuple(params.repo_owner, params.repo_name, ::Operations::REFS_NUMBER);
	Env::SaveVar_T(key, refs_number + params.refs_info.refs_number);

	Env::AddSig(params.user);

}
