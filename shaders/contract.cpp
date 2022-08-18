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
void CheckOrganizationData(const OrganizationData& org_data) {
    Env::Halt_if(org_data.name_len > org_data.kMaxNameLen);
    Env::Halt_if(org_data.short_title_len > org_data.kMaxShortTitleLen);
    Env::Halt_if(org_data.about_len > org_data.kMaxAboutLen);
    Env::Halt_if(org_data.website_len > org_data.kMaxWebsiteLen);
    Env::Halt_if(org_data.twitter_len > org_data.kMaxSocialNickLen);
    Env::Halt_if(org_data.linkedin_len > org_data.kMaxSocialNickLen);
    Env::Halt_if(org_data.instagram_len > org_data.kMaxSocialNickLen);
    Env::Halt_if(org_data.telegram_len > org_data.kMaxSocialNickLen);
    Env::Halt_if(org_data.discord_len > org_data.kMaxSocialNickLen);
    Env::Halt_if(org_data.tags_len > org_data.kMaxTagsLen);
    Env::Halt_if(org_data.tech_stack_len > org_data.kMaxTechStackLen);
}

void CheckProjectData(const ProjectData& proj_data) {
    Env::Halt_if(proj_data.name_len > proj_data.kMaxNameLen);
    Env::Halt_if(proj_data.description_len > proj_data.kMaxDescriptionLen);
    Env::Halt_if(proj_data.website_len > proj_data.kMaxWebsiteLen);
    Env::Halt_if(proj_data.twitter_len > proj_data.kMaxSocialNickLen);
    Env::Halt_if(proj_data.linkedin_len > proj_data.kMaxSocialNickLen);
    Env::Halt_if(proj_data.instagram_len > proj_data.kMaxSocialNickLen);
    Env::Halt_if(proj_data.telegram_len > proj_data.kMaxSocialNickLen);
    Env::Halt_if(proj_data.discord_len > proj_data.kMaxSocialNickLen);
    Env::Halt_if(proj_data.tags_len > proj_data.kMaxTagsLen);
}

void CheckUserData(const UserData& user_data) {
    Env::Halt_if(user_data.name_len > user_data.kMaxNameLen);
    Env::Halt_if(user_data.description_len > user_data.kMaxDescriptionLen);
    Env::Halt_if(user_data.website_len > user_data.kMaxWebsiteLen);
    Env::Halt_if(user_data.twitter_len > user_data.kMaxSocialNickLen);
    Env::Halt_if(user_data.linkedin_len > user_data.kMaxSocialNickLen);
    Env::Halt_if(user_data.instagram_len > user_data.kMaxSocialNickLen);
    Env::Halt_if(user_data.telegram_len > user_data.kMaxSocialNickLen);
    Env::Halt_if(user_data.discord_len > user_data.kMaxSocialNickLen);
}

template <class T>
void CheckPermissions(const PubKey& user, typename T::Id id,
                      typename T::Permissions p) {
    typename Member::Key<T> key(user, id);
    Member user_info;
    Env::Halt_if(!Env::LoadVar_T(key, user_info));
    Env::Halt_if((user_info.permissions & p) != p);
}

// Loads variable length object
template <class T>
std::unique_ptr<T> LoadVLObject(const typename T::Id& id) {
    typename T::Key key(id);
    size_t size = Env::LoadVar(&key, sizeof(key), nullptr, 0, KeyTag::Internal);
    Env::Halt_if(size == 0u);
    std::unique_ptr<T> object(static_cast<T*>(::operator new(size)));
    Env::LoadVar(&key, sizeof(key), object.get(), size, KeyTag::Internal);
    return object;
}

// Saves variable length object
template <class T>
void SaveVLObject(const typename T::Key& key, const std::unique_ptr<T>& object,
                  uint32_t obj_size = sizeof(T)) {
    Env::SaveVar(&key, sizeof(key), object.get(), obj_size, KeyTag::Internal);
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
    return 0;
}
}  // namespace Upgradable3

