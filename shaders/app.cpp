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
#include "contract.h"
#include "Shaders/upgradable3/app_common_impl.h"

namespace Env {  // NOLINT
#include "bvm2_cost.h"
}  // namespace Env

#include <algorithm>
#include <vector>
#include <utility>
#include <string_view>
#include <memory>
#include <charconv>
#include <limits>

#include "libgit2/full_git.h"

namespace sourc3 {
namespace v0 {
// SID: 5ca7c7e30f066942e47d803a4e016ca9ff08ccbcb84384662525b8bfe07246eb
static const ShaderID s_SID = {  // NOLINT
    0x5c, 0xa7, 0xc7, 0xe3, 0x0f, 0x06, 0x69, 0x42, 0xe4, 0x7d, 0x80,
    0x3a, 0x4e, 0x01, 0x6c, 0xa9, 0xff, 0x08, 0xcc, 0xbc, 0xb8, 0x43,
    0x84, 0x66, 0x25, 0x25, 0xb8, 0xbf, 0xe0, 0x72, 0x46, 0xeb};
}  // namespace v0
namespace v1 {
// SID: ea1765cc92875862660dea1e15cc342281bf0c840b0f9928ccfc8f7e8eeb0048
static const ShaderID s_SID = {  // NOLINT
    0xea, 0x17, 0x65, 0xcc, 0x92, 0x87, 0x58, 0x62, 0x66, 0x0d, 0xea,
    0x1e, 0x15, 0xcc, 0x34, 0x22, 0x81, 0xbf, 0x0c, 0x84, 0x0b, 0x0f,
    0x99, 0x28, 0xcc, 0xfc, 0x8f, 0x7e, 0x8e, 0xeb, 0x00, 0x48};
}  // namespace v1
namespace v2 {
// SID: 2318cf637149d6b47a4801329f985f276d497dbbf221aebdd49a5916c2ccaf3d
static const ShaderID s_SID = {  // NOLINT
    0x23, 0x18, 0xcf, 0x63, 0x71, 0x49, 0xd6, 0xb4, 0x7a, 0x48, 0x01,
    0x32, 0x9f, 0x98, 0x5f, 0x27, 0x6d, 0x49, 0x7d, 0xbb, 0xf2, 0x21,
    0xae, 0xbd, 0xd4, 0x9a, 0x59, 0x16, 0xc2, 0xcc, 0xaf, 0x3d};
}  // namespace v2
#include "contract_sid.i"
}  // namespace sourc3

