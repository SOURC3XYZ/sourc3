#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "contract.h"
#include "upgradable3/app_common_impl.h"

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

namespace git_remote_beam {
#include "contract_sid.i"
}

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

struct MyKeyID :public Env::KeyID {
  MyKeyID() :Env::KeyID(&kAdminSeed, sizeof(kAdminSeed)) {}
};

// Add new SID here after changing contract.cpp
const ShaderID kSid[] = {
        git_remote_beam::s_SID
};

const git_remote_beam::Manager::VerInfo kVerInfo = { kSid, _countof(kSid) };

void OnActionCreateContract(const ContractID& unused) {
    MyKeyID kid;
    PubKey pk;
    kid.get_Pk(pk);

    git_remote_beam::method::Initial arg;
    if (!kVerInfo.FillDeployArgs(arg.m_Stgs, &pk)) {
        return;
}

    Env::GenerateKernel(nullptr, 0, &arg, sizeof(arg), nullptr, 0, nullptr, 0, "Deploy sourc3 contract", git_remote_beam::Manager::get_ChargeDeploy()*2);
}

void OnActionScheduleUpgrade(const ContractID& cid) {
    Height hTarget; // NOLINT
    Env::DocGetNum64("hTarget", &hTarget);

    MyKeyID kid;
    git_remote_beam::Manager::MultiSigRitual::Perform_ScheduleUpgrade(kVerInfo, cid, kid, hTarget);
}

void OnActionExplicitUpgrade(const ContractID& cid) {
    MyKeyID kid;
    git_remote_beam::Manager::MultiSigRitual::Perform_ExplicitUpgrade(cid);
}

void OnActionMyAdminKey(const ContractID& cid) {
    PubKey pk;
    MyKeyID kid;
    kid.get_Pk(pk);
    Env::DocAddBlob_T("admin_key", pk);
}

void OnActionDestroyContract(const ContractID& cid) {
    Env::GenerateKernel(&cid, 1, nullptr, 0, nullptr, 0, nullptr, 0,
                        "Destroy git_remote_beam contract", 0);
}

void OnActionViewContracts(const ContractID& unused) {
    MyKeyID kid;
    kVerInfo.DumpAll(&kid);
}

void OnActionViewContractParams(const ContractID& cid) {
    Env::Key_T<uint32_t> k;
    k.m_Prefix.m_Cid = cid;
    k.m_KeyInContract = 0;

    git_remote_beam::ContractState params;
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
    using git_remote_beam::Project;
    using git_remote_beam::Repo;
    using git_remote_beam::method::CreateRepo;

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
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);
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

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateRepo::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create repo",
                        /*nCharge=*/10000000);
}

void OnActionModifyRepo(const ContractID& cid) {
    using git_remote_beam::Repo;
    using git_remote_beam::method::ModifyRepo;

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
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);
    SigRequest sig;
    user_key.FillSigRequest(sig);

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
    using git_remote_beam::Project;
    using git_remote_beam::method::CreateProject;

    char name[Project::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(CreateProject) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<CreateProject*>(buf.get());
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/name, /*n=*/name_len);
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);

    if (!Env::DocGet("organization_id", request->organization_id)) {
        return OnError("'organization_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateProject::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create project",
                        /*nCharge=*/10000000);
}

void OnActionListProjects(const ContractID& cid) {
    using git_remote_beam::Project;
    using ProjectKey = Env::Key_T<Project::Key>;

    ProjectKey start{.m_Prefix = {.m_Cid = cid},
                     .m_KeyInContract = Project::Key{0}};
    ProjectKey end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    ProjectKey key = start;
    Env::DocArray projects("projects");
    uint32_t value_len = 0, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Project*>(buf.get());
        Env::DocGroup project_object("");
        Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
        Env::DocAddNum("project_id", key.m_KeyInContract.id);
        Env::DocAddNum("organization_id", value->organization_id);
        Env::DocAddText("project_name", value->name);
        Env::DocAddBlob_T("project_creator", value->creator);
        value_len = 0;
    }
}

