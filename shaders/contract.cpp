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
#include <cstring>
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
}

void CheckUserData(const UserData& user_data) {
    Env::Halt_if(user_data.name_len > user_data.kMaxNameLen);
    Env::Halt_if(user_data.nickname_len > user_data.kMaxSocialNickLen);
    Env::Halt_if(user_data.email_len > user_data.kMaxEmailLen);
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
    typename Member<T>::Key key(user, id);
    Member<T> member_info;
    Env::Halt_if(!Env::LoadVar_T(key, member_info));
    Env::Halt_if((member_info.permissions & p) != p);
}

void CheckName(const char* const name, size_t name_len) {
    // assert: name is null-terminated string
    Env::Halt_if(name[name_len - 1] != '\0');
    // spaces are not allowed in org, proj and repo names
    Env::Halt_if(std::strchr(name, ' ') != nullptr);
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
uint32_t SaveVLObject(const typename T::Key& key,
                      const std::unique_ptr<T>& object,
                      uint32_t obj_size = sizeof(T)) {
    return Env::SaveVar(&key, sizeof(key), object.get(), obj_size,
                        KeyTag::Internal);
}

template <class T>
bool ObjectExists(const typename T::Id& id) {
    typename T::Key key(id);
    return Env::LoadVar(&key, sizeof(key), nullptr, 0, KeyTag::Internal);
}
template <class T>
typename T::Id GetIdByName(const typename T::NameId& obj_name_id) {
    typename T::Id obj_id{};
    Env::Halt_if(
        !Env::LoadVar_T(typename IdByName<T>::Key{obj_name_id}, obj_id));
    return obj_id;
}

template <class T>
void HandleAddMember(const typename T::NameId& obj_name_id,
                     const PubKey& caller, const PubKey& member,
                     typename T::Permissions permissions) {
    typename T::Id obj_id{GetIdByName<T>(obj_name_id)};
    CheckPermissions<T>(caller, obj_id, T::Permissions::kAddMember);
    Env::Halt_if(Env::SaveVar_T(typename Member<T>::Key{member, obj_id},
                                Member<T>{permissions}));
    Env::AddSig(caller);
}

template <class T>
void HandleModifyMember(const typename T::NameId& obj_name_id,
                        const PubKey& caller, const PubKey& member,
                        typename T::Permissions permissions) {
    typename T::Id obj_id{GetIdByName<T>(obj_name_id)};
    CheckPermissions<T>(caller, obj_id, T::Permissions::kModifyMember);
    Env::Halt_if(!Env::SaveVar_T(typename Member<T>::Key{member, obj_id},
                                 Member<T>{permissions}));
    Env::AddSig(caller);
}

template <class T>
void HandleRemoveMember(const typename T::NameId& obj_name_id,
                        const PubKey& caller, const PubKey& member) {
    typename T::Id obj_id{GetIdByName<T>(obj_name_id)};
    CheckPermissions<T>(caller, obj_id, T::Permissions::kRemoveMember);
    Env::Halt_if(!Env::DelVar_T(typename Member<T>::Key{member, obj_id}));
    Env::AddSig(caller);
}
}  // namespace

BEAM_EXPORT void Ctor(const method::Initial& params) {
    params.m_Stgs.TestNumApprovers();
    params.m_Stgs.Save();
    ContractState cs{};
    Env::SaveVar_T(0, cs);
}

BEAM_EXPORT void Dtor(void*) {
    Env::DelVar_T(0);
}

namespace Upgradable3 {  // NOLINT
void OnUpgraded(uint32_t n_prev_version) {
}

uint32_t get_CurrentVersion() {  // NOLINT
    return 0;
}
}  // namespace Upgradable3