namespace {
using ActionFunc = void (*)(const ContractID&);
using ActionsMap = std::vector<std::pair<std::string_view, ActionFunc>>;
using RolesMap = std::vector<std::pair<std::string_view, const ActionsMap&>>;

constexpr size_t kActionBufSize = 32;
constexpr size_t kRoleBufSize = 16;

void OnError(const char* msg) {
    Env::DocAddText("error", msg);
}

template <typename T>
auto FindIfContains(const std::string_view str,
                    const std::vector<std::pair<std::string_view, T>>& v) {
    return std::find_if(v.begin(), v.end(), [&str](const auto& p) {
        return str == p.first;
    });
}

const char kAdminSeed[] = "admin-sourc3";

struct MyKeyID : public Env::KeyID {
    MyKeyID() : Env::KeyID(&kAdminSeed, sizeof(kAdminSeed)) {
    }
};

// Add new SID here after changing contract.cpp
const ShaderID kSid[] = {sourc3::v0::s_SID, sourc3::v1::s_SID,
                         sourc3::v2::s_SID, sourc3::s_SID};

const Upgradable3::Manager::VerInfo kVerInfo = {kSid, _countof(kSid)};

void CompensateFee(const ContractID& cid, Amount charge) {
    constexpr Amount kSelfCharge = 120000;
    constexpr Amount kDefaultCharge = 100000;

    sourc3::method::Withdraw wargs;
    wargs.amount =
        ((charge != 0u ? charge : kDefaultCharge) + kSelfCharge) * 10;

    FundsChange fc;
    fc.m_Consume = 0;
    fc.m_Amount = wargs.amount;
    fc.m_Aid = 0;

    Env::Key_T<int> key;
    key.m_Prefix.m_Cid = cid;
    key.m_KeyInContract = 0;
    sourc3::ContractState cs;
    Env::VarReader::Read_T(key, cs);
    if (cs.faucet_balance < wargs.amount) {
        Env::DocAddText("warning", "not enough money to compensate fee");
        return;
    }

    Env::GenerateKernel(&cid, wargs.kMethod, &wargs, sizeof(wargs), &fc, 1,
                        nullptr, 0, "Compensate fee", 0);
}

size_t GetProjectData(sourc3::ProjectData& buf) {
    using sourc3::ProjectData;

    auto cur_ptr = buf.data;

    buf.name_len = Env::DocGetText("name", cur_ptr, ProjectData::kMaxNameLen);
    if (buf.name_len <= 1) {
        OnError("'name' required");
        return 0;
    }
    cur_ptr += buf.name_len;

    buf.description_len = Env::DocGetText("description", cur_ptr,
                                          ProjectData::kMaxDescriptionLen);
    cur_ptr += buf.description_len;

    buf.website_len =
        Env::DocGetText("website", cur_ptr, ProjectData::kMaxWebsiteLen);
    cur_ptr += buf.website_len;

    buf.twitter_len =
        Env::DocGetText("twitter", cur_ptr, ProjectData::kMaxSocialNickLen);
    cur_ptr += buf.twitter_len;

    buf.linkedin_len =
        Env::DocGetText("linkedin", cur_ptr, ProjectData::kMaxSocialNickLen);
    cur_ptr += buf.linkedin_len;

    buf.instagram_len =
        Env::DocGetText("instagram", cur_ptr, ProjectData::kMaxSocialNickLen);
    cur_ptr += buf.instagram_len;

    buf.telegram_len =
        Env::DocGetText("telegram", cur_ptr, ProjectData::kMaxSocialNickLen);
    cur_ptr += buf.telegram_len;

    buf.discord_len =
        Env::DocGetText("discord", cur_ptr, ProjectData::kMaxSocialNickLen);
    cur_ptr += buf.discord_len;

    buf.tags_len = Env::DocGetText("tags", cur_ptr, ProjectData::kMaxTagsLen);
    cur_ptr += buf.tags_len;

    return cur_ptr - reinterpret_cast<char*>(&buf);
}

void PrintProject(std::unique_ptr<sourc3::Project>& value) {
    auto cur_ptr = value->data.data;
    Env::DocAddText("project_name", cur_ptr);
    cur_ptr += value->data.name_len;
    Env::DocAddText("project_description", cur_ptr);
    cur_ptr += value->data.description_len;
    Env::DocAddText("project_website", cur_ptr);
    cur_ptr += value->data.website_len;
    Env::DocAddText("project_twitter", cur_ptr);
    cur_ptr += value->data.twitter_len;
    Env::DocAddText("project_linkedin", cur_ptr);
    cur_ptr += value->data.linkedin_len;
    Env::DocAddText("project_instagram", cur_ptr);
    cur_ptr += value->data.instagram_len;
    Env::DocAddText("project_telegram", cur_ptr);
    cur_ptr += value->data.telegram_len;
    Env::DocAddText("project_discord", cur_ptr);
    cur_ptr += value->data.discord_len;
    Env::DocAddText("project_tags", cur_ptr);
    Env::DocAddText("project_logo_ipfs_hash", value->logo_addr.data());
    Env::DocAddBlob_T("project_creator", value->creator);
    Env::DocAddNum("organization_id", value->organization_id);
}

size_t GetOrganizationData(sourc3::OrganizationData& buf) {
    using sourc3::OrganizationData;

    auto cur_ptr = buf.data;

    buf.name_len =
        Env::DocGetText("name", cur_ptr, OrganizationData::kMaxNameLen);
    if (buf.name_len <= 1) {
        OnError("'name' required");
        return 0;
    }
    cur_ptr += buf.name_len;

    buf.short_title_len = Env::DocGetText("short_title", cur_ptr,
                                          OrganizationData::kMaxShortTitleLen);
    cur_ptr += buf.short_title_len;

    buf.about_len =
        Env::DocGetText("about", cur_ptr, OrganizationData::kMaxAboutLen);
    cur_ptr += buf.about_len;

    buf.website_len =
        Env::DocGetText("website", cur_ptr, OrganizationData::kMaxWebsiteLen);
    cur_ptr += buf.website_len;

    buf.twitter_len = Env::DocGetText("twitter", cur_ptr,
                                      OrganizationData::kMaxSocialNickLen);
    cur_ptr += buf.twitter_len;

    buf.linkedin_len = Env::DocGetText("linkedin", cur_ptr,
                                       OrganizationData::kMaxSocialNickLen);
    cur_ptr += buf.linkedin_len;

    buf.instagram_len = Env::DocGetText("instagram", cur_ptr,
                                        OrganizationData::kMaxSocialNickLen);
    cur_ptr += buf.instagram_len;

    buf.telegram_len = Env::DocGetText("telegram", cur_ptr,
                                       OrganizationData::kMaxSocialNickLen);
    cur_ptr += buf.telegram_len;

    buf.discord_len = Env::DocGetText("discord", cur_ptr,
                                      OrganizationData::kMaxSocialNickLen);
    cur_ptr += buf.discord_len;

    buf.tags_len =
        Env::DocGetText("tags", cur_ptr, OrganizationData::kMaxTagsLen);
    cur_ptr += buf.tags_len;

    buf.tech_stack_len = Env::DocGetText("tech_stack", cur_ptr,
                                         OrganizationData::kMaxTechStackLen);
    cur_ptr += buf.tech_stack_len;

    return cur_ptr - reinterpret_cast<char*>(&buf);
}

void PrintOrganization(std::unique_ptr<sourc3::Organization>& value) {
    auto cur_ptr = value->data.data;
    Env::DocAddText("organization_name", cur_ptr);
    cur_ptr += value->data.name_len;
    Env::DocAddText("organization_short_title", cur_ptr);
    cur_ptr += value->data.short_title_len;
    Env::DocAddText("organization_about", cur_ptr);
    cur_ptr += value->data.about_len;
    Env::DocAddText("organization_website", cur_ptr);
    cur_ptr += value->data.website_len;
    Env::DocAddText("organization_twitter", cur_ptr);
    cur_ptr += value->data.twitter_len;
    Env::DocAddText("organization_linkedin", cur_ptr);
    cur_ptr += value->data.linkedin_len;
    Env::DocAddText("organization_instagram", cur_ptr);
    cur_ptr += value->data.instagram_len;
    Env::DocAddText("organization_telegram", cur_ptr);
    cur_ptr += value->data.telegram_len;
    Env::DocAddText("organization_discord", cur_ptr);
    cur_ptr += value->data.discord_len;
    Env::DocAddText("organization_tags", cur_ptr);
    cur_ptr += value->data.tags_len;
    Env::DocAddText("organization_tech_stack", cur_ptr);
    Env::DocAddText("organization_logo_ipfs_hash", value->logo_addr.data());
    Env::DocAddBlob_T("organization_creator", value->creator);
}

void OnActionCreateContract(const ContractID& unused) {
    MyKeyID kid;
    PubKey pk;
    kid.get_Pk(pk);

    sourc3::method::Initial arg;
    if (!kVerInfo.FillDeployArgs(arg.m_Stgs, &pk)) {
        return;
    }

    Env::GenerateKernel(nullptr, 0, &arg, sizeof(arg), nullptr, 0, nullptr, 0,
                        "Deploy sourc3 contract",
                        Upgradable3::Manager::get_ChargeDeploy() * 2);
}

void OnActionScheduleUpgrade(const ContractID& cid) {
    Height hTarget;  // NOLINT
    Env::DocGetNum64("hTarget", &hTarget);

    MyKeyID kid;
    Upgradable3::Manager::MultiSigRitual::Perform_ScheduleUpgrade(kVerInfo, cid,
                                                                  kid, hTarget);
}

void OnActionExplicitUpgrade(const ContractID& cid) {
    MyKeyID kid;
    uint32_t charge_extra = 0;
    Env::DocGetNum32("nChargeExtra", &charge_extra);
    Upgradable3::Manager::MultiSigRitual::Perform_ExplicitUpgrade(cid,
                                                                  charge_extra);
}

void OnActionMyAdminKey(const ContractID& cid) {
    PubKey pk;
    MyKeyID kid;
    kid.get_Pk(pk);
    Env::DocAddBlob_T("admin_key", pk);
}

void OnActionDestroyContract(const ContractID& cid) {
    Env::GenerateKernel(&cid, 1, nullptr, 0, nullptr, 0, nullptr, 0,
                        "Destroy sourc3 contract", 0);
}

void OnActionViewContracts(const ContractID& unused) {
    MyKeyID kid;
    kVerInfo.DumpAll(&kid);
}

void OnActionViewContractParams(const ContractID& cid) {
    Env::Key_T<uint32_t> k;
    k.m_Prefix.m_Cid = cid;
    k.m_KeyInContract = 0;

    sourc3::ContractState params;
    if (!Env::VarReader::Read_T(k, params)) {
        return OnError("Failed to read contract's initial params");
    }

    Env::DocGroup gr("params");
}

#pragma pack(push, 1)

class UserKey {
public:
    explicit UserKey(const ContractID& cid) : cid_{cid} {
        Env::DocGetNum32("pid", &profile_index_);
    }

    void Get(PubKey& key) {
        if (profile_index_ == 0) {
            Env::DerivePk(key, &cid_, sizeof(cid_));
        } else {
            Env::DerivePk(key, this, sizeof(UserKey));
        }
    }

