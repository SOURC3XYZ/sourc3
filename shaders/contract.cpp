#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

#include <algorithm>
#include <memory>
#include <tuple>

using namespace GitRemoteBeam;
namespace GitRemoteBeam
{
	Hash256 get_name_hash(const char* name, size_t len)
	{
		Hash256 res;
		HashProcessor::Sha256 hp;
		hp.Write(name, len);
		hp >> res;
		return res;
	}

	void check_permissions(const PubKey& user, RepoInfo::ID repo_id, Permissions p)
	{
		auto key_user = RepoUser::Key(user, repo_id);
		UserInfo user_info;
		Env::Halt_if(!Env::LoadVar_T(key_user, user_info));
		Env::Halt_if(!(user_info.permissions & p));
	}

	std::unique_ptr<RepoInfo> load_repo(const RepoInfo::ID& repo_id)
	{
		auto key_repo = GeneralKey{Operations::REPO, repo_id};
		size_t repo_size = Env::LoadVar(&key_repo, sizeof(key_repo), nullptr, 0, KeyTag::Internal);

		Env::Halt_if(!repo_size);

		std::unique_ptr<RepoInfo> repo_info(static_cast<RepoInfo*>(::operator new(repo_size)));
		
		Env::LoadVar(&key_repo, sizeof(key_repo), repo_info.get(), repo_size, KeyTag::Internal);

		return repo_info;
	}
}

BEAM_EXPORT void Ctor(const InitialParams& params)
{
	ContractState cs;
	cs.last_repo_id = 1;
	Env::SaveVar_T(0, cs);
}

BEAM_EXPORT void Dtor(void*)
{
	Env::DelVar_T(0);
}

BEAM_EXPORT void Method_2(const CreateRepoParams& params)
{
	auto repo_name_hash = get_name_hash(params.repo_name, params.repo_name_length);

	auto key1 = RepoInfo::Key(params.repo_owner, repo_name_hash);
	uint64_t repo_id = 0;

	// halt if repo exists
	Env::Halt_if(Env::LoadVar_T(key1, repo_id) && repo_id != 0);

	ContractState cs;
	Env::LoadVar_T(0, cs);

	repo_id = cs.last_repo_id++;

	Env::SaveVar_T(0, cs);
	Env::SaveVar_T(key1, repo_id);

	std::unique_ptr<RepoInfo> repo_info(static_cast<RepoInfo*>(::operator new(sizeof(RepoInfo) + params.repo_name_length)));
	_POD_(repo_info->name_hash) = repo_name_hash;
	repo_info->owner = params.repo_owner;
	repo_info->repo_id = repo_id;
	repo_info->name_length = params.repo_name_length;
	Env::Memcpy(repo_info->name, params.repo_name, repo_info->name_length);

	auto key_user = RepoUser::Key(params.repo_owner, repo_info->repo_id);
	Env::SaveVar_T(key_user, UserInfo{.permissions = ALL});

	auto key_repo = GeneralKey{Operations::REPO, repo_id};
	Env::SaveVar(&key_repo, sizeof(key_repo), repo_info.get(), sizeof(RepoInfo) + repo_info->name_length, KeyTag::Internal);

	Env::AddSig(repo_info->owner);
}

BEAM_EXPORT void Method_3(const DeleteRepoParams& params)
{
	std::unique_ptr<RepoInfo> repo_info = load_repo(params.repo_id);

	check_permissions(params.user, repo_info->repo_id, DELETE_REPO);

	Env::AddSig(params.user);
	
	Env::DelVar_T(RepoInfo::Key(repo_info->owner, repo_info->name_hash));
	Env::DelVar_T(RepoUser::Key(repo_info->owner, repo_info->repo_id));
	for (auto op : ALL_OPERATIONS) {
		auto key = GeneralKey{op, params.repo_id};
		Env::DelVar_T(key);
	}
}

BEAM_EXPORT void Method_4(const AddUserParams& params)
{
	std::unique_ptr<RepoInfo> repo_info = load_repo(params.repo_id);

	check_permissions(params.initiator, repo_info->repo_id, ADD_USER);

	auto key_user = RepoUser::Key(params.user, repo_info->repo_id);
	Env::SaveVar_T(key_user, UserInfo{.permissions = params.permissions});

	Env::AddSig(params.initiator);
}

BEAM_EXPORT void Method_5(const RemoveUserParams& params)
{
	std::unique_ptr<RepoInfo> repo_info = load_repo(params.repo_id);
	
	check_permissions(params.initiator, repo_info->repo_id, REMOVE_USER);

	auto key_user = RepoUser::Key(params.user, repo_info->repo_id);
	UserInfo user_info;
	if (Env::LoadVar_T(key_user, user_info)) {
		Env::DelVar_T(key_user);
	}

	Env::AddSig(params.initiator);
}

BEAM_EXPORT void Method_6(const PushObjectsParams& params)
{
	std::unique_ptr<RepoInfo> repo_info = load_repo(params.repo_id);

	check_permissions(params.user, repo_info->repo_id, PUSH);

	auto* obj = reinterpret_cast<const GitObject*>(&params.objects_info + 1);
	for (uint32_t i = 0; i < params.objects_info.objects_number; ++i) {
		auto key = GitObject::Key(params.repo_id, obj->hash, Operations::OBJECTS);
		Env::Halt_if(Env::LoadVar(&key, sizeof(key), nullptr, 0, KeyTag::Internal)); // halt if object exists
		Env::SaveVar(&key, sizeof(key), obj->data, obj->data_size, KeyTag::Internal);
		auto size = obj->data_size;
		++obj; // skip header
		obj = reinterpret_cast<const GitObject*>(reinterpret_cast<const uint8_t*>(obj) + size); // move to next object
	}

	Env::AddSig(params.user);
}

BEAM_EXPORT void Method_7(const PushRefsParams& params)
{
	std::unique_ptr<RepoInfo> repo_info = load_repo(params.repo_id);

	check_permissions(params.user, repo_info->repo_id, PUSH);

	auto* ref = reinterpret_cast<const GitRef*>(&params + 1);
	for (size_t i = 0; i < params.refs_info.refs_number; ++i) {
		auto size = ref->name_length;
		auto key = GitRef::Key(params.repo_id, ref->name, ref->name_length, Operations::REFS);
		Env::SaveVar(&key, sizeof(key), ref, sizeof(GitRef) + size, KeyTag::Internal);
		++ref; // skip 
		ref = reinterpret_cast<const GitRef*>(reinterpret_cast<const uint8_t*>(ref) + size); // move to next ref
	}

	Env::AddSig(params.user);
}