BEAM_EXPORT void Method_3(const method::PushObjects& params) {  // NOLINT
    using RepoIdByNameKey = IdByName<Repo>::Key;

    Repo::Id repo_id{GetIdByName<Repo>(params.repo_name_id)};
    std::unique_ptr<Repo> repo = LoadVLObject<Repo>(repo_id);

    CheckPermissions<Repo>(params.user, repo_id, Repo::Permissions::kPush);

    auto* obj =
        reinterpret_cast<const method::PushObjects::PackedObject*>(&params + 1);
    for (uint32_t i = 0; i < params.objects_number; ++i) {
        GitObject::Meta meta;
        meta.type = GitObject::Meta::Type(obj->type);
        meta.hash = obj->hash;
        meta.id = repo->cur_objs_number++;
        meta.data_size = obj->data_size;
        GitObject::Meta::Key meta_key(repo_id, meta.id);
        GitObject::Data::Key data_key(repo_id, obj->hash);
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

    SaveVLObject(Repo::Key{repo_id}, repo, sizeof(Repo) + repo->name_len);

    Env::AddSig(params.user);
}

BEAM_EXPORT void Method_4(const method::PushRefs& params) {  // NOLINT
    using RepoIdByNameKey = IdByName<Repo>::Key;

    Repo::Id repo_id{GetIdByName<Repo>(params.repo_name_id)};
    std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(repo_id);

    CheckPermissions<Repo>(params.user, repo_id, Repo::Permissions::kPush);

    auto* ref = reinterpret_cast<const GitRef*>(&params + 1);
    for (size_t i = 0; i < params.refs_info.refs_number; ++i) {
        auto size = ref->name_length;
        GitRef::Key key(repo_id, ref->name, ref->name_length);
        Env::SaveVar(&key, sizeof(key), ref, sizeof(GitRef) + size,
                     KeyTag::Internal);
        ++ref;  // skip
        ref = reinterpret_cast<const GitRef*>(
            reinterpret_cast<const uint8_t*>(ref) + size);  // move to next ref
    }

    Env::AddSig(params.user);
}

BEAM_EXPORT void Method_5(const method::CreateOrganization& params) {  // NOLINT
    using OrgKey = Organization::Key;
    using OrgMember = Member<Organization>;
    using OrgMemberKey = Member<Organization>::Key;
    using OrgIdByNameKey = IdByName<Organization>::Key;

    CheckOrganizationData(params.data);
    CheckName(params.data.data, params.data.name_len);
    size_t data_len = params.data.GetTotalLen();
    std::unique_ptr<Organization> org(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + data_len)));

    org->creator = params.caller;
    org->logo_addr = params.logo_addr;
    Env::Memcpy(&org->data, &params.data, sizeof(params.data) + data_len);

    ContractState c_state;
    Env::LoadVar_T(0, c_state);
    Organization::Id org_id = ++c_state.organizations_num;
    Env::SaveVar_T(0, c_state);

    Env::Halt_if(Env::SaveVar_T(
        OrgIdByNameKey{{GetNameHash(org->data.data, org->data.name_len)}},
        org_id));
    Env::Halt_if(SaveVLObject(OrgKey{org_id}, org,
                              sizeof(Organization) + data_len) != 0u);
    Env::Halt_if(Env::SaveVar_T(OrgMemberKey{org->creator, org_id},
                                OrgMember{Organization::Permissions::kAll}));

    Env::AddSig(org->creator);
}

BEAM_EXPORT void Method_6(const method::ModifyOrganization& params) {  // NOLINT
    using OrgKey = Organization::Key;
    using OrgIdByNameKey = IdByName<Organization>::Key;

    Organization::Id org_id{
        GetIdByName<Organization>(params.organization_name_id)};
    CheckOrganizationData(params.data);
    std::unique_ptr<Organization> organization =
        LoadVLObject<Organization>(org_id);
    CheckPermissions<Organization>(
        params.caller, org_id, Organization::Permissions::kModifyOrganization);
    CheckName(params.data.data, params.data.name_len);
    Env::AddSig(params.caller);

    size_t total_len = params.data.GetTotalLen();
    std::unique_ptr<Organization> new_organization(static_cast<Organization*>(
        ::operator new(sizeof(Organization) + total_len)));

    new_organization->creator = organization->creator;
    new_organization->logo_addr = params.logo_addr;
    Env::Memcpy(&new_organization->data, &params.data,
                total_len + sizeof(OrganizationData));

    Env::Halt_if(SaveVLObject(OrgKey{org_id}, new_organization,
                              sizeof(Organization) + total_len) == 0u);
    Env::DelVar_T(OrgIdByNameKey{params.organization_name_id});
    Env::Halt_if(Env::SaveVar_T(
        OrgIdByNameKey{{GetNameHash(new_organization->data.data,
                                    new_organization->data.name_len)}},
        org_id));
}