    void FillSigRequest(SigRequest& sig) {
        sig.m_pID = &cid_;
        if (profile_index_ == 0) {
            sig.m_nID = sizeof(cid_);
        } else {
            sig.m_nID = sizeof(UserKey);
        }
    }

private:
    ContractID cid_;
    uint32_t profile_index_ = 0;
};
#pragma pack(pop)

void OnActionCreateRepo(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::Repo;
    using sourc3::method::CreateRepo;

    char repo_name[Repo::kMaxNameSize + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    Project::Id project_id;
    if (!Env::DocGet("project_id", project_id)) {
        return OnError("'project_id' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(CreateRepo) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<CreateRepo*>(buf.get());
    request->project_id = project_id;
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/repo_name,
                /*n=*/name_len);
    auto hash = sourc3::GetNameHash(request->name, request->name_len);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    // estimate change
    // uint32_t charge =
    //    Env::Cost::CallFar +
    //    Env::Cost::LoadVar_For(sizeof(InitialParams)) +
    //    Env::Cost::LoadVar_For(sizeof(uint64_t)) +
    //    Env::Cost::SaveVar_For(sizeof(InitialParams)) +
    //    Env::Cost::SaveVar_For(sizeof(CreateRepoParams)) +
    //    Env::Cost::SaveVar_For(sizeof(uint64_t)) +
    //    Env::Cost::AddSig +
    //    Env::Cost::MemOpPerByte * (sizeof(Repo) +
    //    sizeof(CreateRepoParams))
    //    + Env::Cost::Cycle * 300; // should be enought

    Amount charge = 10000000;
    CompensateFee(cid, charge);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateRepo::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create repo",
                        /*nCharge=*/charge);
}

void OnActionModifyRepo(const ContractID& cid) {
    using sourc3::Repo;
    using sourc3::method::ModifyRepo;

    char repo_name[Repo::kMaxNameSize + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    Repo::Id repo_id;
    if (!Env::DocGet("repo_id", repo_id)) {
        return OnError("'repo_id' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(ModifyRepo) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<ModifyRepo*>(buf.get());
    request->repo_id = repo_id;
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/repo_name,
                /*n=*/name_len);
    auto hash = sourc3::GetNameHash(request->name, request->name_len);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyRepo::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify repo",
                        /*nCharge=*/0);
}

void OnActionCreateProject(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::ProjectData;
    using sourc3::method::CreateProject;

    constexpr auto max_args_size =
        sizeof(CreateProject) + ProjectData::GetMaxSize();
    auto buf = std::unique_ptr<CreateProject>(
        static_cast<CreateProject*>(::operator new(max_args_size)));
    size_t args_size = GetProjectData(buf->data);

    if (!args_size)
        return;

    Env::DocGetText("logo_ipfs_hash", buf->logo_addr.data(),
                    sourc3::kIpfsAddressSize + 1);

    UserKey user_key(cid);
    user_key.Get(buf->caller);

    if (!Env::DocGet("organization_id", buf->organization_id)) {
        return OnError("'organization_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

    Amount charge = 10000000;
    CompensateFee(cid, charge);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateProject::kMethod,
                        /*pArgs=*/buf.get(),
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create project",
                        /*nCharge=*/charge);
}

void OnActionListProjects(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::ProjectData;
    using ProjectKey = Env::Key_T<Project::Key>;

    constexpr auto max_args_size = sizeof(Project) + ProjectData::GetMaxSize();
    auto buf = std::unique_ptr<Project>(
        static_cast<Project*>(::operator new(max_args_size)));

    ProjectKey start{.m_Prefix = {.m_Cid = cid},
                     .m_KeyInContract = Project::Key{0}};
    ProjectKey end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    ProjectKey key = start;
    Env::DocArray projects("projects");
    uint32_t value_len = max_args_size, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, buf.get(), value_len, 0);) {
        Env::DocGroup project_object("");
        Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
        Env::DocAddNum("project_id", key.m_KeyInContract.id);
        PrintProject(buf);
    }
}

void OnActionProjectByName(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::ProjectData;
    using ProjectKey = Env::Key_T<Project::Key>;

    char name[ProjectData::kMaxNameLen];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    PubKey owner;
    if (!Env::DocGet("owner", owner)) {
        return OnError("'owner' required");
    }

    constexpr auto max_args_size = sizeof(Project) + ProjectData::GetMaxSize();
    auto buf = std::unique_ptr<Project>(
        static_cast<Project*>(::operator new(max_args_size)));

    ProjectKey start{.m_Prefix = {.m_Cid = cid},
                     .m_KeyInContract = Project::Key{0}};
    ProjectKey end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    ProjectKey key = start;
    Env::DocArray projects("projects");
    uint32_t value_len = max_args_size, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, buf.get(), value_len, 0);) {
        if (Env::Strcmp(buf->data.data, name) == 0 &&
            _POD_(buf->creator) == owner) {  // NOLINT
            Env::DocGroup project_object("");
            Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("project_id", key.m_KeyInContract.id);
            PrintProject(buf);
            return;
        }
    }
}

void OnActionListProjectMembers(const ContractID& cid) {
    using sourc3::Member;
    using sourc3::Project;
    using MemberKey = Env::Key_T<Member::Key<Project>>;

    MemberKey start{.m_Prefix = {.m_Cid = cid},
                    .m_KeyInContract = Member::Key<Project>{PubKey{}, 0}};
    if (!Env::DocGet("project_id", start.m_KeyInContract.id)) {
        return OnError("no 'project_id'");
    }
    _POD_(start.m_KeyInContract.user).SetZero();
    MemberKey end = start;
    _POD_(end.m_KeyInContract.user).SetObject(0xFF);

    MemberKey key = start;
    Env::DocArray projects("members");
    sourc3::Member member;
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, member);) {
        Env::DocGroup member_object("");
        Env::DocAddBlob_T("member", key.m_KeyInContract.user);
        Env::DocAddNum32("permissions", member.permissions);
    }
}

void OnActionModifyProject(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::ProjectData;
    using sourc3::method::ModifyProject;

    constexpr auto max_args_size =
        sizeof(ModifyProject) + ProjectData::GetMaxSize();
    auto buf = std::unique_ptr<ModifyProject>(
        static_cast<ModifyProject*>(::operator new(max_args_size)));
    size_t args_size = GetProjectData(buf->data);

    if (!args_size)
        return;

    Env::DocGetText("logo_ipfs_hash", buf->logo_addr.data(),
                    sourc3::kIpfsAddressSize + 1);

    UserKey user_key(cid);
    user_key.Get(buf->caller);

    /*    if (!Env::DocGet("organization_id", request->organization_id)) {
            return OnError("'organization_id' required");
        }
    */

    if (!Env::DocGet("project_id", buf->project_id)) {
        return OnError("'project_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyProject::kMethod,
                        /*pArgs=*/buf.get(),
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify project",
                        /*nCharge=*/0);
}

void OnActionRemoveProject(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::method::RemoveProject;

    RemoveProject request;
    UserKey user_key(cid);
    user_key.Get(request.caller);
    if (!Env::DocGet("project_id", request.project_id)) {
        return OnError("'project_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveProject::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify project",
                        /*nCharge=*/0);
}

void OnActionListProjectRepos(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::Repo;
    using RepoKey = Env::Key_T<Repo::Key>;

    Project::Id project_id;
    if (!Env::DocGet("project_id", project_id)) {
        return OnError("'project_id' required");
    }

    RepoKey start, end;
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(end) = start;
    end.m_KeyInContract.repo_id = std::numeric_limits<uint64_t>::max();

    RepoKey key;
    PubKey my_key;
    UserKey user_key(cid);
    user_key.Get(my_key);
    Env::DocArray repos("repos");
    uint32_t value_len = 0, key_len = sizeof(RepoKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Repo*>(buf.get());
        if (value->project_id == project_id) {
            Env::DocGroup repo_object("");
            Env::DocAddNum("repo_id", value->repo_id);
            Env::DocAddText("repo_name", value->name);
            Env::DocAddNum("project_id", value->project_id);
            Env::DocAddNum64("cur_objects", value->cur_objs_number);
            Env::DocAddBlob_T("repo_owner", value->owner);
            value_len = 0;
        }
    }
}

void OnActionCreateOrganization(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::OrganizationData;
    using sourc3::method::CreateOrganization;

    constexpr auto max_args_size =
        sizeof(CreateOrganization) + OrganizationData::GetMaxSize();
    auto buf = std::unique_ptr<CreateOrganization>(
        static_cast<CreateOrganization*>(::operator new(max_args_size)));
    size_t args_size = GetOrganizationData(buf->data);

    if (!args_size)
        return;

    UserKey user_key(cid);
    user_key.Get(buf->caller);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    Amount charge = 10000000;
    CompensateFee(cid, charge);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateOrganization::kMethod,
                        /*pArgs=*/buf.get(),
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create organization",
                        /*nCharge=*/charge);
}

void OnActionListOrganizations(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::OrganizationData;
    using OrganizationKey = Env::Key_T<Organization::Key>;

    constexpr auto max_args_size =
        sizeof(Organization) + OrganizationData::GetMaxSize();
    auto buf = std::unique_ptr<Organization>(
        static_cast<Organization*>(::operator new(max_args_size)));

    OrganizationKey start{.m_Prefix = {.m_Cid = cid},
                          .m_KeyInContract = Organization::Key{0}};
    auto end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    OrganizationKey key = start;
    Env::DocArray organizations("organizations");
    uint32_t value_len = max_args_size, key_len = sizeof(OrganizationKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, buf.get(), value_len, 0);) {
        Env::DocGroup org_object("");
        Env::DocAddNum("organization_tag", (uint32_t)key.m_KeyInContract.tag);
        Env::DocAddNum("organization_id", key.m_KeyInContract.id);
        PrintOrganization(buf);
    }
}

