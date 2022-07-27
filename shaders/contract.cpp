// Copyright 2021-2022 SOURC3 Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"
#include "Shaders/upgradable3/contract_impl.h"

#include <algorithm>
#include <memory>

using namespace sourc3;
namespace {
template <Tag Tg, class T>
void CheckPermissions(const PubKey& user, typename T::Id id,
                      typename T::Permissions p) {
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
void SaveNamedObject(const typename T::Key& key,
                     const std::unique_ptr<T>& object) {
    Env::SaveVar(&key, sizeof(key), object.get(), sizeof(T) + object->name_len,
                 KeyTag::Internal);
}

template <class T>
bool ObjectExists(const typename T::Id& id) {
    typename T::Key key(id);
    return Env::LoadVar(&key, sizeof(key), nullptr, 0, KeyTag::Internal);
}
}  // namespace

BEAM_EXPORT void Ctor(const method::Initial& params) {
    params.m_Stgs.TestNumApprovers();
    params.m_Stgs.Save();
    ContractState cs;
    cs.last_repo_id = 1;
    cs.last_project_id = 1;
    cs.last_organization_id = 1;
    Env::SaveVar_T(0, cs);
}

BEAM_EXPORT void Dtor(void*) {
    Env::DelVar_T(0);
}

namespace Upgradable3 {  // NOLINT
void OnUpgraded(uint32_t n_prev_version) {
    // TODO: temporary code to set faucet balance to 0, delete next upgrade
    if (n_prev_version == 1) {
        ContractState cs;
        Env::LoadVar_T(0, cs);
        cs.faucet_balance = 0;
        Env::SaveVar_T(0, cs);
    }
}

uint32_t get_CurrentVersion() {  // NOLINT
    return 3;
}
}  // namespace Upgradable3

BEAM_EXPORT void Method_3(const method::PushObjects& params) {  // NOLINT
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
            reinterpret_cast<const uint8_t*>(obj) +
            size);  // move to next object
    }

    Repo::Key key_repo(repo_info->repo_id);
    SaveNamedObject(key_repo, repo_info);

    Env::AddSig(params.user);
}

BEAM_EXPORT void Method_4(const method::PushRefs& params) {  // NOLINT
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

BEAM_EXPORT void Method_5(const method::CreateOrganization& params) {  // NOLINT
    std::unique_ptr<Organization> org(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + params.name_len)));

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

    Organization::NameKey org_name_key{GetNameHash(org->name, org->name_len)};
    Env::Halt_if(Env::SaveVar_T(org_name_key, org_key.id));

    Env::AddSig(org->creator);
}

BEAM_EXPORT void Method_6(const method::ModifyOrganization& params) {  // NOLINT
    std::unique_ptr<Organization> organization =
        LoadNamedObject<Organization>(params.id);
    CheckPermissions<Tag::kOrganizationMember, Organization>(
        params.caller, params.id,
        Organization::Permissions::kModifyOrganization);
    Env::AddSig(params.caller);

    std::unique_ptr<Organization> new_organization(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + params.name_len)));

    new_organization->creator = organization->creator;
    new_organization->name_len = params.name_len;
    Env::Memcpy(new_organization->name, params.name, params.name_len);

    Organization::NameKey old_org_name_key{
        GetNameHash(organization->name, organization->name_len)};
    Env::DelVar_T(old_org_name_key);

    Organization::NameKey new_org_name_key{
        GetNameHash(new_organization->name, new_organization->name_len)};
    Env::Halt_if(Env::SaveVar_T(new_org_name_key, params.id));

    SaveNamedObject(Organization::Key(params.id), new_organization);
}

