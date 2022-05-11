#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

#include <algorithm>
#include <memory>

using namespace git_remote_beam;
namespace git_remote_beam {
Hash256 GetNameHash(const char* name, size_t len) {
  Hash256 res;
  HashProcessor::Sha256 hp;
  hp.Write(name, len);
  hp >> res;
  return res;
}

template <Tag Tg, class T>
void CheckPermissions(const PubKey& user, typename T::Id id, typename T::Permissions p) {
  typename Members<Tg, T>::Key key(user, id);
  UserInfo user_info;
  Env::Halt_if(!Env::LoadVar_T(key, user_info));
  Env::Halt_if((user_info.permissions & p) != p);
}

// Loads object with variable length name
template <class T>
std::unique_ptr<T> LoadNamedObject(const typename T::Id& id) {
  typename T::Key key(id);
  size_t size = Env::LoadVar(&key, sizeof(key), nullptr, 0, KeyTag::Internal);
  Env::Halt_if(size == 0u);
  std::unique_ptr<T> object(static_cast<T*>(::operator new(size)));
  Env::LoadVar(&key, sizeof(key), object.get(), size, KeyTag::Internal);
  return object;
}

// Saves object with variable length name
// The object must have name_len field
template <class T>
void SaveNamedObject(const typename T::Key& key, const std::unique_ptr<T>& object) {
  Env::SaveVar(&key, sizeof(key), object.get(),
               sizeof(T) + object->name_len, KeyTag::Internal);
}
}  // namespace git_remote_beam

BEAM_EXPORT void Ctor(const method::Initial& params) {
  ContractState cs;
  cs.last_repo_id = 1;
  cs.last_project_id = 1;
  cs.last_organization_id = 1;
  Env::SaveVar_T(0, cs);
}

BEAM_EXPORT void Dtor(void*) {
  Env::DelVar_T(0);
}

/*
BEAM_EXPORT void Method_3(const method::DeleteRepo& params) {  // NOLINT
  std::unique_ptr<Repo> repo_info = LoadRepo(params.repo_id);

  CheckPermissions(params.user, repo_info->repo_id, kDeleteRepo);

  Env::AddSig(params.user);

  Env::DelVar_T(Repo::NameKey(repo_info->owner, repo_info->name_hash));
  Env::DelVar_T(RepoUser::Key(repo_info->owner, repo_info->repo_id));
  for (auto tag : kAllTags) {
    auto key = Repo::BaseKey(tag, params.repo_id);
    Env::DelVar_T(key);
  }
}
*/

BEAM_EXPORT void Method_2(const method::PushObjects& params) {  // NOLINT
  std::unique_ptr<Repo> repo_info = LoadNamedObject<Repo>(params.repo_id);

  CheckPermissions<Tag::kRepoMember, Repo>(params.user, repo_info->repo_id,
      Repo::Permissions::kPush);

  auto* obj =
      reinterpret_cast<const method::PushObjects::PackedObject*>(&params + 1);
  for (uint32_t i = 0; i < params.objects_number; ++i) {
    GitObject::Meta meta;
    meta.type = GitObject::Meta::Type(obj->type);
    meta.hash = obj->hash;
    meta.id = repo_info->cur_objs_number++;
    meta.data_size = obj->data_size;
    GitObject::Meta::Key meta_key(params.repo_id, meta.id);
    GitObject::Data::Key data_key(params.repo_id, obj->hash);
    Env::Halt_if(Env::LoadVar(&data_key, sizeof(data_key), nullptr, 0,
                              KeyTag::Internal) !=
                 0u);  // halt if object exists
    Env::SaveVar(&data_key, sizeof(data_key), obj + 1, obj->data_size,
                 KeyTag::Internal);

    Env::SaveVar(&meta_key, sizeof(meta_key), &meta, sizeof(meta),
                 KeyTag::Internal);
    auto size = obj->data_size;
    ++obj;  // skip header
    obj = reinterpret_cast<const method::PushObjects::PackedObject*>(
        reinterpret_cast<const uint8_t*>(obj) + size);  // move to next object
  }

  Repo::Key key_repo(repo_info->repo_id);
  SaveNamedObject(key_repo, repo_info);

  Env::AddSig(params.user);
}

BEAM_EXPORT void Method_3(const method::PushRefs& params) {  // NOLINT
  std::unique_ptr<Repo> repo_info = LoadNamedObject<Repo>(params.repo_id);

  CheckPermissions<Tag::kRepoMember, Repo>(params.user, repo_info->repo_id,
      Repo::Permissions::kPush);

  auto* ref = reinterpret_cast<const GitRef*>(&params + 1);
  for (size_t i = 0; i < params.refs_info.refs_number; ++i) {
    auto size = ref->name_length;
    GitRef::Key key(params.repo_id, ref->name, ref->name_length);
    Env::SaveVar(&key, sizeof(key), ref, sizeof(GitRef) + size,
                 KeyTag::Internal);
    ++ref;  // skip
    ref = reinterpret_cast<const GitRef*>(
        reinterpret_cast<const uint8_t*>(ref) + size);  // move to next ref
  }

  Env::AddSig(params.user);
}