void OnActionOrganizationByName(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::OrganizationData;
    using OrganizationKey = Env::Key_T<Organization::Key>;

    char name[OrganizationData::kMaxNameLen];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    PubKey owner;
    if (!Env::DocGet("owner", owner)) {
        return OnError("'owner' required");
    }

    constexpr auto max_args_size =
        sizeof(Organization) + OrganizationData::GetMaxSize();
    auto buf = std::unique_ptr<Organization>(
        static_cast<Organization*>(::operator new(max_args_size)));

    OrganizationKey start{.m_Prefix = {.m_Cid = cid},
                          .m_KeyInContract = Organization::Key{0}};
    auto end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    OrganizationKey key = start;
    Env::DocArray organizations("organizations");
    uint32_t value_len = max_args_size, key_len = sizeof(OrganizationKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, buf.get(), value_len, 0);) {
        if (Env::Strcmp(buf->data.data, name) == 0 &&
            _POD_(buf->creator) == owner) {  // NOLINT
            Env::DocGroup org_object("");
            Env::DocAddNum("organization_tag",
                           (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("organization_id", key.m_KeyInContract.id);
            PrintOrganization(buf);
            return;
        }
    }
}

void OnActionListOrganizationProjects(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::Project;
    using sourc3::ProjectData;
    using ProjectKey = Env::Key_T<Project::Key>;

    constexpr auto max_args_size = sizeof(Project) + ProjectData::GetMaxSize();
    auto buf = std::unique_ptr<Project>(
        static_cast<Project*>(::operator new(max_args_size)));

    ProjectKey start{.m_Prefix = {.m_Cid = cid},
                     .m_KeyInContract = Project::Key{0}};
    ProjectKey end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    Organization::Id org_id;
    if (!Env::DocGet("organization_id", org_id)) {
        return OnError("no 'organization_id'");
    }

    ProjectKey key = start;
    Env::DocArray projects("projects");
    uint32_t value_len = max_args_size, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, buf.get(), value_len, 0);) {
        if (buf->organization_id == org_id) {
            Env::DocGroup project_object("");
            Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("project_id", key.m_KeyInContract.id);
            PrintProject(buf);
        }
    }
}

void OnActionListOrganizationMembers(const ContractID& cid) {
    using sourc3::Member;
    using sourc3::Organization;
    using MemberKey = Env::Key_T<Member::Key<Organization>>;

    MemberKey start{.m_Prefix = {.m_Cid = cid},
                    .m_KeyInContract = Member::Key<Organization>{PubKey{}, 0}};
    if (!Env::DocGet("organization_id", start.m_KeyInContract.id)) {
        return OnError("no 'organization_id'");
    }
    _POD_(start.m_KeyInContract.user).SetZero();
    MemberKey end = start;
    _POD_(end.m_KeyInContract.user).SetObject(0xFF);

    MemberKey key = start;
    Env::DocArray members("members");
    sourc3::Member member;
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, member);) {
        Env::DocGroup member_object("");
        Env::DocAddBlob_T("member", key.m_KeyInContract.user);
        Env::DocAddNum32("permissions", member.permissions);
    }
}

void OnActionModifyOrganization(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::OrganizationData;
    using sourc3::method::ModifyOrganization;

    constexpr auto max_args_size =
        sizeof(ModifyOrganization) + OrganizationData::GetMaxSize();
    auto buf = std::unique_ptr<ModifyOrganization>(
        static_cast<ModifyOrganization*>(::operator new(max_args_size)));
    size_t args_size = GetOrganizationData(buf->data);

    if (!args_size)
        return;

    Env::DocGetText("logo_ipfs_hash", buf->logo_addr.data(),
                    sourc3::kIpfsAddressSize + 1);

    UserKey user_key(cid);
    user_key.Get(buf->caller);

    if (!Env::DocGet("organization_id", buf->id)) {
        return OnError("'organization_id' required");
    }

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyOrganization::kMethod,
                        /*pArgs=*/buf.get(),
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify organization",
                        /*nCharge=*/0);
}

void OnActionRemoveOrganization(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::method::RemoveOrganization;

    RemoveOrganization request;
    UserKey user_key(cid);
    user_key.Get(request.caller);
    if (!Env::DocGet("organization_id", request.id)) {
        return OnError("'organization_id' required");
    }

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveOrganization::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify organization",
                        /*nCharge=*/0);
}

void OnActionAddProjectMember(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::method::AddProjectMember;

    AddProjectMember request{};
    if (!Env::DocGet("project_id", request.project_id)) {
        return OnError("no 'project_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }
    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }

    request.permissions = permissions;
    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/AddProjectMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"add project member",
                        /*nCharge=*/0);
}

void OnActionModifyProjectMember(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::method::ModifyProjectMember;

    ModifyProjectMember request{};
    if (!Env::DocGet("project_id", request.project_id)) {
        return OnError("no 'project_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }
    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }

    request.permissions = permissions;
    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyProjectMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify project member",
                        /*nCharge=*/0);
}