void OnActionProjectByName(const ContractID& cid) {
    using git_remote_beam::Project;
    using ProjectKey = Env::Key_T<Project::Key>;

    char name[Project::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    PubKey owner;
    if (!Env::DocGet("owner", owner)) {
        return OnError("'owner' required");
    }

    ProjectKey start{.m_Prefix = {.m_Cid = cid},
                     .m_KeyInContract = Project::Key{0}};
    ProjectKey end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    ProjectKey key = start;
    Env::DocArray projects("projects");
    uint32_t value_len = 0, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Project*>(buf.get());

        if (Env::Strcmp(value->name, name) == 0 &&
            _POD_(value->creator) == owner) {  // NOLINT
            Env::DocGroup project_object("");
            Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("project_id", key.m_KeyInContract.id);
            Env::DocAddNum("organization_id", value->organization_id);
            Env::DocAddText("project_name", value->name);
            Env::DocAddBlob_T("project_creator", value->creator);
            return;
        }
    }
}

void OnActionListProjectMembers(const ContractID& cid) {
    using git_remote_beam::Members;
    using git_remote_beam::Project;
    using Member = Members<git_remote_beam::kProjectMember, Project>;
    using MemberKey = Env::Key_T<Member::Key>;

    MemberKey start{.m_Prefix = {.m_Cid = cid},
                    .m_KeyInContract = Member::Key{PubKey{}, 0}};
    if (!Env::DocGet("project_id", start.m_KeyInContract.id)) {
        return OnError("no 'project_id'");
    }
    _POD_(start.m_KeyInContract.user).SetZero();
    MemberKey end = start;
    _POD_(end.m_KeyInContract.user).SetObject(0xFF);

    MemberKey key = start;
    Env::DocArray projects("members");
    git_remote_beam::UserInfo member;
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, member);) {
        Env::DocGroup member_object("");
        Env::DocAddBlob_T("member", key.m_KeyInContract.user);
        Env::DocAddNum32("permissions", member.permissions);
    }
}

void OnActionModifyProject(const ContractID& cid) {
    using git_remote_beam::Project;
    using git_remote_beam::method::ModifyProject;

    char name[Project::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(ModifyProject) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<ModifyProject*>(buf.get());
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/name, /*n=*/name_len);
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);

    if (!Env::DocGet("organization_id", request->organization_id)) {
        return OnError("'organization_id' required");
    }

    if (!Env::DocGet("project_id", request->project_id)) {
        return OnError("'project_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyProject::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify project",
                        /*nCharge=*/0);
}

void OnActionRemoveProject(const ContractID& cid) {
    using git_remote_beam::Project;
    using git_remote_beam::method::RemoveProject;

    RemoveProject request;
    UserKey user_key(cid);
    user_key.Get(request.caller);
    if (!Env::DocGet("project_id", request.project_id)) {
        return OnError("'project_id' required");
    }
    SigRequest sig;
    user_key.FillSigRequest(sig);

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
    using git_remote_beam::Project;
    using git_remote_beam::Repo;
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
    using git_remote_beam::Organization;
    using git_remote_beam::method::CreateOrganization;

    char name[Organization::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(CreateOrganization) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<CreateOrganization*>(buf.get());
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/name, /*n=*/name_len);
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);
    SigRequest sig;
    user_key.FillSigRequest(sig);

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/CreateOrganization::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"create organization",
                        /*nCharge=*/10000000);
}

void OnActionListOrganizations(const ContractID& cid) {
    using git_remote_beam::Organization;
    using OrganizationKey = Env::Key_T<Organization::Key>;

    OrganizationKey start{.m_Prefix = {.m_Cid = cid},
                          .m_KeyInContract = Organization::Key{0}};
    auto end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    OrganizationKey key = start;
    Env::DocArray organizations("organizations");
    uint32_t value_len = 0, key_len = sizeof(OrganizationKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Organization*>(buf.get());
        Env::DocGroup org_object("");
        Env::DocAddNum("organization_tag", (uint32_t)key.m_KeyInContract.tag);
        Env::DocAddNum("organization_id", key.m_KeyInContract.id);
        Env::DocAddText("organization_name", value->name);
        Env::DocAddBlob_T("organization_creator", value->creator);
        value_len = 0;
    }
}