BEAM_EXPORT void Method_4(const method::SetOrganization& params) {  // NOLINT
  std::unique_ptr<Organization> org(static_cast<Organization*>(
      ::operator new(sizeof(Organization) + params.name_len)));

  if (params.request == method::SetOrganization::Request::kAdd) {
    org->creator = params.caller;
    org->name_len = params.name_len;
    Env::Memcpy(org->name, params.name, params.name_len);

    ContractState cs;
    Env::LoadVar_T(0, cs);
    Organization::Key org_key(cs.last_organization_id++);
    Env::SaveVar_T(0, cs);
    SaveNamedObject(org_key, org);

    Members<Tag::kOrganizationMember, Organization>::Key member_key(
        org->creator, org_key.id);
    UserInfo member_info{.permissions = Organization::Permissions::kAll};
    Env::SaveVar_T(member_key, member_info);

    Env::AddSig(org->creator);
  } else if (params.request == method::SetOrganization::Request::kModify) {
    Env::Halt();
    // TODO: modify org name
  } else {
    Env::Halt();
    // TODO: remove all projects and repos within the organization
  }
}

BEAM_EXPORT void Method_5(const method::SetRepo& params) {  // NOLINT
  // TODO: check permissions
  if (params.request == method::SetRepo::Request::kAdd) {
    auto repo_name_hash = GetNameHash(params.name, params.name_len);

    Repo::NameKey key1(params.caller, repo_name_hash);
    uint64_t repo_id = 0;

    // halt if repo exists
    Env::Halt_if(Env::LoadVar_T(key1, repo_id) && repo_id != 0);

    ContractState cs;
    Env::LoadVar_T(0, cs);

    repo_id = cs.last_repo_id++;

    Env::SaveVar_T(0, cs);
    Env::SaveVar_T(key1, repo_id);

    std::unique_ptr<Repo> repo_info(static_cast<Repo*>(
        ::operator new(sizeof(Repo) + params.name_len)));
    _POD_(repo_info->name_hash) = repo_name_hash;
    repo_info->owner = params.caller;
    repo_info->repo_id = repo_id;
    repo_info->name_len = params.name_len;
    repo_info->cur_objs_number = 0;
    Env::Memcpy(repo_info->name, params.name, repo_info->name_len);

    Members<Tag::kRepoMember, Repo>::Key key_user(
        params.caller, repo_info->repo_id);
    Env::SaveVar_T(key_user, UserInfo{.permissions = Repo::Permissions::kAll});

    SaveNamedObject(Repo::Key(repo_info->repo_id), repo_info);

    Env::AddSig(repo_info->owner);
  } else if (params.request == method::SetRepo::Request::kRemove) {
    Env::Halt();
    // TODO: modify repo name
  } else {
    // TODO: remove repo
    Env::Halt();
  }
}

BEAM_EXPORT void Method_6(const method::SetProject& params) {  // NOLINT
  // TODO: check permissions
  std::unique_ptr<Project> project(static_cast<Project*>(
      ::operator new(sizeof(Project) + params.name_len)));

  if (params.request == method::SetProject::Request::kAdd) {
    project->creator = params.caller;
    project->name_len = params.name_len;
    Env::Memcpy(project->name, params.name, params.name_len);

    ContractState cs;
    Env::LoadVar_T(0, cs);
    Project::Key project_key(cs.last_project_id++);
    Env::SaveVar_T(0, cs);
    SaveNamedObject(project_key, project);

    Members<Tag::kProjectMember, Project>::Key member_key(
        project->creator, project_key.id);
    UserInfo member_info{.permissions = Project::Permissions::kAll};
    Env::SaveVar_T(member_key, member_info);

    Env::AddSig(project->creator);
  } else if (params.request == method::SetProject::Request::kModify) {
    // TODO: modify project name
    Env::Halt();
  } else {
    // TODO: remove project
    Env::Halt();
  }
}

BEAM_EXPORT void Method_7(const method::SetRepoMember& params) {  // NOLINT
  // TODO: check if repo with params.repo_id exists
  Members<Tag::kRepoMember, Repo>::Key member_key(params.member, params.repo_id);
  if (params.request == method::SetRepoMember::Request::kAdd) {
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
        Repo::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else if (params.request == method::SetRepoMember::Request::kModify) {
    // TODO: check if member exists
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
        Repo::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else {
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
        Repo::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
  }
  Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_8(const method::SetProjectMember& params) { // NOLINT
  // TODO: check if project with params.project_id exists
  Members<Tag::kProjectMember, Project>::Key member_key(
      params.member, params.project_id);
  if (params.request == method::SetProjectMember::Request::kAdd) {
    CheckPermissions<Tag::kProjectMember, Project>(params.caller, params.project_id,
        Project::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else if (params.request == method::SetProjectMember::Request::kModify) {
    // TODO: check if member exists
    CheckPermissions<Tag::kProjectMember, Project>(params.caller, params.project_id,
        Project::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else {
    CheckPermissions<Tag::kProjectMember, Project>(params.caller, params.project_id,
        Project::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
  }
  Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_9(const method::SetOrganizationMember& params) {  // NOLINT
  // TODO: check if organization with params.organization_id exists
  Members<Tag::kOrganizationMember, Organization>::Key member_key(
      params.member, params.organization_id);
  if (params.request == method::SetOrganizationMember::Request::kAdd) {
    CheckPermissions<Tag::kOrganizationMember, Organization>(params.caller, params.organization_id,
        Organization::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else if (params.request == method::SetOrganizationMember::Request::kModify) {
    // TODO: check if member exists
    CheckPermissions<Tag::kOrganizationMember, Organization>(params.caller, params.organization_id,
        Organization::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
  } else {
    CheckPermissions<Tag::kOrganizationMember, Organization>(params.caller, params.organization_id,
        Organization::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
  }
  Env::AddSig(params.caller);
}