void OnActionRemoveProjectMember(const ContractID& cid) {
    using sourc3::Project;
    using sourc3::method::RemoveProjectMember;

    RemoveProjectMember request{};
    if (!Env::DocGet("project_id", request.project_id)) {
        return OnError("no 'project_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }

    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveProjectMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"remove project member",
                        /*nCharge=*/0);
}

void OnActionAddOrganizationMember(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::method::AddOrganizationMember;

    AddOrganizationMember request{};
    if (!Env::DocGet("organization_id", request.organization_id)) {
        return OnError("no 'organization_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }
    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }

    request.permissions = permissions;
    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/AddOrganizationMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"add organization member",
                        /*nCharge=*/0);
}

void OnActionModifyOrganizationMember(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::method::ModifyOrganizationMember;

    ModifyOrganizationMember request{};
    if (!Env::DocGet("organization_id", request.organization_id)) {
        return OnError("no 'organization_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }
    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }

    request.permissions = permissions;
    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyOrganizationMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify organization member",
                        /*nCharge=*/0);
}

void OnActionRemoveOrganizationMember(const ContractID& cid) {
    using sourc3::Organization;
    using sourc3::method::RemoveOrganizationMember;

    RemoveOrganizationMember request{};
    if (!Env::DocGet("organization_id", request.organization_id)) {
        return OnError("no 'organization_id'");
    }
    if (!Env::DocGet("member", request.member)) {
        return OnError("no 'member'");
    }

    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveOrganizationMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"remove organization member",
                        /*nCharge=*/0);
}

void OnActionMyRepos(const ContractID& cid) {
    using sourc3::Repo;
    using RepoKey = Env::Key_T<Repo::Key>;
    RepoKey start, end;
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(end) = start;
    end.m_KeyInContract.repo_id = std::numeric_limits<uint64_t>::max();

    RepoKey key;
    PubKey my_key;
    UserKey user_key(cid);
    user_key.Get(my_key);
    Env::DocArray repos("repos");
    uint32_t value_len = 0, key_len = sizeof(RepoKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Repo*>(buf.get());
        if ((_POD_(value->owner) == my_key) != 0u) {
            Env::DocGroup repo_object("");
            Env::DocAddNum("repo_id", value->repo_id);
            Env::DocAddText("repo_name", value->name);
        }
        value_len = 0;
    }
}

void OnActionAllRepos(const ContractID& cid) {
    using sourc3::Repo;
    using RepoKey = Env::Key_T<Repo::Key>;
    RepoKey start, end;
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(end) = start;
    end.m_KeyInContract.repo_id = std::numeric_limits<uint64_t>::max();

    RepoKey key;
    PubKey my_key;
    UserKey user_key(cid);
    user_key.Get(my_key);
    Env::DocArray repos("repos");
    uint32_t value_len = 0, key_len = sizeof(RepoKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Repo*>(buf.get());
        Env::DocGroup repo_object("");
        Env::DocAddNum("repo_id", value->repo_id);
        Env::DocAddText("repo_name", value->name);
        Env::DocAddNum("project_id", value->project_id);
        Env::DocAddNum64("cur_objects", value->cur_objs_number);
        Env::DocAddBlob_T("repo_owner", value->owner);
        value_len = 0;
    }
}

void OnActionDeleteRepo(const ContractID& cid) {
    using sourc3::method::RemoveRepo;
    uint64_t repo_id;
    if (!Env::DocGet("repo_id", repo_id)) {
        return OnError("no repo id for deleting");
    }

    RemoveRepo request;
    request.repo_id = repo_id;
    UserKey user_key(cid);
    user_key.Get(request.caller);

    SigRequest sig;
    user_key.FillSigRequest(sig);

    Amount charge = 10000000;
    CompensateFee(cid, charge);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveRepo::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"delete repo",
                        /*nCharge=*/charge);
}

void OnActionAddUserParams(const ContractID& cid) {
    using sourc3::method::AddRepoMember;
    AddRepoMember request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.member);

    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }
    request.permissions = permissions;

    UserKey user_key(cid);
    user_key.Get(request.caller);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/AddRepoMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"add user params",
                        /*nCharge=*/0);
}

void OnActionModifyUserParams(const ContractID& cid) {
    using sourc3::method::ModifyRepoMember;
    ModifyRepoMember request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.member);

    uint32_t read_permissions;
    if (!Env::DocGet("permissions", read_permissions)) {
        return OnError("no 'permissions'");
    }
    auto permissions = static_cast<uint8_t>(read_permissions);
    if (permissions != read_permissions) {
        return OnError("permission overflow");
    }
    request.permissions = permissions;

    UserKey user_key(cid);
    user_key.Get(request.caller);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyRepoMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify user params",
                        /*nCharge=*/0);
}

void OnActionRemoveUserParams(const ContractID& cid) {
    using sourc3::method::RemoveRepoMember;
    RemoveRepoMember request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.member);

    UserKey user_key(cid);
    user_key.Get(request.caller);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    CompensateFee(cid, 0);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveRepoMember::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"remove user params",
                        /*nCharge=*/0);
}

void OnActionPushObjects(const ContractID& cid) {
    using sourc3::GitRef;
    using sourc3::method::PushObjects;
    using sourc3::method::PushRefs;
    auto data_len = Env::DocGetBlob("data", nullptr, 0);

    sourc3::Repo::Id repo_id;
    if (!Env::DocGet("repo_id", repo_id)) {
        return OnError("failed to read 'repo_id'");
    }

    UserKey user_key(cid);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    char ref_name[GitRef::kMaxNameSize + 1];
    auto name_len = Env::DocGetText("ref", ref_name, _countof(ref_name));
    if (name_len == 1) {
        return OnError("failed to read 'ref'");
    } else if (name_len > 1) {
        --name_len;             // remove '0'-term;
        size_t refs_count = 1;  // single ref for now
        auto ref_args_size = sizeof(PushRefs) + sizeof(GitRef) + name_len;
        auto res_memory = std::make_unique<uint8_t[]>(ref_args_size);
        auto* refs_params = reinterpret_cast<PushRefs*>(res_memory.get());
        refs_params->repo_id = repo_id;
        refs_params->refs_info.refs_number = refs_count;
        auto* ref = reinterpret_cast<GitRef*>(refs_params + 1);
        if (Env::DocGetBlob("ref_target", &ref->commit_hash,
                            sizeof(sourc3::GitOid)) == 0u) {
            return OnError("failed to read 'ref_target'");
        }
        ref->name_length = name_len;
        Env::Memcpy(/*pDst=*/ref->name, /*pSrc=*/ref_name, /*n=*/name_len);

        // dump refs for debug
        Env::DocGroup grr("refs");
        {
            Env::DocAddNum32("count", refs_params->refs_info.refs_number);
            Env::DocGroup gr2("ref");
            Env::DocAddBlob("oid", &ref->commit_hash, 20);
            Env::DocAddText("name", ref->name);
        }

        user_key.Get(refs_params->user);
        Amount charge = 10000000;
        CompensateFee(cid, charge);
        Env::GenerateKernel(/*pCid=*/&cid,
                            /*iMethod=*/PushRefs::kMethod,
                            /*pArgs=*/refs_params,
                            /*nArgs=*/ref_args_size,
                            /*pFunds=*/nullptr,
                            /*nFunds=*/0,
                            /*pSig=*/&sig,
                            /*nSig=*/1,
                            /*szComment=*/"Pushing refs",
                            /*nCharge=*/charge);
    }

    if (data_len == 0) {
        return Env::DocAddText("warning", "No data to push, push only refs");
    }

    size_t args_size;
    args_size = sizeof(PushObjects) + data_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* params = reinterpret_cast<PushObjects*>(buf.get());
    auto* p = reinterpret_cast<uint8_t*>(&params->objects_number);
    if (Env::DocGetBlob("data", p, data_len) != data_len) {
        return OnError("failed to read push data");
    }
    if (!Env::DocGet("repo_id", params->repo_id)) {
        return OnError("failed to read 'repo_id'");
    }
    Env::DocAddNum("repo_id", params->repo_id);

    // dump objects for debug
    Env::DocGroup gr("objects");
    {
        Env::DocAddNum32("count", params->objects_number);

        auto* obj =
            reinterpret_cast<const PushObjects::PackedObject*>(params + 1);
        for (uint32_t i = 0; i < params->objects_number; ++i) {
            uint32_t size = obj->data_size;
            Env::DocGroup gr2("object");
            Env::DocAddBlob("oid", &obj->hash, sizeof(sourc3::GitOid));
            Env::DocAddNum32("size", size);
            Env::DocAddNum32("type", obj->type);
            ++obj;  // skip header
            const auto* data = reinterpret_cast<const uint8_t*>(obj);

            obj = reinterpret_cast<const PushObjects::PackedObject*>(
                data + size);  // move to next object
        }
    }

    user_key.Get(params->user);
    Amount charge = 20000000 + 100000 * params->objects_number;
    CompensateFee(cid, charge);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/PushObjects::kMethod,
                        /*pArgs=*/params,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"Pushing objects",
                        /*nCharge=*/charge);
}