void OnActionOrganizationByName(const ContractID& cid) {
    using git_remote_beam::Organization;
    using OrganizationKey = Env::Key_T<Organization::Key>;

    char name[Organization::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    PubKey owner;
    if (!Env::DocGet("owner", owner)) {
        return OnError("'owner' required");
    }

    OrganizationKey start{.m_Prefix = {.m_Cid = cid},
                          .m_KeyInContract = Organization::Key{0}};
    auto end = start;
    end.m_KeyInContract.id = std::numeric_limits<uint64_t>::max();

    OrganizationKey key = start;
    Env::DocArray organizations("organizations");
    uint32_t value_len = 0, key_len = sizeof(OrganizationKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Organization*>(buf.get());
        if (Env::Strcmp(value->name, name) == 0 &&
            _POD_(value->creator) == owner) {  // NOLINT
            Env::DocGroup org_object("");
            Env::DocAddNum("organization_tag",
                           (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("organization_id", key.m_KeyInContract.id);
            Env::DocAddText("organization_name", value->name);
            Env::DocAddBlob_T("organization_creator", value->creator);
            return;
        }
    }
}

void OnActionListOrganizationProjects(const ContractID& cid) {
    using git_remote_beam::Organization;
    using git_remote_beam::Project;
    using ProjectKey = Env::Key_T<Project::Key>;

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
    uint32_t value_len = 0, key_len = sizeof(ProjectKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<Project*>(buf.get());
        if (value->organization_id == org_id) {
            Env::DocGroup project_object("");
            Env::DocAddNum("project_tag", (uint32_t)key.m_KeyInContract.tag);
            Env::DocAddNum("project_id", key.m_KeyInContract.id);
            Env::DocAddNum("organization_id", value->organization_id);
            Env::DocAddText("project_name", value->name);
            Env::DocAddBlob_T("project_creator", value->creator);
        }
        value_len = 0;
    }
}

void OnActionListOrganizationMembers(const ContractID& cid) {
    using git_remote_beam::Members;
    using git_remote_beam::Organization;
    using Member = Members<git_remote_beam::kOrganizationMember, Organization>;
    using MemberKey = Env::Key_T<Member::Key>;

    MemberKey start{.m_Prefix = {.m_Cid = cid},
                    .m_KeyInContract = Member::Key{PubKey{}, 0}};
    if (!Env::DocGet("organization_id", start.m_KeyInContract.id)) {
        return OnError("no 'organization_id'");
    }
    _POD_(start.m_KeyInContract.user).SetZero();
    MemberKey end = start;
    _POD_(end.m_KeyInContract.user).SetObject(0xFF);

    MemberKey key = start;
    Env::DocArray members("members");
    git_remote_beam::UserInfo member;
    for (Env::VarReader reader(start, end); reader.MoveNext_T(key, member);) {
        Env::DocGroup member_object("");
        Env::DocAddBlob_T("member", key.m_KeyInContract.user);
        Env::DocAddNum32("permissions", member.permissions);
    }
}

void OnActionModifyOrganization(const ContractID& cid) {
    using git_remote_beam::Organization;
    using git_remote_beam::method::ModifyOrganization;

    char name[Organization::kMaxNameLen + 1];
    auto name_len = Env::DocGetText("name", name, sizeof(name));
    if (name_len <= 1) {
        return OnError("'name' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(ModifyOrganization) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<ModifyOrganization*>(buf.get());
    UserKey user_key(cid);
    user_key.Get(request->caller);
    request->name_len = name_len;
    Env::Memcpy(/*pDst=*/request->name, /*pSrc=*/name, /*n=*/name_len);
    auto hash = git_remote_beam::GetNameHash(request->name, request->name_len);
    if (!Env::DocGet("organization_id", request->id)) {
        return OnError("'organization_id' required");
    }

    SigRequest sig;
    user_key.FillSigRequest(sig);

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/ModifyOrganization::kMethod,
                        /*pArgs=*/request,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"modify organization",
                        /*nCharge=*/0);
}

void OnActionRemoveOrganization(const ContractID& cid) {
    using git_remote_beam::Organization;
    using git_remote_beam::method::RemoveOrganization;

    RemoveOrganization request;
    UserKey user_key(cid);
    user_key.Get(request.caller);
    if (!Env::DocGet("organization_id", request.id)) {
        return OnError("'organization_id' required");
    }

    SigRequest sig;
    user_key.FillSigRequest(sig);

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
    using git_remote_beam::Project;
    using git_remote_beam::method::AddProjectMember;

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
    using git_remote_beam::Project;
    using git_remote_beam::method::ModifyProjectMember;

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
    using git_remote_beam::Project;
    using git_remote_beam::method::RemoveProjectMember;

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
    using git_remote_beam::Organization;
    using git_remote_beam::method::AddOrganizationMember;

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
    using git_remote_beam::Organization;
    using git_remote_beam::method::ModifyOrganizationMember;

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
    using git_remote_beam::Organization;
    using git_remote_beam::method::RemoveOrganizationMember;

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
    using git_remote_beam::Repo;
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
    using git_remote_beam::Repo;
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
    using git_remote_beam::method::RemoveRepo;
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

    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/RemoveRepo::kMethod,
                        /*pArgs=*/&request,
                        /*nArgs=*/sizeof(request),
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"delete repo",
                        /*nCharge=*/10000000);
}

void OnActionAddUserParams(const ContractID& cid) {
    using git_remote_beam::method::AddRepoMember;
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
    using git_remote_beam::method::ModifyRepoMember;
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
    using git_remote_beam::method::RemoveRepoMember;
    RemoveRepoMember request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.member);

    UserKey user_key(cid);
    user_key.Get(request.caller);
    SigRequest sig;
    user_key.FillSigRequest(sig);

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
    using git_remote_beam::GitRef;
    using git_remote_beam::method::PushObjects;
    using git_remote_beam::method::PushRefs;
    auto data_len = Env::DocGetBlob("data", nullptr, 0);
    if (data_len == 0u) {
        return OnError("there is no data to push");
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
        refs_params->repo_id = params->repo_id;
        refs_params->refs_info.refs_number = refs_count;
        auto* ref = reinterpret_cast<GitRef*>(refs_params + 1);
        if (Env::DocGetBlob("ref_target", &ref->commit_hash,
                            sizeof(git_remote_beam::GitOid)) == 0u) {
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
        Env::GenerateKernel(/*pCid=*/&cid,
                            /*iMethod=*/PushRefs::kMethod,
                            /*pArgs=*/refs_params,
                            /*nArgs=*/ref_args_size,
                            /*pFunds=*/nullptr,
                            /*nFunds=*/0,
                            /*pSig=*/&sig,
                            /*nSig=*/1,
                            /*szComment=*/"Pushing refs",
                            /*nCharge=*/10000000);
    }

    // dump objects for debug
    Env::DocGroup gr("objects");
    {
        Env::DocAddNum32("count", params->objects_number);

        auto* obj =
            reinterpret_cast<const PushObjects::PackedObject*>(params + 1);
        for (uint32_t i = 0; i < params->objects_number; ++i) {
            uint32_t size = obj->data_size;
            Env::DocGroup gr2("object");
            Env::DocAddBlob("oid", &obj->hash, sizeof(git_remote_beam::GitOid));
            Env::DocAddNum32("size", size);
            Env::DocAddNum32("type", obj->type);
            ++obj;  // skip header
            const auto* data = reinterpret_cast<const uint8_t*>(obj);

            obj = reinterpret_cast<const PushObjects::PackedObject*>(
                data + size);  // move to next object
        }
    }

    user_key.Get(params->user);
    Env::GenerateKernel(/*pCid=*/&cid,
                        /*iMethod=*/PushObjects::kMethod,
                        /*pArgs=*/params,
                        /*nArgs=*/args_size,
                        /*pFunds=*/nullptr,
                        /*nFunds=*/0,
                        /*pSig=*/&sig,
                        /*nSig=*/1,
                        /*szComment=*/"Pushing objects",
                        /*nCharge=*/20000000 + 100000 * params->objects_number);
}

void OnActionListRefs(const ContractID& cid) {
    using git_remote_beam::GitRef;
    using git_remote_beam::Repo;
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
        auto buf = std::make_unique<uint8_t[]>(value_len);
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<GitRef*>(buf.get());
        Env::DocGroup repo_object("");
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
    using RepoKey = git_remote_beam::Repo::NameKey;
    using git_remote_beam::Repo;
    char repo_name[Repo::kMaxNameSize + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    --name_len;  // remove 0-term
    PubKey my_key;
    Env::DocGet("repo_owner", my_key);
    git_remote_beam::Hash256 name_hash = git_remote_beam::GetNameHash(repo_name, name_len);
    RepoKey key(my_key, name_hash);
    Env::Key_T<RepoKey> reader_key = {.m_KeyInContract = key};
    reader_key.m_Prefix.m_Cid = cid;
    Repo::Id repo_id = 0;
    if (!Env::VarReader::Read_T(reader_key, repo_id)) {
        return OnError("Failed to read repo ids");
    }
    Env::DocAddNum("repo_id", repo_id);
}

using MetaKey = Env::Key_T<git_remote_beam::GitObject::Meta::Key>;
using DataKey = Env::Key_T<git_remote_beam::GitObject::Data::Key>;

std::tuple<MetaKey, MetaKey, MetaKey> PrepareGetObject(const ContractID& cid) {
    using git_remote_beam::GitObject;
    using git_remote_beam::Repo;

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
    using git_remote_beam::GitObject;
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
    using git_remote_beam::GitObject;
    using git_remote_beam::GitOid;
    using git_remote_beam::Repo;
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

void AddCommit(const mygit2::git_commit& commit,
               const git_remote_beam::GitOid& hash) {
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
    Env::DocAddNum32("commit_time_sec", commit.committer->when.offset);
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

void ParseObjectData(
    const std::function<void(git_remote_beam::GitObject::Data*, size_t,
                             git_remote_beam::GitOid)>& handler) {
    using git_remote_beam::GitObject;
    using git_remote_beam::GitOid;
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
    using git_remote_beam::GitObject;
    using git_remote_beam::GitOid;
    using git_remote_beam::Repo;
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
    using git_remote_beam::GitObject;
    ParseObjectData([](GitObject::Data* value, size_t value_len,
                       git_remote_beam::GitOid hash) {
        mygit2::git_commit commit{};
        if (commit_parse(&commit, value->data, value_len, 0) == 0) {
            AddCommit(commit, hash);
        }
    });
}

void OnActionGetTree(const ContractID& cid) {
    using git_remote_beam::GitObject;
    using git_remote_beam::GitOid;
    using git_remote_beam::Repo;
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
    using git_remote_beam::GitObject;
    using git_remote_beam::GitOid;
    ParseObjectData([](GitObject::Data* value, size_t value_len, GitOid hash) {
        mygit2::git_tree tree{};
        if (tree_parse(&tree, value->data, value_len) == 0) {
            AddTree(tree);
        } else {
            OnError("no tree in data");
        }
    });
}

void GetObjects(const ContractID& cid,
                git_remote_beam::GitObject::Meta::Type type) {
    using git_remote_beam::GitObject;
    using git_remote_beam::Repo;
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
    GetObjects(cid, git_remote_beam::GitObject::Meta::kGitObjectCommit);
}

void OnActionGetTrees(const ContractID& cid) {
    GetObjects(cid, git_remote_beam::GitObject::Meta::kGitObjectTree);
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
