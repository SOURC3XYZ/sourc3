#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"

namespace Env {
#include "bvm2_cost.h"
}  // namespace Env

#include "contract.h"

#include <algorithm>
#include <vector>
#include <utility>
#include <string_view>
#include <memory>
#include <charconv>
#include <limits>

#include "../try-to-add-libgit2/full_git.h"

namespace GitRemoteBeam {
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

void OnActionCreateContract(const ContractID& unused) {
    GitRemoteBeam::InitialParams params;

    Env::GenerateKernel(nullptr, GitRemoteBeam::InitialParams::METHOD, &params,
                        sizeof(params), nullptr, 0, nullptr, 0,
                        "Create GitRemoteBeam contract", 0);
}

void OnActionDestroyContract(const ContractID& cid) {
    Env::GenerateKernel(&cid, 1, nullptr, 0, nullptr, 0, nullptr, 0,
                        "Destroy GitRemoteBeam contract", 0);
}

void OnActionViewContracts(const ContractID& unused) {
    EnumAndDumpContracts(GitRemoteBeam::s_SID);
}

void OnActionViewContractParams(const ContractID& cid) {
    Env::Key_T<int> k;
    k.m_Prefix.m_Cid = cid;
    k.m_KeyInContract = 0;

    GitRemoteBeam::InitialParams params;
    if (!Env::VarReader::Read_T(k, params)) {
        return OnError("Failed to read contract's initial params");
    }

    Env::DocGroup gr("params");
}

GitRemoteBeam::Hash256 GetNameHash(const char* name, size_t len) {
    GitRemoteBeam::Hash256 res;
    HashProcessor::Sha256 hp;
    hp.Write(name, len);
    hp >> res;
    return res;
}

void OnActionCreateRepo(const ContractID& cid) {
    using namespace GitRemoteBeam;

    char repo_name[RepoInfo::MAX_NAME_SIZE + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    --name_len;  // remove 0-term
    auto args_size = sizeof(CreateRepoParams) + name_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* request = reinterpret_cast<CreateRepoParams*>(buf.get());
    Env::DerivePk(request->repo_owner, &cid, sizeof(cid));
    request->repo_name_length = name_len;
    Env::Memcpy(request->repo_name, repo_name, name_len);
    auto hash = GetNameHash(request->repo_name, request->repo_name_length);
    Env::DocAddText("accepted_repo_name", request->repo_name);
    Env::DocAddBlob_T("accepted_hash", hash);
    SigRequest sig;
    sig.m_pID = &cid;
    sig.m_nID = sizeof(cid);

    // estimate change
    // uint32_t charge =
    //    Env::Cost::CallFar +
    //    Env::Cost::LoadVar_For(sizeof(InitialParams)) +
    //    Env::Cost::LoadVar_For(sizeof(uint64_t)) +
    //    Env::Cost::SaveVar_For(sizeof(InitialParams)) +
    //    Env::Cost::SaveVar_For(sizeof(CreateRepoParams)) +
    //    Env::Cost::SaveVar_For(sizeof(uint64_t)) +
    //    Env::Cost::AddSig +
    //    Env::Cost::MemOpPerByte * (sizeof(RepoInfo) +
    //    sizeof(CreateRepoParams))
    //    + Env::Cost::Cycle * 300; // should be enought

    Env::GenerateKernel(&cid, CreateRepoParams::METHOD, request, args_size,
                        nullptr, 0, &sig, 1, "create repo", 10000000);
}

void OnActionMyRepos(const ContractID& cid) {
    using namespace GitRemoteBeam;
    using RepoKey = Env::Key_T<RepoInfo::Key>;
    RepoKey start, end;
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(end) = start;
    end.m_KeyInContract.repo_id = std::numeric_limits<uint64_t>::max();

    RepoKey key;
    PubKey my_key;
    Env::DerivePk(my_key, &cid, sizeof(cid));
    Env::DocArray repos("repos");
    uint32_t value_len = 0, keyLen = sizeof(RepoKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, keyLen, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, keyLen, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<RepoInfo*>(buf.get());
        if ((_POD_(value->owner) == my_key) != 0u) {
            Env::DocGroup repo_object("");
            Env::DocAddNum("repo_id", value->repo_id);
            Env::DocAddText("repo_name", value->name);
        }
        value_len = 0;
    }
}

void OnActionAllRepos(const ContractID& cid) {
    using namespace GitRemoteBeam;
    using RepoKey = Env::Key_T<RepoInfo::Key>;
    RepoKey start, end;
    _POD_(start.m_Prefix.m_Cid) = cid;
    _POD_(end) = start;
    end.m_KeyInContract.repo_id = std::numeric_limits<uint64_t>::max();

    RepoKey key;
    PubKey my_key;
    Env::DerivePk(my_key, &cid, sizeof(cid));
    Env::DocArray repos("repos");
    uint32_t value_len = 0, key_len = sizeof(RepoKey);
    for (Env::VarReader reader(start, end);
         reader.MoveNext(&key, key_len, nullptr, value_len, 0);) {
        auto buf = std::make_unique<uint8_t[]>(value_len + 1);  // 0-term
        reader.MoveNext(&key, key_len, buf.get(), value_len, 1);
        auto* value = reinterpret_cast<RepoInfo*>(buf.get());
        Env::DocGroup repo_object("");
        Env::DocAddNum("repo_id", value->repo_id);
        Env::DocAddText("repo_name", value->name);
        Env::DocAddBlob_T("repo_owner", value->owner);
        value_len = 0;
    }
}

void OnActionDeleteRepo(const ContractID& cid) {
    uint64_t repo_id;
    if (!Env::DocGet("repo_id", repo_id)) {
        return OnError("no repo id for deleting");
    }

    GitRemoteBeam::DeleteRepoParams request;
    request.repo_id = repo_id;

    Env::DerivePk(request.user, &cid, sizeof(cid));

    SigRequest sig;
    sig.m_pID = &cid;
    sig.m_nID = sizeof(cid);

    Env::GenerateKernel(&cid, GitRemoteBeam::DeleteRepoParams::METHOD, &request,
                        sizeof(request), nullptr, 0, &sig, 1, "delete repo",
                        10000000);
}

void OnActionAddUserParams(const ContractID& cid) {
    GitRemoteBeam::AddUserParams request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.user);

    SigRequest sig;
    sig.m_pID = &cid;
    sig.m_nID = sizeof(cid);

    Env::GenerateKernel(&cid, GitRemoteBeam::AddUserParams::METHOD, &request,
                        sizeof(request), nullptr, 0, &sig, 1, "add user params",
                        0);
}

void OnActionRemoveUserParams(const ContractID& cid) {
    GitRemoteBeam::RemoveUserParams request;
    Env::DocGet("repo_id", request.repo_id);
    Env::DocGet("user", request.user);

    SigRequest sig;
    sig.m_pID = &cid;
    sig.m_nID = sizeof(cid);

    Env::GenerateKernel(&cid, GitRemoteBeam::RemoveUserParams::METHOD, &request,
                        sizeof(request), nullptr, 0, &sig, 1,
                        "remove user params", 0);
}

void OnActionPushObjects(const ContractID& cid) {
    using namespace GitRemoteBeam;
    auto data_len = Env::DocGetBlob("data", nullptr, 0);
    if (data_len == 0u) {
        return OnError("there is no data to push");
    }
    size_t args_size;
    args_size = sizeof(PushObjectsParams) + data_len;
    auto buf = std::make_unique<uint8_t[]>(args_size);
    auto* params = reinterpret_cast<PushObjectsParams*>(buf.get());
    auto* p = reinterpret_cast<uint8_t*>(&params->objects_number);
    if (Env::DocGetBlob("data", p, data_len) != data_len) {
        return OnError("failed to read push data");
    }
    if (!Env::DocGet("repo_id", params->repo_id)) {
        return OnError("failed to read 'repo_id'");
    }
    Env::DocAddNum("repo_id", params->repo_id);

    SigRequest sig;
    sig.m_pID = &cid;
    sig.m_nID = sizeof(cid);

    char ref_name[GitRef::MAX_NAME_SIZE + 1];
    auto name_len = Env::DocGetText("ref", ref_name, _countof(ref_name));
    if (name_len == 1) {
        return OnError("failed to read 'ref'");
    } else if (name_len > 1) {
        --name_len;             // remove '0'-term;
        size_t refs_count = 1;  // single ref for now
        auto ref_args_size = sizeof(PushRefsParams) + sizeof(GitRef) + name_len;
        auto res_memory = std::make_unique<uint8_t[]>(ref_args_size);
        auto* refs_params = reinterpret_cast<PushRefsParams*>(res_memory.get());
        refs_params->repo_id = params->repo_id;
        refs_params->refs_info.refs_number = refs_count;
        auto* ref = reinterpret_cast<GitRef*>(refs_params + 1);
        if (Env::DocGetBlob("ref_target", &ref->commit_hash, sizeof(git_oid)) ==
            0u) {
            return OnError("failed to read 'ref_target'");
        }
        ref->name_length = name_len;
        Env::Memcpy(ref->name, ref_name, name_len);

        // dump refs for debug
        Env::DocGroup grr("refs");
        {
            Env::DocAddNum32("count", refs_params->refs_info.refs_number);
            Env::DocGroup gr2("ref");
            Env::DocAddBlob("oid", &ref->commit_hash, 20);
            Env::DocAddText("name", ref->name);
        }

        Env::DerivePk(refs_params->user, &cid, sizeof(cid));
        Env::GenerateKernel(&cid, PushRefsParams::METHOD, refs_params,
                            ref_args_size, nullptr, 0, &sig, 1, "Pushing refs",
                            10000000);
    }

    // dump objects for debug
    Env::DocGroup gr("objects");
    {
        Env::DocAddNum32("count", params->objects_number);

        auto* obj = reinterpret_cast<const PushObjectsParams::PackedObject*>(
            params + 1);
        for (uint32_t i = 0; i < params->objects_number; ++i) {
            uint32_t size = obj->data_size;
            Env::DocGroup gr2("object");
            Env::DocAddBlob("oid", &obj->hash, sizeof(git_oid));
            Env::DocAddNum32("size", size);
            Env::DocAddNum32("type", obj->type);
            ++obj;  // skip header
            const auto* data = reinterpret_cast<const uint8_t*>(obj);

            obj = reinterpret_cast<const PushObjectsParams::PackedObject*>(
                data + size);  // move to next object
        }
    }

    Env::DerivePk(params->user, &cid, sizeof(cid));
    Env::GenerateKernel(&cid, PushObjectsParams::METHOD, params, args_size,
                        nullptr, 0, &sig, 1, "Pushing objects",
                        20000000 + 100000 * params->objects_number);
}

void OnActionListRefs(const ContractID& cid) {
    using namespace GitRemoteBeam;
    using Key = Env::Key_T<GitRef::Key>;
    Key start, end;
    RepoInfo::Id repo_id = 0;
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
    PubKey pk;
    Env::DerivePk(pk, &cid, sizeof(cid));
    Env::DocAddBlob_T("key", pk);
}

void OnActionUserGetRepo(const ContractID& cid) {
    using RepoKey = GitRemoteBeam::RepoInfo::NameKey;
    using GitRemoteBeam::RepoInfo;
    char repo_name[RepoInfo::MAX_NAME_SIZE + 1];
    auto name_len = Env::DocGetText("repo_name", repo_name, sizeof(repo_name));
    if (name_len <= 1) {
        return OnError("'repo_name' required");
    }
    --name_len;  // remove 0-term
    PubKey my_key;
    Env::DocGet("repo_owner", my_key);
    GitRemoteBeam::Hash256 name_hash = GetNameHash(repo_name, name_len);
    RepoKey key(my_key, name_hash);
    Env::Key_T<RepoKey> reader_key = {.m_KeyInContract = key};
    reader_key.m_Prefix.m_Cid = cid;
  RepoInfo::Id repo_id = 0;
    if (!Env::VarReader::Read_T(reader_key, repo_id)) {
        return OnError("Failed to read repo ids");
    }
    Env::DocAddNum("repo_id", repo_id);
}

using MetaKey = Env::Key_T<GitRemoteBeam::GitObject::Meta::Key>;
using DataKey = Env::Key_T<GitRemoteBeam::GitObject::Data::Key>;

std::tuple<MetaKey, MetaKey, MetaKey> PrepareGetObject(const ContractID& cid) {
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    using GitRemoteBeam::RepoInfo;

    RepoInfo::Id repo_id;
    Env::DocGet("repo_id", repo_id);
    MetaKey start{.m_KeyInContract = {repo_id, 0}};
    MetaKey end{.m_KeyInContract = {repo_id,
                                    std::numeric_limits<GitObject::ID>::max()}};
    start.m_Prefix.m_Cid = cid;
    end.m_Prefix.m_Cid = cid;
    MetaKey key{
        .m_KeyInContract = {repo_id, 0}};  // dummy value to initialize reading
    return {start, end, key};
}

void OnActionGetRepoMeta(const ContractID& cid) {
    using GitRemoteBeam::GitObject;
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
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    using GitRemoteBeam::RepoInfo;
    RepoInfo::Id repo_id;
    git_oid hash;
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
        //            On_error("sorry, but no object_data(");
    }
}