void OnActionListRefs(const ContractID& cid) {
    using sourc3::GitRef;
    using sourc3::Repo;
    using Key = Env::Key_T<GitRef::Key>;
    Key start, end;
    Repo::Id repo_id = 0;
    if (!Env::DocGet("repo_id", repo_id)) {
        return OnError("failed to read 'repo_id'");
    }

    start.m_KeyInContract.repo_id = Utils::FromBE(repo_id);
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(start.m_KeyInContract.name_hash).SetZero();
    _POD_(end) = start;
    _POD_(end.m_KeyInContract.name_hash).SetObject(0xff);

    Key key;
    Env::DocArray repos("refs");
    uint32_t value_len = 0, key_len = sizeof(Key);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<GitRef*>(buf.get());
        Env::DocGroup repo_object("");
        value->name[value->name_length] = '\0';
        Env::DocAddText("name", value->name);
        Env::DocAddBlob("commit_hash", &value->commit_hash,
                        sizeof(value->commit_hash));
        value_len = 0;
    }
}

void OnActionUserGetKey(const ContractID& cid) {
    UserKey user_key(cid);
    PubKey pk;
    user_key.Get(pk);
    Env::DocAddBlob_T("key", pk);
}

void OnActionUserGetRepo(const ContractID& cid) {
    using RepoKey = sourc3::Repo::NameKey;
    using sourc3::Repo;
    char repo_name[Repo::kMaxNameSize + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    --name_len;  // remove 0-term
    PubKey my_key;
    Env::DocGet("repo_owner", my_key);
    sourc3::Hash256 name_hash = sourc3::GetNameHash(repo_name, name_len);
    RepoKey key(my_key, name_hash);
    Env::Key_T<RepoKey> reader_key = {.m_KeyInContract = key};
    reader_key.m_Prefix.m_Cid = cid;
    Repo::Id repo_id = 0;
    if (!Env::VarReader::Read_T(reader_key, repo_id)) {
        return OnError("Failed to read repo ids");
    }
    Env::DocAddNum("repo_id", repo_id);
}

using MetaKey = Env::Key_T<sourc3::GitObject::Meta::Key>;
using DataKey = Env::Key_T<sourc3::GitObject::Data::Key>;

std::tuple<MetaKey, MetaKey, MetaKey> PrepareGetObject(const ContractID& cid) {
    using sourc3::GitObject;
    using sourc3::Repo;

    Repo::Id repo_id;
    Env::DocGet("repo_id", repo_id);
    MetaKey start{.m_KeyInContract = {repo_id, 0}};
    MetaKey end{.m_KeyInContract = {repo_id,
                                    std::numeric_limits<GitObject::Id>::max()}};
    start.m_Prefix.m_Cid = cid;
    end.m_Prefix.m_Cid = cid;
    MetaKey key{
        .m_KeyInContract = {repo_id, 0}};  // dummy value to initialize reading
    return {start, end, key};
}

void OnActionGetRepoMeta(const ContractID& cid) {
    using sourc3::GitObject;
    auto [start, end, key] = PrepareGetObject(cid);

    GitObject::Meta value;
    Env::DocArray objects_array("objects");
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, value);) {
        Env::DocGroup obj("");
        Env::DocAddBlob_T("object_hash", value.hash);
        Env::DocAddNum("object_type", static_cast<uint32_t>(value.type));
        Env::DocAddNum("object_size", value.data_size);
    }
}