BEAM_EXPORT void Method_7(const method::RemoveOrganization& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_8(const method::CreateRepo& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, params.project_id, Project::Permissions::kAddRepo);

    std::unique_ptr<Project> project =
        LoadNamedObject<Project>(params.project_id);

    ContractState cs;
    Env::LoadVar_T(0, cs);

    uint64_t repo_id = cs.last_repo_id++;

    Env::SaveVar_T(0, cs);

    auto repo_name_hash = GetNameHash(params.name, params.name_len);

    std::unique_ptr<Repo> repo_info(
        static_cast<Repo*>(::operator new(sizeof(Repo) + params.name_len)));
    _POD_(repo_info->name_hash) = repo_name_hash;
    repo_info->owner = params.caller;
    repo_info->repo_id = repo_id;
    repo_info->name_len = params.name_len;
    repo_info->cur_objs_number = 0;
    repo_info->project_id = params.project_id;
    Env::Memcpy(repo_info->name, params.name, repo_info->name_len);

    Members<Tag::kRepoMember, Repo>::Key key_user(params.caller,
                                                  repo_info->repo_id);
    Env::SaveVar_T(key_user, UserInfo{.permissions = Repo::Permissions::kAll});

    Repo::NameKey name_key{project->organization_id,
                           GetNameHash(project->name, project->name_len),
                           repo_name_hash};
    Env::Halt_if(Env::SaveVar_T(name_key, repo_id));

    SaveNamedObject(Repo::Key(repo_info->repo_id), repo_info);

    Env::AddSig(repo_info->owner);
}

BEAM_EXPORT void Method_9(const method::ModifyRepo& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadNamedObject<Repo>(params.repo_id);
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, repo_info->repo_id,
                                             Repo::Permissions::kModifyRepo);
    Env::AddSig(params.caller);

    std::unique_ptr<Repo> new_repo_info(
        static_cast<Repo*>(::operator new(sizeof(Repo) + params.name_len)));

    auto new_repo_name_hash = GetNameHash(params.name, params.name_len);
    _POD_(new_repo_info->name_hash) = new_repo_name_hash;
    new_repo_info->owner = repo_info->owner;
    new_repo_info->repo_id = repo_info->repo_id;
    new_repo_info->name_len = params.name_len;
    new_repo_info->cur_objs_number = repo_info->cur_objs_number;
    new_repo_info->project_id = repo_info->project_id;
    Env::Memcpy(new_repo_info->name, params.name, params.name_len);

    Env::DelVar_T(Repo::Key(repo_info->repo_id));

    std::unique_ptr<Project> project =
        LoadNamedObject<Project>(repo_info->project_id);

    Env::DelVar_T(Repo::NameKey(project->organization_id,
                                GetNameHash(project->name, project->name_len),
                                repo_info->name_hash));
    Repo::NameKey new_name_key{project->organization_id,
                               GetNameHash(project->name, project->name_len),
                               new_repo_info->name_hash};
    Env::Halt_if(Env::SaveVar_T(new_name_key, new_repo_info->repo_id));

    SaveNamedObject(Repo::Key(new_repo_info->repo_id), new_repo_info);
}

BEAM_EXPORT void Method_10(const method::RemoveRepo& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadNamedObject<Repo>(params.repo_id);
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, repo_info->repo_id, Project::Permissions::kRemoveRepo);
    Env::AddSig(params.caller);
    // Env::DelVar_T(Repo::NameKey(repo_info->owner, repo_info->name_hash));
    Env::DelVar_T(Members<Tag::kRepoMember, Repo>::Key(repo_info->owner,
                                                       repo_info->repo_id));
    Env::DelVar_T(Repo::Key(repo_info->repo_id));
    // TODO: delete all repo members
    // TODO: delete all git refs and objects
}

BEAM_EXPORT void Method_11(const method::CreateProject& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    std::unique_ptr<Project> project(static_cast<Project*>(
        ::operator new(sizeof(Project) + params.name_len)));

    CheckPermissions<Tag::kOrganizationMember, Organization>(
        params.caller, params.organization_id,
        Organization::Permissions::kAddProject);
    project->creator = params.caller;
    project->name_len = params.name_len;
    project->organization_id = params.organization_id;
    Env::Memcpy(project->name, params.name, params.name_len);

    ContractState cs;
    Env::LoadVar_T(0, cs);
    Project::Key project_key(cs.last_project_id++);
    Env::SaveVar_T(0, cs);
    SaveNamedObject(project_key, project);

    Project::NameKey name_key{project->organization_id,
                              GetNameHash(project->name, project->name_len)};
    Env::Halt_if(Env::SaveVar_T(name_key, project_key.id));

    Members<Tag::kProjectMember, Project>::Key member_key(project->creator,
                                                          project_key.id);
    UserInfo member_info{.permissions = Project::Permissions::kAll};
    Env::SaveVar_T(member_key, member_info);

    Env::AddSig(project->creator);
}