BEAM_EXPORT void Method_3(const method::PushObjects& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(params.repo_id);

    CheckPermissions<Repo>(params.user, repo_info->repo_id,
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
    SaveVLObject(key_repo, repo_info, sizeof(Repo) + repo_info->name_len);

    Env::AddSig(params.user);
}

BEAM_EXPORT void Method_4(const method::PushRefs& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(params.repo_id);

    CheckPermissions<Repo>(params.user, repo_info->repo_id,
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
    CheckOrganizationData(params.data);
    size_t data_len = params.data.GetTotalLen();
    std::unique_ptr<Organization> org(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + data_len)));

    org->creator = params.caller;
    org->logo_addr = params.logo_addr;
    Env::Memcpy(&org->data, &params.data, sizeof(params.data) + data_len);

    ContractState cs;
    Env::LoadVar_T(0, cs);
    Organization::Key org_key(cs.last_organization_id++);
    Env::SaveVar_T(0, cs);
    SaveVLObject(org_key, org, sizeof(Organization) + data_len);

    Member::Key<Organization> member_key(org->creator, org_key.id);
    Member member_info{.permissions = Organization::Permissions::kAll};
    Env::SaveVar_T(member_key, member_info);

    Env::AddSig(org->creator);
}

BEAM_EXPORT void Method_6(const method::ModifyOrganization& params) {  // NOLINT
    CheckOrganizationData(params.data);
    std::unique_ptr<Organization> organization =
        LoadVLObject<Organization>(params.id);
    CheckPermissions<Organization>(
        params.caller, params.id,
        Organization::Permissions::kModifyOrganization);
    Env::AddSig(params.caller);

    size_t total_len = params.data.GetTotalLen();
    std::unique_ptr<Organization> new_organization(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + total_len)));

    new_organization->creator = organization->creator;
    new_organization->logo_addr = params.logo_addr;
    Env::Memcpy(&new_organization->data, &params.data,
                total_len + sizeof(OrganizationData));

    SaveVLObject(Organization::Key(params.id), new_organization,
                 sizeof(Organization) + total_len);
}