void OnActionGetRepoData(const ContractID& cid) {
    using sourc3::GitObject;
    using sourc3::GitOid;
    using sourc3::Repo;
    Repo::Id repo_id;
    GitOid hash;
    Env::DocGet("repo_id", repo_id);
    Env::DocGetBlob("obj_id", &hash, sizeof(hash));
    DataKey key{.m_KeyInContract = {repo_id, hash}};
    key.m_Prefix.m_Cid = cid;
    uint32_t value_len = 0, key_len = 0;
    Env::VarReader reader(key, key);
    if (reader.MoveNext(nullptr, key_len, nullptr, value_len, 0)) {
        auto buf = std::make_unique<uint8_t[]>(value_len);
        reader.MoveNext(nullptr, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<GitObject::Data*>(buf.get());
        Env::DocAddBlob("object_data", value->data, value_len);
    } else {
        Env::DocAddBlob("object_data", nullptr, 0);
    }
}

void AddCommit(const mygit2::git_commit& commit, const sourc3::GitOid& hash) {
    Env::DocGroup commit_obj("commit");
    char oid_buffer[GIT_OID_HEXSZ + 1];
    oid_buffer[GIT_OID_HEXSZ] = '\0';
    Env::DocAddBlob("commit_oid", &hash, sizeof(hash));
    Env::DocAddText("raw_header", commit.raw_header);
    Env::DocAddText("raw_message", commit.raw_message);
    git_oid_fmt(oid_buffer, &commit.tree_id);
    Env::DocAddText("tree_oid", oid_buffer);
    Env::DocAddText("author_name", commit.author->name);
    Env::DocAddText("author_email", commit.author->email);
    Env::DocAddText("committer_name", commit.committer->name);
    Env::DocAddText("committer_email", commit.committer->email);
    Env::DocAddNum32("commit_time_sec", commit.committer->when.time);
    Env::DocAddNum32("commit_time_tz_offset_min",
                     commit.committer->when.offset);
    Env::DocAddNum32(
        "commit_time_positive",
        static_cast<uint32_t>(commit.committer->when.sign ==
                              '+'));  // Only two values: '-' and '+'
    Env::DocAddNum32("create_time_sec", commit.author->when.time);
    Env::DocAddNum32("create_time_tz_offset_min", commit.author->when.offset);
    Env::DocAddNum32(
        "create_time_positive",
        static_cast<uint32_t>(commit.author->when.sign ==
                              '+'));  // Only two values: '-' and '+'
    Env::DocArray parent("parents");
    for (size_t i = 0; i < commit.parent_ids.size; ++i) {
        Env::DocGroup entry("");
        git_oid_fmt(oid_buffer, &commit.parent_ids.ptr[i]);
        Env::DocAddText("oid", oid_buffer);
    }
    Env::Heap_Free(commit.parent_ids.ptr);
    Env::Heap_Free(commit.author);
    Env::Heap_Free(commit.raw_message);
    Env::Heap_Free(commit.raw_header);
    Env::Heap_Free(commit.committer);
}

void AddTree(const mygit2::git_tree& tree) {
    Env::DocGroup tree_obj("tree");
    char oid_buffer[GIT_OID_HEXSZ + 1];
    oid_buffer[GIT_OID_HEXSZ] = '\0';
    Env::DocArray entries("entries");
    for (size_t i = 0; i < tree.entries.size; ++i) {
        Env::DocGroup entry("");
        Env::DocAddText("filename", tree.entries.ptr[i].filename);
        git_oid_fmt(oid_buffer, tree.entries.ptr[i].oid);
        Env::DocAddNum("attributes",
                       static_cast<uint32_t>(tree.entries.ptr[i].attr));
        Env::DocAddText("oid", oid_buffer);
    }
    Env::Heap_Free(tree.entries.ptr);
}

void ParseObjectData(const std::function<void(sourc3::GitObject::Data*, size_t,
                                              sourc3::GitOid)>& handler) {
    using sourc3::GitObject;
    using sourc3::GitOid;
    auto data_len = Env::DocGetBlob("data", nullptr, 0);
    if (data_len == 0u) {
        return OnError("there is no data");
    }
    auto buf = std::make_unique<uint8_t[]>(data_len);
    if (Env::DocGetBlob("data", buf.get(), data_len) != data_len) {
        return OnError("failed to read data");
    }
    auto* value = reinterpret_cast<GitObject::Data*>(buf.get());
    GitOid hash;
    Env::DocGetBlob("obj_id", &hash, sizeof(hash));

    handler(value, data_len, hash);
}

void OnActionGetCommit(const ContractID& cid) {
    using sourc3::GitObject;
    using sourc3::GitOid;
    using sourc3::Repo;
    Repo::Id repo_id;
    GitOid hash;
    Env::DocGet("repo_id", repo_id);
    Env::DocGetBlob("obj_id", &hash, sizeof(hash));
    DataKey key{.m_KeyInContract = {repo_id, hash}};
    key.m_Prefix.m_Cid = cid;
    uint32_t value_len = 0, key_len = 0;
    Env::VarReader reader(key, key);
    if (reader.MoveNext(nullptr, key_len, nullptr, value_len, 0)) {
        auto buf = std::make_unique<uint8_t[]>(value_len);
        reader.MoveNext(nullptr, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<GitObject::Data*>(buf.get());
        mygit2::git_commit commit{};
        if (commit_parse(&commit, value->data, value_len, 0) == 0) {
            AddCommit(commit, hash);
        }
        Env::DocAddBlob("object_data", value->data, value_len);
    } else {
        Env::DocAddBlob("object_data", nullptr, 0);
    }
}

void OnActionGetCommitFromData(const ContractID&) {
    using sourc3::GitObject;
    ParseObjectData(
        [](GitObject::Data* value, size_t value_len, sourc3::GitOid hash) {
            mygit2::git_commit commit{};
            if (commit_parse(&commit, value->data, value_len, 0) == 0) {
                AddCommit(commit, hash);
            }
        });
}

void OnActionGetTree(const ContractID& cid) {
    using sourc3::GitObject;
    using sourc3::GitOid;
    using sourc3::Repo;
    Repo::Id repo_id;
    GitOid hash;
    Env::DocGet("repo_id", repo_id);
    Env::DocGetBlob("obj_id", &hash, sizeof(hash));
    DataKey key{.m_KeyInContract = {repo_id, hash}};
    key.m_Prefix.m_Cid = cid;
    uint32_t value_len = 0, key_len = 0;
    Env::VarReader reader(key, key);
    if (reader.MoveNext(nullptr, key_len, nullptr, value_len, 0)) {
        auto buf = std::make_unique<uint8_t[]>(value_len);
        reader.MoveNext(nullptr, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<GitObject::Data*>(buf.get());
        mygit2::git_tree tree{};
        if (tree_parse(&tree, value->data, value_len) == 0) {
            Env::DocGroup tree_obj("tree");
            char oid_buffer[GIT_OID_HEXSZ + 1];
            oid_buffer[GIT_OID_HEXSZ] = '\0';
            Env::DocArray entries("entries");
            for (size_t i = 0; i < tree.entries.size; ++i) {
                Env::DocGroup entry("");
                Env::DocAddText("filename", tree.entries.ptr[i].filename);
                git_oid_fmt(oid_buffer, tree.entries.ptr[i].oid);
                Env::DocAddNum("attributes",
                               static_cast<uint32_t>(tree.entries.ptr[i].attr));
                Env::DocAddText("oid", oid_buffer);
            }
            Env::Heap_Free(tree.entries.ptr);
        } else {
            OnError("no tree in data");
        }
    } else {
        OnError("No data for tree");
    }
}

void OnActionGetTreeFromData(const ContractID&) {
    using sourc3::GitObject;
    using sourc3::GitOid;
    ParseObjectData([](GitObject::Data* value, size_t value_len, GitOid hash) {
        mygit2::git_tree tree{};
        if (tree_parse(&tree, value->data, value_len) == 0) {
            AddTree(tree);
        } else {
            OnError("no tree in data");
        }
    });
}

void OnActionDeposit(const ContractID& cid) {
    sourc3::method::Deposit args;
    Env::DocGetNum64("amount", &args.amount);
    FundsChange fc;
    fc.m_Consume = 1;
    fc.m_Aid = 0;
    fc.m_Amount = args.amount;
    Env::GenerateKernel(&cid, args.kMethod, &args, sizeof(args), &fc, 1,
                        nullptr, 0, "Deposit", 0);
}

void OnActionViewBalance(const ContractID& cid) {
    Env::Key_T<int> key;
    key.m_Prefix.m_Cid = cid;
    key.m_KeyInContract = 0;
    sourc3::ContractState cs;
    Env::VarReader::Read_T(key, cs);
    Env::DocAddNum("balance", cs.faucet_balance);
}

void GetObjects(const ContractID& cid, sourc3::GitObject::Meta::Type type) {
    using sourc3::GitObject;
    using sourc3::Repo;
    auto [start, end, key] = PrepareGetObject(cid);
    GitObject::Meta value;
    Env::DocArray objects_array("objects");
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, value);) {
        auto current_type = value.type & 0x7f;  // clear first bit
        if (current_type == type) {
            Env::DocGroup obj("");
            Env::DocAddBlob_T("object_hash", value.hash);
            Env::DocAddNum("object_type", static_cast<uint32_t>(value.type));
            Env::DocAddNum("object_size", value.data_size);
        }
    }
}

void OnActionGetCommits(const ContractID& cid) {
    GetObjects(cid, sourc3::GitObject::Meta::kGitObjectCommit);
}

void OnActionGetTrees(const ContractID& cid) {
    GetObjects(cid, sourc3::GitObject::Meta::kGitObjectTree);
}
}  // namespace