void AddCommit(const mygit2::git_commit& commit,
               const GitRemoteBeam::git_oid& hash) {
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
    const std::function<void(GitRemoteBeam::GitObject::Data*, size_t,
                             GitRemoteBeam::git_oid)>& handler) {
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    auto data_len = Env::DocGetBlob("data", nullptr, 0);
    if (data_len == 0u) {
        return OnError("there is no data");
    }
    auto buf = std::make_unique<uint8_t[]>(data_len);
    if (Env::DocGetBlob("data", buf.get(), data_len) != data_len) {
        return OnError("failed to read data");
    }
    auto* value = reinterpret_cast<GitObject::Data*>(buf.get());
    git_oid hash;
    Env::DocGetBlob("obj_id", &hash, sizeof(hash));

    handler(value, data_len, hash);
}

void OnActionGetCommit(const ContractID& cid) {
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    using GitRemoteBeam::RepoInfo;
    RepoInfo::Id repo_id;
    git_oid hash;
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
    using GitRemoteBeam::GitObject;
    ParseObjectData([](GitObject::Data* value, size_t value_len,
                       GitRemoteBeam::git_oid hash) {
        mygit2::git_commit commit{};
        if (commit_parse(&commit, value->data, value_len, 0) == 0) {
            AddCommit(commit, hash);
        }
    });
}