BEAM_EXPORT void Method_12(const method::ModifyProject& params) {  // NOLINT
    std::unique_ptr<Project> project =
        LoadNamedObject<Project>(params.project_id);
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, params.project_id, Project::Permissions::kModifyProject);
    Env::AddSig(params.caller);

    std::unique_ptr<Project> new_project(static_cast<Project*>(
        ::operator new(sizeof(Project) + params.name_len)));

    new_project->creator = project->creator;
    new_project->organization_id = project->organization_id;
    new_project->name_len = params.name_len;
    Env::Memcpy(new_project->name, params.name, params.name_len);

    Project::NameKey old_name_key{
        project->organization_id,
        GetNameHash(project->name, project->name_len)};
    Env::DelVar_T(old_name_key);

    Project::NameKey new_name_key{
        new_project->organization_id,
        GetNameHash(new_project->name, new_project->name_len)};
    Env::Halt_if(Env::SaveVar_T(new_name_key, params.project_id));

    SaveNamedObject(Project::Key(params.project_id), new_project);
}

BEAM_EXPORT void Method_13(const method::RemoveProject& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_14(const method::AddRepoMember& params) {  // NOLINT
    // TODO: do not allow to modify repo owner
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Members<Tag::kRepoMember, Repo>::Key member_key(params.member,
                                                    params.repo_id);
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
                                             Repo::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_15(const method::ModifyRepoMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Members<Tag::kRepoMember, Repo>::Key member_key(params.member,
                                                    params.repo_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
                                             Repo::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_16(const method::RemoveRepoMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Members<Tag::kRepoMember, Repo>::Key member_key(params.member,
                                                    params.repo_id);
    CheckPermissions<Tag::kRepoMember, Repo>(params.caller, params.repo_id,
                                             Repo::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_17(const method::AddProjectMember& params) {  // NOLINT
    // TODO: do not allow to modify project owner
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Members<Tag::kProjectMember, Project>::Key member_key(params.member,
                                                          params.project_id);
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, params.project_id, Project::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_18(
    const method::ModifyProjectMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Members<Tag::kProjectMember, Project>::Key member_key(params.member,
                                                          params.project_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, params.project_id, Project::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_19(
    const method::RemoveProjectMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Members<Tag::kProjectMember, Project>::Key member_key(params.member,
                                                          params.project_id);
    CheckPermissions<Tag::kProjectMember, Project>(
        params.caller, params.project_id, Project::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_20(
    const method::AddOrganizationMember& params) {  // NOLINT
    // TODO: do not allow to modify org owner
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Members<Tag::kOrganizationMember, Organization>::Key member_key(
        params.member, params.organization_id);
    CheckPermissions<Tag::kOrganizationMember, Organization>(
        params.caller, params.organization_id,
        Organization::Permissions::kAddMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_21(
    const method::ModifyOrganizationMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Members<Tag::kOrganizationMember, Organization>::Key member_key(
        params.member, params.organization_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Tag::kOrganizationMember, Organization>(
        params.caller, params.organization_id,
        Organization::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, UserInfo{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_22(
    const method::RemoveOrganizationMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Members<Tag::kOrganizationMember, Organization>::Key member_key(
        params.member, params.organization_id);
    CheckPermissions<Tag::kOrganizationMember, Organization>(
        params.caller, params.organization_id,
        Organization::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_23(const method::Deposit& params) {  // NOLINT
    Env::FundsLock(0, params.amount);
    ContractState cs;
    Env::LoadVar_T(0, cs);
    Strict::Add(cs.faucet_balance, params.amount);
    Env::SaveVar_T(0, cs);
}

BEAM_EXPORT void Method_24(const method::Withdraw& params) {  // NOLINT
    ContractState cs;
    Env::LoadVar_T(0, cs);
    Strict::Sub(cs.faucet_balance, params.amount);
    Env::SaveVar_T(0, cs);
    Env::FundsUnlock(0, params.amount);
}