BEAM_EXPORT void Method_0() {  // NOLINT
    Env::DocGroup root("");
    {
        Env::DocGroup gr("roles");
        {
            Env::DocGroup gr_role("manager");
            {
                Env::DocGroup gr_method("create_contract");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("hUpgradeDelay", "Height");
                Env::DocAddText("nMinApprovers", "uint32_t");
                Env::DocAddText("uint32_t", "bSkipVerifyVer");
            }
            {
                Env::DocGroup gr_method("schedule_upgrade");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("hTarget", "Height");
                Env::DocAddText("uint32_t", "bSkipVerifyVer");
                Env::DocAddText("uint32_t", "iSender");
                Env::DocAddText("uint32_t", "approve_mask");
            }
            {
                Env::DocGroup gr_method("explicit_upgrade");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("destroy_contract");
                Env::DocAddText("cid", "ContractID");
            }
            { Env::DocGroup gr_method("view_contracts"); }
            {
                Env::DocGroup gr_method("view_contract_params");
                Env::DocAddText("cid", "ContractID");
            }
        }
        {
            Env::DocGroup gr_role("user");
            {
                Env::DocGroup gr_method("create_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("create_project");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of project");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("modify_project");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of project");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("remove_project");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("create_organization");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of organization");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("modify_organization");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of organization");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("remove_organization");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("my_repos");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("all_repos");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("modify_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("delete_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("add_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
                Env::DocAddText("permissions", "permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("modify_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
                Env::DocAddText("permissions", "permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("remove_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("push_objects");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("data", "Push objects");
                Env::DocAddText("ref", "Objects ref");
                Env::DocAddText("ref_target", "Objects ref target");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("list_refs");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("get_key");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("repo_id_by_name");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
                Env::DocAddText("repo_owner", "Owner key of repo");
            }
            {
                Env::DocGroup gr_method("project_id_by_name");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of project");
                Env::DocAddText("owner", "Owner key of project");
            }
            {
                Env::DocGroup gr_method("organization_id_by_name");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("name", "Name of organization");
                Env::DocAddText("owner", "Owner key of organization");
            }
            {
                Env::DocGroup gr_method("repo_get_data");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
            }
            {
                Env::DocGroup gr_method("repo_get_meta");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup gr_method("repo_get_commit");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
            }
            {
                Env::DocGroup gr_method("repo_get_commit_from_data");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("data", "Commit data");
                Env::DocAddText("obj_id", "Object hash");
            }
            {
                Env::DocGroup gr_method("repo_get_tree");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
            }
            {
                Env::DocGroup gr_method("repo_get_tree_from_data");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("data", "Commit data");
                Env::DocAddText("obj_id", "Object hash");
            }
            {
                Env::DocGroup gr_method("list_commits");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup gr_method("list_trees");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup gr_method("list_projects");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("list_project_repos");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
            }
            {
                Env::DocGroup gr_method("list_project_members");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
            }
            {
                Env::DocGroup gr_method("list_organizations");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("list_organization_projects");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
            }
            {
                Env::DocGroup gr_method("list_organization_members");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
            }
            {
                Env::DocGroup gr_method("add_project_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("permissions", "Permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("modify_project_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("permissions", "Permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("remove_project_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("project_id", "Project ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("add_organization_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("permissions", "Permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("modify_organization_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("permissions", "Permissions");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("remove_organization_member");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("organization_id", "Organization ID");
                Env::DocAddText("member", "Member");
                Env::DocAddText("pid", "uint32_t");
            }
            {
                Env::DocGroup gr_method("deposit");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("amount", "Amount");
            }
            {
                Env::DocGroup gr_method("view_balance");
                Env::DocAddText("cid", "ContractID");
            }
        }
    }
}

BEAM_EXPORT void Method_1() {  // NOLINT
    Env::DocGroup root("");
    ActionsMap valid_user_actions = {
        {"create_repo", OnActionCreateRepo},
        {"create_project", OnActionCreateProject},
        {"modify_project", OnActionModifyProject},
        {"remove_project", OnActionRemoveProject},
        {"create_organization", OnActionCreateOrganization},
        {"modify_organization", OnActionModifyOrganization},
        {"remove_organization", OnActionRemoveOrganization},
        {"my_repos", OnActionMyRepos},
        {"all_repos", OnActionAllRepos},
        {"modify_repo", OnActionModifyRepo},
        {"delete_repo", OnActionDeleteRepo},
        {"add_user_params", OnActionAddUserParams},
        {"modify_user_params", OnActionModifyUserParams},
        {"remove_user_params", OnActionRemoveUserParams},
        {"push_objects", OnActionPushObjects},
        {"list_refs", OnActionListRefs},
        {"get_key", OnActionUserGetKey},
        {"repo_id_by_name", OnActionUserGetRepo},
        {"project_id_by_name", OnActionProjectByName},
        {"organization_id_by_name", OnActionOrganizationByName},
        {"repo_get_data", OnActionGetRepoData},
        {"repo_get_meta", OnActionGetRepoMeta},
        {"repo_get_commit", OnActionGetCommit},
        {"repo_get_commit_from_data", OnActionGetCommitFromData},
        {"repo_get_tree", OnActionGetTree},
        {"repo_get_tree_from_data", OnActionGetTreeFromData},
        {"list_commits", OnActionGetCommits},
        {"list_trees", OnActionGetTrees},
        {"list_projects", OnActionListProjects},
        {"list_project_repos", OnActionListProjectRepos},
        {"list_project_members", OnActionListProjectMembers},
        {"list_organizations", OnActionListOrganizations},
        {"list_organization_projects", OnActionListOrganizationProjects},
        {"list_organization_members", OnActionListOrganizationMembers},
        {"add_project_member", OnActionAddProjectMember},
        {"modify_project_member", OnActionModifyProjectMember},
        {"remove_project_member", OnActionRemoveProjectMember},
        {"add_organization_member", OnActionAddOrganizationMember},
        {"modify_organization_member", OnActionModifyOrganizationMember},
        {"deposit", OnActionDeposit},
        {"view_balance", OnActionViewBalance},
        {"remove_organization_member", OnActionRemoveOrganizationMember}};

    ActionsMap valid_manager_actions = {
        {"create_contract", OnActionCreateContract},
        {"schedule_upgrade", OnActionScheduleUpgrade},
        {"explicit_upgrade", OnActionExplicitUpgrade},
        {"my_admin_key", OnActionMyAdminKey},
        {"destroy_contract", OnActionDestroyContract},
        {"view_contracts", OnActionViewContracts},
        {"view_contract_params", OnActionViewContractParams},
    };

    /* Add your new role's actions here */

    RolesMap valid_roles = {
        {"user", valid_user_actions}, {"manager", valid_manager_actions},
        /* Add your new role here */
    };

    char action[kActionBufSize], role[kRoleBufSize];

    if (Env::DocGetText("role", role, sizeof(role)) == 0u) {
        return OnError("Role not specified");
    }

    auto it_role = FindIfContains(role, valid_roles);

    if (it_role == valid_roles.end()) {
        return OnError("Invalid role");
    }

    if (Env::DocGetText("action", action, sizeof(action)) == 0u) {
        return OnError("Action not specified");
    }

    auto it_action = FindIfContains(action, it_role->second);

    if (it_action != it_role->second.end()) {
        ContractID cid;
        Env::DocGet("cid", cid);
        it_action->second(cid);
    } else {
        return OnError("Invalid action");
    }
}