void OnActionGetTree(const ContractID& cid) {
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    using GitRemoteBeam::RepoInfo;
    RepoInfo::Id repo_id;
    git_oid hash;
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
    using GitRemoteBeam::git_oid;
    using GitRemoteBeam::GitObject;
    ParseObjectData([](GitObject::Data* value, size_t value_len, git_oid hash) {
        mygit2::git_tree tree{};
        if (tree_parse(&tree, value->data, value_len) == 0) {
            AddTree(tree);
        } else {
            OnError("no tree in data");
        }
    });
}

void GetObjects(const ContractID& cid,
                GitRemoteBeam::GitObject::Meta::Type type) {
    using GitRemoteBeam::GitObject;
    using GitRemoteBeam::RepoInfo;
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
    GetObjects(cid, GitRemoteBeam::GitObject::Meta::kGitObjectCommit);
}

void OnActionGetTrees(const ContractID& cid) {
    GetObjects(cid, GitRemoteBeam::GitObject::Meta::kGitObjectTree);
}
}  // namespace

BEAM_EXPORT void Method_0() {  // NOLINT
    Env::DocGroup root("");
    {
        Env::DocGroup gr("roles");
        {
            Env::DocGroup gr_role("manager");
            { Env::DocGroup gr_method("create_contract"); }
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
            }
            {
                Env::DocGroup gr_method("my_repos");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("all_repos");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("delete_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup gr_method("add_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
            }
            {
                Env::DocGroup gr_method("remove_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
            }
            {
                Env::DocGroup gr_method("push_objects");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("data", "Push objects");
                Env::DocAddText("ref", "Objects ref");
                Env::DocAddText("ref_target", "Objects ref target");
            }
            {
                Env::DocGroup gr_method("list_refs");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup gr_method("get_key");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup gr_method("repo_id_by_name");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
                Env::DocAddText("repo_owner", "Owner key of repo");
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
        }
    }
}

BEAM_EXPORT void Method_1() {  // NOLINT
    Env::DocGroup root("");
    ActionsMap valid_user_actions = {
        {"create_repo", OnActionCreateRepo},
        {"my_repos", OnActionMyRepos},
        {"all_repos", OnActionAllRepos},
        {"delete_repo", OnActionDeleteRepo},
        {"add_user_params", OnActionAddUserParams},
        {"remove_user_params", OnActionRemoveUserParams},
        {"push_objects", OnActionPushObjects},
        {"list_refs", OnActionListRefs},
        {"get_key", OnActionUserGetKey},
        {"repo_id_by_name", OnActionUserGetRepo},
        {"repo_get_data", OnActionGetRepoData},
        {"repo_get_meta", OnActionGetRepoMeta},
        {"repo_get_commit", OnActionGetCommit},
        {"repo_get_commit_from_data", OnActionGetCommitFromData},
        {"repo_get_tree", OnActionGetTree},
        {"repo_get_tree_from_data", OnActionGetTreeFromData},
        {"list_commits", OnActionGetCommits},
        {"list_trees", OnActionGetTrees}};

    ActionsMap valid_manager_actions = {
        {"create_contract", OnActionCreateContract},
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