BEAM_EXPORT void Method_7(const method::RemoveOrganization& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_8(const method::CreateRepo& params) {  // NOLINT
    using RepoKey = Repo::Key;
    using RepoMember = Member<Repo>;
    using RepoMemberKey = Member<Repo>::Key;
    using RepoIdByNameKey = IdByName<Repo>::Key;
    using ProjIdByNameKey = IdByName<Project>::Key;

    Project::Id proj_id{GetIdByName<Project>(params.project_name_id)};
    CheckPermissions<Project>(params.caller, proj_id,
                              Project::Permissions::kAddRepo);
    CheckName(params.name, params.name_len);

    std::unique_ptr<Repo> repo(
        static_cast<Repo*>(::operator new(sizeof(Repo) + params.name_len)));
    repo->project_id = proj_id;
    repo->owner = params.caller;
    repo->name_len = params.name_len;
    repo->cur_objs_number = 0;
    repo->is_private = params.is_private;
    Env::Memcpy(repo->name, params.name, repo->name_len);

    ContractState c_state;
    Env::LoadVar_T(0, c_state);
    Repo::Id repo_id = ++c_state.repos_num;
    Env::SaveVar_T(0, c_state);

    Env::Halt_if(Env::SaveVar_T(
        RepoIdByNameKey{
            {params.project_name_id, GetNameHash(repo->name, repo->name_len)}},
        repo_id));
    Env::Halt_if(SaveVLObject(RepoKey{repo_id}, repo,
                              sizeof(Repo) + repo->name_len) != 0u);
    Env::Halt_if(Env::SaveVar_T(RepoMemberKey{repo->owner, repo_id},
                                RepoMember{Repo::Permissions::kAll}));

    Env::AddSig(repo->owner);
}

BEAM_EXPORT void Method_9(const method::ModifyRepo& params) {  // NOLINT
    using RepoKey = Repo::Key;
    using RepoIdByNameKey = IdByName<Repo>::Key;

    Repo::Id repo_id{GetIdByName<Repo>(params.repo_name_id)};
    std::unique_ptr<Repo> repo = LoadVLObject<Repo>(repo_id);
    CheckPermissions<Repo>(params.caller, repo_id,
                           Repo::Permissions::kModifyRepo);
    CheckName(params.name, params.name_len);

    Env::AddSig(params.caller);

    std::unique_ptr<Repo> new_repo(
        static_cast<Repo*>(::operator new(sizeof(Repo) + params.name_len)));

    new_repo->project_id = repo->project_id;
    new_repo->owner = repo->owner;
    new_repo->name_len = params.name_len;
    new_repo->cur_objs_number = repo->cur_objs_number;
    new_repo->is_private = params.is_private;
    Env::Memcpy(new_repo->name, params.name, params.name_len);

    Env::Halt_if(SaveVLObject(RepoKey{repo_id}, new_repo,
                              sizeof(Repo) + new_repo->name_len) == 0u);
    Env::DelVar_T(RepoIdByNameKey{params.repo_name_id});
    Env::Halt_if(Env::SaveVar_T(
        RepoIdByNameKey{Repo::NameId{
            {*dynamic_cast<const Project::NameId*>(&params.repo_name_id)},
            GetNameHash(new_repo->name, new_repo->name_len)}},
        repo_id));
}

BEAM_EXPORT void Method_10(const method::RemoveRepo& params) {  // NOLINT
    /*
        std::unique_ptr<Repo> repo_info = LoadVLObject<Repo>(params.repo_id);
        CheckPermissions<Project>(params.caller, repo_info->id,
                                  Project::Permissions::kRemoveRepo);
        Env::AddSig(params.caller);
        Env::DelVar_T(Repo::NameKey(repo_info->owner, repo_info->name_hash));
        Env::DelVar_T(Member::Key<Repo>(repo_info->owner, repo_info->id));
        Env::DelVar_T(Repo::Key(repo_info->id));
        // TODO: delete all repo members
        // TODO: delete all git refs and objects
    */
}

BEAM_EXPORT void Method_11(const method::CreateProject& params) {  // NOLINT
    using ProjKey = Project::Key;
    using ProjMember = Member<Project>;
    using ProjMemberKey = Member<Project>::Key;
    using ProjIdByNameKey = IdByName<Project>::Key;
    using OrgIdByNameKey = IdByName<Organization>::Key;

    Organization::Id org_id{
        GetIdByName<Organization>(params.organization_name_id)};
    CheckProjectData(params.data);
    CheckPermissions<Organization>(params.caller, org_id,
                                   Organization::Permissions::kAddProject);

    CheckName(params.data.data, params.data.name_len);

    size_t data_len = params.data.GetTotalLen();
    std::unique_ptr<Project> project(
        static_cast<Project*>(::operator new(sizeof(Project) + data_len)));

    project->creator = params.caller;
    project->logo_addr = params.logo_addr;
    project->organization_id = org_id;
    Env::Memcpy(&project->data, &params.data, sizeof(params.data) + data_len);

    ContractState c_state;
    Env::LoadVar_T(0, c_state);
    Project::Id proj_id = ++c_state.projects_num;
    Env::SaveVar_T(0, c_state);

    Env::Halt_if(Env::SaveVar_T(
        ProjIdByNameKey{
            {{params.organization_name_id},
             GetNameHash(project->data.data, project->data.name_len)}},
        proj_id));
    Env::Halt_if(SaveVLObject(ProjKey{proj_id}, project,
                              sizeof(Project) + data_len) != 0u);
    Env::Halt_if(Env::SaveVar_T(ProjMemberKey{project->creator, proj_id},
                                ProjMember{Project::Permissions::kAll}));

    Env::AddSig(project->creator);
}

BEAM_EXPORT void Method_12(const method::ModifyProject& params) {  // NOLINT
    using ProjKey = Project::Key;
    using ProjIdByNameKey = IdByName<Project>::Key;

    Project::Id proj_id{GetIdByName<Project>(params.project_name_id)};
    std::unique_ptr<Project> project = LoadVLObject<Project>(proj_id);
    CheckPermissions<Project>(params.caller, proj_id,
                              Project::Permissions::kModifyProject);
    CheckName(params.data.data, params.data.name_len);
    Env::AddSig(params.caller);

    size_t total_len = params.data.GetTotalLen();
    std::unique_ptr<Project> new_project(
        static_cast<Project*>(::operator new(sizeof(Project) + total_len)));

    new_project->creator = project->creator;
    new_project->organization_id = project->organization_id;
    new_project->logo_addr = params.logo_addr;
    Env::Memcpy(&new_project->data, &params.data,
                total_len + sizeof(ProjectData));

    Env::Halt_if(SaveVLObject(ProjKey{proj_id}, new_project,
                              sizeof(Project) + total_len) == 0u);
    Env::DelVar_T(ProjIdByNameKey{params.project_name_id});
    Env::Halt_if(Env::SaveVar_T(
        ProjIdByNameKey{Project::NameId{
            {*dynamic_cast<const Organization::NameId*>(
                &params.project_name_id)},
            GetNameHash(new_project->data.data, new_project->data.name_len)}},
        proj_id));
}

BEAM_EXPORT void Method_13(const method::RemoveProject& params) {  // NOLINT
    // TODO
}

BEAM_EXPORT void Method_14(const method::AddRepoMember& params) {  // NOLINT
    HandleAddMember<Repo>(params.repo_name_id, params.caller, params.member,
                          params.permissions);
}

BEAM_EXPORT void Method_15(const method::ModifyRepoMember& params) {  // NOLINT
    // TODO: do not allow to modify repo owner
    HandleModifyMember<Repo>(params.repo_name_id, params.caller, params.member,
                             params.permissions);
}

BEAM_EXPORT void Method_16(const method::RemoveRepoMember& params) {  // NOLINT
    // TODO: do not allow to modify repo owner
    HandleRemoveMember<Repo>(params.repo_name_id, params.caller, params.member);
}

BEAM_EXPORT void Method_17(const method::AddProjectMember& params) {  // NOLINT
    HandleAddMember<Project>(params.project_name_id, params.caller,
                             params.member, params.permissions);
}

BEAM_EXPORT void Method_18(  // NOLINT
    const method::ModifyProjectMember& params) {
    // TODO: do not allow to modify project owner
    HandleModifyMember<Project>(params.project_name_id, params.caller,
                                params.member, params.permissions);
}

BEAM_EXPORT void Method_19(  // NOLINT
    const method::RemoveProjectMember& params) {
    // TODO: do not allow to modify project owner
    HandleRemoveMember<Project>(params.project_name_id, params.caller,
                                params.member);
}

BEAM_EXPORT void Method_20(  // NOLINT
    const method::AddOrganizationMember& params) {
    HandleAddMember<Organization>(params.organization_name_id, params.caller,
                                  params.member, params.permissions);
}

BEAM_EXPORT void Method_21(  // NOLINT
    const method::ModifyOrganizationMember& params) {
    // TODO: do not allow to modify org owner
    HandleModifyMember<Organization>(params.organization_name_id, params.caller,
                                     params.member, params.permissions);
}

BEAM_EXPORT void Method_22(  // NOLINT
    const method::RemoveOrganizationMember& params) {
    // TODO: do not allow to modify org owner
    HandleRemoveMember<Organization>(params.organization_name_id, params.caller,
                                     params.member);
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
    Env::Memcpy(&user->data, &params.data, sizeof(UserData) + data_len);

    SaveVLObject(User::Key{params.id}, user, sizeof(User) + data_len);
    Env::AddSig(params.id);
}

BEAM_EXPORT void Method_26(const method::MigrateContractState& params) { // NOLINT
#pragma pack(push, 1)
    struct OldContractState {
        uint64_t last_repo_id;
        uint64_t last_organizatino_id;
        uint64_t last_project_id;
        Amount faucet_balance;
    } cs_old;
#pragma pack(pop)
    Env::LoadVar_T(0, cs_old);
    ContractState cs;
    cs.faucet_balance = cs_old.faucet_balance;
    cs.organizations_num = cs_old.last_organizatino_id - 1;
    cs.projects_num = cs_old.last_project_id - 1;
    cs.repos_num = cs_old.last_repo_id - 1;
    Env::SaveVar_T(0, cs);

    Upgradable3::Settings stgs;
    stgs.Load();
    stgs.TestAdminSigs(1);
}

BEAM_EXPORT void Method_27(const method::MigrateOrganizations& params) { // NOLINT
#pragma pack(push, 1)
    struct OldOrganization {
        PubKey creator;
        size_t name_len;
        char name[256];
    } old_org;
#pragma pack(pop)

    for (Organization::Id org_id = params.from; org_id < params.to; ++org_id) {
        Env::LoadVar_T(Organization::Key{org_id}, old_org);
        std::unique_ptr<Organization> org(
            static_cast<Organization*>(::operator new(sizeof(Organization) + old_org.name_len + 1)));

        org->creator = old_org.creator;
        org->data.name_len = old_org.name_len + 1;
        Env::Memcpy(org->data.data, old_org.name, old_org.name_len);
        for (int i = 0; i < old_org.name_len; ++i) {
            if (org->data.data[i] == ' ') {
                org->data.data[i] = '_';
            }
        }
        org->data.data[old_org.name_len] = '\0';
        Env::SaveVar_T(
            IdByName<Organization>::Key{{GetNameHash(org->data.data, org->data.name_len)}},
            org_id);
        Env::SaveVar_T(Member<Organization>::Key{org->creator, org_id}, Member<Organization>{Organization::Permissions::kAll});
        SaveVLObject(Organization::Key{org_id}, org, sizeof(Organization) + org->data.name_len);
    }
    Upgradable3::Settings stgs;
    stgs.Load();
    stgs.TestAdminSigs(1);
}

BEAM_EXPORT void Method_28(const method::MigrateProjects& params) { // NOLINT
#pragma pack(push, 1)
    struct OldProject {
        Organization::Id organization_id;
        PubKey creator;
        size_t name_len;
        char name[256];
    } old_proj;
#pragma pack(pop)

    for (Project::Id proj_id = params.from; proj_id < params.to; ++proj_id) {
        Env::LoadVar_T(Project::Key{proj_id}, old_proj);
        std::unique_ptr<Project> proj(
            static_cast<Project*>(::operator new(sizeof(Project) + old_proj.name_len + 1)));

        proj->organization_id = old_proj.organization_id;
        proj->creator = old_proj.creator;
        proj->data.name_len = old_proj.name_len + 1;
        Env::Memcpy(proj->data.data, old_proj.name, old_proj.name_len);
        for (int i = 0; i < old_proj.name_len; ++i) {
            if (proj->data.data[i] == ' ') {
                proj->data.data[i] = '_';
            }
        }
        proj->data.data[old_proj.name_len] = '\0';

        std::unique_ptr<Organization> organization =
            LoadVLObject<Organization>(proj->organization_id);
        Env::SaveVar_T(IdByName<Project>::Key{
            {{GetNameHash(organization->data.data, organization->data.name_len)},
             GetNameHash(proj->data.data, proj->data.name_len)}},
        proj_id);
        Env::SaveVar_T(Member<Project>::Key{proj->creator, proj_id}, Member<Project>{Project::Permissions::kAll});
        SaveVLObject(Project::Key{proj_id}, proj, sizeof(Project) + proj->data.name_len);
    }
    Upgradable3::Settings stgs;
    stgs.Load();
    stgs.TestAdminSigs(1);
}

BEAM_EXPORT void Method_29(const method::MigrateRepos& params) { // NOLINT
#pragma pack(push, 1)
    struct OldRepo {
        Project::Id project_id;
        Hash256 name_hash;
        Repo::Id repo_id;
        size_t cur_objs_number;
        PubKey owner;
        size_t name_len;
        char name[256];
    } old_repo;
#pragma pack(pop)

    for (Repo::Id repo_id = params.from; repo_id < params.to; ++repo_id) {
        Env::LoadVar_T(Repo::Key{repo_id}, old_repo);
        std::unique_ptr<Repo> repo(
            static_cast<Repo*>(::operator new(sizeof(Repo) + old_repo.name_len + 1)));
repo->project_id = old_repo.project_id;
        repo->cur_objs_number = old_repo.cur_objs_number;
        repo->owner = old_repo.owner;
        repo->is_private = 0;
        repo->name_len = old_repo.name_len + 1;
        Env::Memcpy(repo->name, old_repo.name, old_repo.name_len);
        repo->name[repo->name_len] = '\0';
        for (int i = 0; i < old_repo.name_len; ++i) {
            if (repo->name[i] == ' ') {
                repo->name[i] = '_';
            }
        }
        std::unique_ptr<Project> project = LoadVLObject<Project>(repo->project_id);
        std::unique_ptr<Organization> organization =
            LoadVLObject<Organization>(project->organization_id);
        Env::SaveVar_T(
            IdByName<Repo>::Key{
                {{{GetNameHash(organization->data.data, organization->data.name_len)}, GetNameHash(project->data.data, project->data.name_len)}, GetNameHash(repo->name, repo->name_len)}},
            repo_id);
        Env::SaveVar_T(Member<Repo>::Key{repo->owner, repo_id}, Member<Repo>{Repo::Permissions::kAll});
        SaveVLObject(Repo::Key{repo_id}, repo, sizeof(Repo) + repo->name_len);
    }

    Upgradable3::Settings stgs;
    stgs.Load();
    stgs.TestAdminSigs(1);
}