BEAM_EXPORT void Method_7(const method::RemoveOrganization& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_8(const method::CreateRepo& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    CheckPermissions<Project>(params.caller, params.project_id,
                              Project::Permissions::kAddRepo);

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

    std::unique_ptr<Repo> repo_info(
        static_cast<Repo*>(::operator new(sizeof(Repo) + params.name_len)));
    _POD_(repo_info->name_hash) = repo_name_hash;
    repo_info->owner = params.caller;
    repo_info->repo_id = repo_id;
    repo_info->name_len = params.name_len;
    repo_info->cur_objs_number = 0;
    repo_info->project_id = params.project_id;
    Env::Memcpy(repo_info->name, params.name, repo_info->name_len);

    Member::Key<Repo> key_user(params.caller, repo_info->repo_id);
    Env::SaveVar_T(key_user, Member{.permissions = Repo::Permissions::kAll});

    SaveVLObject(Repo::Key(repo_info->repo_id), repo_info,
                 sizeof(Repo) + repo_info->name_len);

    Env::AddSig(repo_info->owner);
}

BEAM_EXPORT void Method_9(const method::ModifyRepo& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(params.repo_id);
    CheckPermissions<Repo>(params.caller, repo_info->repo_id,
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
    Env::DelVar_T(Repo::NameKey(repo_info->owner, repo_info->name_hash));
    SaveVLObject(Repo::Key(new_repo_info->repo_id), new_repo_info,
                 sizeof(Repo) + new_repo_info->name_len);
    Env::SaveVar_T(Repo::NameKey(new_repo_info->owner, new_repo_name_hash),
                   new_repo_info->repo_id);
}

BEAM_EXPORT void Method_10(const method::RemoveRepo& params) {  // NOLINT
    std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(params.repo_id);
    CheckPermissions<Project>(params.caller, repo_info->repo_id,
                              Project::Permissions::kRemoveRepo);
    Env::AddSig(params.caller);
    Env::DelVar_T(Repo::NameKey(repo_info->owner, repo_info->name_hash));
    Env::DelVar_T(Member::Key<Repo>(repo_info->owner, repo_info->repo_id));
    Env::DelVar_T(Repo::Key(repo_info->repo_id));
    // TODO: delete all repo members
    // TODO: delete all git refs and objects
}

BEAM_EXPORT void Method_11(const method::CreateProject& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    CheckProjectData(params.data);
    size_t data_len = params.data.GetTotalLen();
    std::unique_ptr<Project> project(
        static_cast<Project*>(::operator new(sizeof(Project) + data_len)));

    CheckPermissions<Organization>(params.caller, params.organization_id,
                                   Organization::Permissions::kAddProject);
    project->creator = params.caller;
    project->logo_addr = params.logo_addr;
    project->organization_id = params.organization_id;
    Env::Memcpy(&project->data, &params.data, sizeof(params.data) + data_len);

    ContractState cs;
    Env::LoadVar_T(0, cs);
    Project::Key project_key(cs.last_project_id++);
    Env::SaveVar_T(0, cs);
    SaveVLObject(project_key, project, sizeof(Project) + data_len);

    Member::Key<Project> member_key(project->creator, project_key.id);
    Member member_info{.permissions = Project::Permissions::kAll};
    Env::SaveVar_T(member_key, member_info);

    Env::AddSig(project->creator);
}

BEAM_EXPORT void Method_12(const method::ModifyProject& params) {  // NOLINT
    std::unique_ptr<Project> project = LoadVLObject<Project>(params.project_id);
    CheckPermissions<Project>(params.caller, params.project_id,
                              Project::Permissions::kModifyProject);
    Env::AddSig(params.caller);

    size_t total_len = params.data.GetTotalLen();
    std::unique_ptr<Project> new_project(
        static_cast<Project*>(::operator new(sizeof(Project) + total_len)));

    new_project->creator = project->creator;
    new_project->organization_id = project->organization_id;
    new_project->logo_addr = params.logo_addr;
    Env::Memcpy(&new_project->data, &params.data,
                total_len + sizeof(ProjectData));

    SaveVLObject(Project::Key(params.project_id), new_project,
                 sizeof(Project) + total_len);
}

BEAM_EXPORT void Method_13(const method::RemoveProject& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_14(const method::AddRepoMember& params) {  // NOLINT
    // TODO: do not allow to modify repo owner
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Member::Key<Repo> member_key(params.member, params.repo_id);
    CheckPermissions<Repo>(params.caller, params.repo_id,
                           Repo::Permissions::kAddMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_15(const method::ModifyRepoMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Member::Key<Repo> member_key(params.member, params.repo_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Repo>(params.caller, params.repo_id,
                           Repo::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_16(const method::RemoveRepoMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Repo>(params.repo_id));
    Member::Key<Repo> member_key(params.member, params.repo_id);
    CheckPermissions<Repo>(params.caller, params.repo_id,
                           Repo::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_17(const method::AddProjectMember& params) {  // NOLINT
    // TODO: do not allow to modify project owner
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Member::Key<Project> member_key(params.member, params.project_id);
    CheckPermissions<Project>(params.caller, params.project_id,
                              Project::Permissions::kAddMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_18(
    const method::ModifyProjectMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Member::Key<Project> member_key(params.member, params.project_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Project>(params.caller, params.project_id,
                              Project::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_19(
    const method::RemoveProjectMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Project>(params.project_id));
    Member::Key<Project> member_key(params.member, params.project_id);
    CheckPermissions<Project>(params.caller, params.project_id,
                              Project::Permissions::kRemoveMember);
    Env::DelVar_T(member_key);
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_20(
    const method::AddOrganizationMember& params) {  // NOLINT
    // TODO: do not allow to modify org owner
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Member::Key<Organization> member_key(params.member, params.organization_id);
    CheckPermissions<Organization>(params.caller, params.organization_id,
                                   Organization::Permissions::kAddMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_21(
    const method::ModifyOrganizationMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Member::Key<Organization> member_key(params.member, params.organization_id);
    Env::Halt_if(Env::LoadVar(&member_key, sizeof(member_key), nullptr, 0,
                              KeyTag::Internal) == 0u);
    CheckPermissions<Organization>(params.caller, params.organization_id,
                                   Organization::Permissions::kModifyMember);
    Env::SaveVar_T(member_key, Member{.permissions = params.permissions});
    Env::AddSig(params.caller);
}

BEAM_EXPORT void Method_22(
    const method::RemoveOrganizationMember& params) {  // NOLINT
    Env::Halt_if(!ObjectExists<Organization>(params.organization_id));
    Member::Key<Organization> member_key(params.member, params.organization_id);
    CheckPermissions<Organization>(params.caller, params.organization_id,
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

BEAM_EXPORT void Method_25(const method::ModifyUser& params) {  // NOLINT
    CheckUserData(params.data);
    size_t data_len = params.data.GetTotalLen();
    std::unique_ptr<User> user(
        static_cast<User*>(::operator new(sizeof(user) + data_len)));

    user->avatar_addr = params.avatar_addr;
    user->rating = params.rating;
    Env::Memcpy(&user->data, &params.data, sizeof(UserData) + data_len);

    SaveVLObject(User::Key{params.id}, user, sizeof(User) + data_len);
    Env::AddSig(params.id);
}
