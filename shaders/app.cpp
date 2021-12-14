#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"

namespace Env {
#include "../beam/bvm/bvm2_cost.h"
} // namespace Env

#include "contract.h"

#include <algorithm>
#include <vector>
#include <utility>
#include <string_view>
#include <memory>
#include <charconv>

#include "../try-to-add-libgit2/full_git.h"

namespace GitRemoteBeam
{
#include "contract_sid.i"
}

namespace
{
    using Action_func_t = void (*)(const ContractID&);
    using Actions_map_t = std::vector<std::pair<std::string_view, Action_func_t>>;
    using Roles_map_t = std::vector<std::pair<std::string_view, const Actions_map_t&>>;

    constexpr size_t ACTION_BUF_SIZE = 32;
    constexpr size_t ROLE_BUF_SIZE = 16;

    void On_error(const char* msg)
    {
        Env::DocAddText("error", msg);
    }

    template <typename T>
    auto find_if_contains(const std::string_view str, const std::vector<std::pair<std::string_view, T>>& v)
    {
        return std::find_if(v.begin(), v.end(), [&str](const auto& p) {
            return str == p.first;
        });
    }

    void On_action_create_contract(const ContractID& unused)
    {
        GitRemoteBeam::InitialParams params;

        Env::GenerateKernel(nullptr, GitRemoteBeam::InitialParams::METHOD, &params, sizeof(params), nullptr, 0, nullptr, 0, "Create GitRemoteBeam contract", 0);
    }

    void On_action_destroy_contract(const ContractID& cid)
    {
        Env::GenerateKernel(&cid, 1, nullptr, 0, nullptr, 0, nullptr, 0, "Destroy GitRemoteBeam contract", 0);
    }

    void On_action_view_contracts(const ContractID& unused)
    {
        EnumAndDumpContracts(GitRemoteBeam::s_SID);
    }

    void On_action_view_contract_params(const ContractID& cid)
    {
        Env::Key_T<int> k;
        k.m_Prefix.m_Cid = cid;
        k.m_KeyInContract = 0;

        GitRemoteBeam::InitialParams params;
        if (!Env::VarReader::Read_T(k, params))
            return On_error("Failed to read contract's initial params");

        Env::DocGroup gr("params");
    }

    GitRemoteBeam::Hash256 get_name_hash(const char* name, size_t len)
    {
        GitRemoteBeam::Hash256 res;
        HashProcessor::Sha256 hp;
        hp.Write(name, len);
        hp >> res;
        return res;
    }

    void On_action_create_repo(const ContractID& cid)
    {
        using namespace GitRemoteBeam;

        char repoName[RepoInfo::MAX_NAME_SIZE + 1];
        auto nameLen = Env::DocGetText("repo_name", repoName, sizeof(repoName));
        if (nameLen <= 1) {
            return On_error("'repo_name' required");
        }
        --nameLen; // remove 0-term
        auto argsSize = sizeof(CreateRepoParams) + nameLen;
        auto buf = std::make_unique<uint8_t[]>(argsSize);
        auto* request = reinterpret_cast<CreateRepoParams*>(buf.get());
        Env::DerivePk(request->repo_owner, &cid, sizeof(cid));
        request->repo_name_length = nameLen;
        Env::Memcpy(request->repo_name, repoName, nameLen);
        auto hash = get_name_hash(request->repo_name, request->repo_name_length);
        Env::DocAddText("accepted_repo_name", request->repo_name);
        Env::DocAddBlob_T("accepted_hash", hash);
        SigRequest sig;
        sig.m_pID = &cid;
        sig.m_nID = sizeof(cid);

        // estimate change
        //uint32_t charge =
        //    Env::Cost::CallFar +
        //    Env::Cost::LoadVar_For(sizeof(InitialParams)) +
        //    Env::Cost::LoadVar_For(sizeof(uint64_t)) +
        //    Env::Cost::SaveVar_For(sizeof(InitialParams)) +
        //    Env::Cost::SaveVar_For(sizeof(CreateRepoParams)) +
        //    Env::Cost::SaveVar_For(sizeof(uint64_t)) +
        //    Env::Cost::AddSig +
        //    Env::Cost::MemOpPerByte * (sizeof(RepoInfo) + sizeof(CreateRepoParams)) +
        //    Env::Cost::Cycle * 300; // should be enought

        Env::GenerateKernel(&cid, CreateRepoParams::METHOD, request, argsSize,
                            nullptr, 0, &sig, 1, "create repo", 10000000);
    }

    void On_action_my_repos(const ContractID& cid) 
    {
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
        uint32_t valueLen = 0, keyLen = sizeof(RepoKey);
        for (Env::VarReader reader(start, end); reader.MoveNext(&key, keyLen, nullptr, valueLen, 0);) {
            auto buf = std::make_unique<uint8_t[]>(valueLen + 1); // 0-term
            reader.MoveNext(&key, keyLen, buf.get(), valueLen, 1);
            auto* value = reinterpret_cast<RepoInfo*>(buf.get());
            if (_POD_(value->owner) == my_key) {
                Env::DocGroup repo_object("");
                Env::DocAddNum("repo_id", value->repo_id);
                Env::DocAddText("repo_name", value->name);
            }
            valueLen = 0;
        }
    }

    void On_action_all_repos(const ContractID& cid)
    {
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
        uint32_t valueLen = 0, keyLen = sizeof(RepoKey);
        for (Env::VarReader reader(start, end); reader.MoveNext(&key, keyLen, nullptr, valueLen, 0);) {
            auto buf = std::make_unique<uint8_t[]>(valueLen + 1); // 0-term
            reader.MoveNext(&key, keyLen, buf.get(), valueLen, 1);
            auto* value = reinterpret_cast<RepoInfo*>(buf.get());
            Env::DocGroup repo_object("");
            Env::DocAddNum("repo_id", value->repo_id);
            Env::DocAddText("repo_name", value->name);
            valueLen = 0;
        }
    }

    void On_action_delete_repo(const ContractID& cid) {
        uint64_t repo_id;
        if (!Env::DocGet("repo_id", repo_id)) {
            return On_error("no repo id for deleting");
        }

        GitRemoteBeam::DeleteRepoParams request;
        request.repo_id = repo_id;

        Env::DerivePk(request.user, &cid, sizeof(cid));

        SigRequest sig;
        sig.m_pID = &cid;
        sig.m_nID = sizeof(cid);

        Env::GenerateKernel(&cid, GitRemoteBeam::DeleteRepoParams::METHOD, &request, sizeof(request),
                nullptr, 0, &sig, 1, "delete repo", 10000000);
    }

    void On_action_add_user_params(const ContractID& cid) {
        GitRemoteBeam::AddUserParams request;
        Env::DocGet("repo_id", request.repo_id);
        Env::DocGet("user", request.user);

        SigRequest sig;
        sig.m_pID = &cid;
        sig.m_nID = sizeof(cid);

        Env::GenerateKernel(&cid, GitRemoteBeam::AddUserParams::METHOD, &request, sizeof(request),
            nullptr, 0, &sig, 1, "add user params", 0);
    }

    void On_action_remove_user_params(const ContractID& cid) {
        GitRemoteBeam::RemoveUserParams request;
        Env::DocGet("repo_id", request.repo_id);
        Env::DocGet("user", request.user);

        SigRequest sig;
        sig.m_pID = &cid;
        sig.m_nID = sizeof(cid);

        Env::GenerateKernel(&cid, GitRemoteBeam::RemoveUserParams::METHOD, &request, sizeof(request),
            nullptr, 0, &sig, 1, "remove user params", 0);
    }

    void On_action_push_objects(const ContractID& cid)
    {
        using namespace GitRemoteBeam;
        auto dataLen = Env::DocGetBlob("data", nullptr, 0);
        if (!dataLen) {
            return On_error("there is no data to push");
        }
        auto argsSize = sizeof(PushObjectsParams) + dataLen;
        auto buf = std::make_unique<uint8_t[]>(argsSize);
        auto* params = reinterpret_cast<PushObjectsParams*>(buf.get());
        auto* p = reinterpret_cast<uint8_t*>(&params->objects_number);
        if (Env::DocGetBlob("data", p, dataLen) != dataLen) {
            return On_error("failed to read push data");
        }
        if (!Env::DocGet("repo_id", params->repo_id)) {
            return On_error("failed to read 'repo_id'");
        }
        Env::DocAddNum("repo_id", params->repo_id);

        char refName[GitRef::MAX_NAME_SIZE + 1];
        auto nameLen = Env::DocGetText("ref", refName, _countof(refName));
        if (nameLen <= 1) {
            return On_error("failed to read 'ref'");
        }
        --nameLen; // remove '0'-term;
        size_t refsCount = 1; // single ref for now
        auto refArgsSize = sizeof(PushRefsParams) + sizeof(GitRef) + nameLen;
        auto resMemory = std::make_unique<uint8_t[]>(refArgsSize);
        auto* refsParams = reinterpret_cast<PushRefsParams*>(resMemory.get());
        refsParams->repo_id = params->repo_id;
        refsParams->refs_info.refs_number = refsCount;
        auto* ref = reinterpret_cast<GitRef*>(refsParams + 1);
        if (!Env::DocGetBlob("ref_target", &ref->commit_hash, sizeof(git_oid))) {
            return On_error("failed to read 'ref_target'");
        }
        ref->name_length = nameLen;
        Env::Memcpy(ref->name, refName, nameLen);

        // dump refs for debug
        Env::DocGroup grr("refs");
        {
            Env::DocAddNum32("count", refsParams->refs_info.refs_number);
            Env::DocGroup gr2("ref");
            Env::DocAddBlob("oid", &ref->commit_hash, 20);
            Env::DocAddText("name", ref->name);
        }

        // dump objects for debug
        Env::DocGroup gr("objects");
        {
            Env::DocAddNum32("count", params->objects_number);

            auto* obj = reinterpret_cast<const PushObjectsParams::PackedObject*>(params + 1);
            for (uint32_t i = 0; i < params->objects_number; ++i) {

                uint32_t size = obj->data_size;
                Env::DocGroup gr2("object");
                Env::DocAddBlob("oid", &obj->hash, sizeof(git_oid));
                Env::DocAddNum32("size", size);
                Env::DocAddNum32("type", obj->type);
                ++obj; // skip header
                const auto* data = reinterpret_cast<const uint8_t*>(obj);

                obj = reinterpret_cast<const PushObjectsParams::PackedObject*>(data + size); // move to next object
            }
        }

        Env::DerivePk(params->user, &cid, sizeof(cid));
        Env::DerivePk(refsParams->user, &cid, sizeof(cid));

        SigRequest sig;
        sig.m_pID = &cid;
        sig.m_nID = sizeof(cid);

        Env::GenerateKernel(&cid, PushObjectsParams::METHOD, params, argsSize,
            nullptr, 0, &sig, 1, "Pushing objects", 20000000);

        Env::GenerateKernel(&cid, PushRefsParams::METHOD, refsParams, refArgsSize,
            nullptr, 0, &sig, 1, "Pushing refs", 10000000);
    }

    void On_action_list_refs(const ContractID& cid)
    {
        using namespace GitRemoteBeam;
        using Key = Env::Key_T<GitRef::Key>;
        Key start, end;
        RepoInfo::ID repo_id = 0;
        if (!Env::DocGet("repo_id", repo_id)) {
            return On_error("failed to read 'repo_id'");
        }

        start.m_KeyInContract.repo_id = Utils::FromBE(repo_id);
        _POD_(start.m_Prefix.m_Cid) = cid;
        _POD_(start.m_KeyInContract.name_hash).SetZero();
        _POD_(end) = start;
        _POD_(end.m_KeyInContract.name_hash).SetObject(0xff);

        Key key;
        Env::DocArray repos("refs");
        uint32_t valueLen = 0, keyLen = sizeof(Key);
        for (Env::VarReader reader(start, end); reader.MoveNext(&key, keyLen, nullptr, valueLen, 0);) {
            auto buf = std::make_unique<uint8_t[]>(valueLen);
            reader.MoveNext(&key, keyLen, buf.get(), valueLen, 1);
            auto* value = reinterpret_cast<GitRef*>(buf.get());
            Env::DocGroup repo_object("");
            Env::DocAddText("name", value->name);
            Env::DocAddBlob("commit_hash", &value->commit_hash, sizeof(value->commit_hash));
            valueLen = 0;
        }
    }

    void On_action_user_get_key(const ContractID& cid)
    {
        PubKey pk;
        Env::DerivePk(pk, &cid, sizeof(cid));
        Env::DocAddBlob_T("key", pk);
    }

    void On_action_user_get_repo(const ContractID& cid) {
        using RepoKey = GitRemoteBeam::RepoInfo::NameKey;
        using GitRemoteBeam::RepoInfo;
        char repoName[RepoInfo::MAX_NAME_SIZE + 1];
        auto nameLen = Env::DocGetText("repo_name", repoName, sizeof(repoName));
        if (nameLen <= 1) {
            return On_error("'repo_name' required");
        }
        --nameLen; // remove 0-term
        PubKey my_key;
        Env::DerivePk(my_key, &cid, sizeof(cid));
        GitRemoteBeam::Hash256 name_hash = get_name_hash(repoName, nameLen);
        RepoKey key(my_key, name_hash);
        Env::Key_T<RepoKey> reader_key = { .m_KeyInContract = key };
        reader_key.m_Prefix.m_Cid = cid;
        RepoInfo::ID repo_id = 0;
        Env::DocAddText("accepted_name", repoName);
        Env::DocAddBlob_T("accepted_hash", name_hash);
        if (!Env::VarReader::Read_T(reader_key, repo_id)) {
            return On_error("Failed to read repo ids");
        }
        Env::DocAddNum("repo_id", repo_id);
    }

    using MetaKey = Env::Key_T<GitRemoteBeam::GitObject::Meta::Key>;
    using DataKey = Env::Key_T<GitRemoteBeam::GitObject::Data::Key>;

    std::tuple<MetaKey, MetaKey, MetaKey> PrepareGetObject(const ContractID& cid) {
        using GitRemoteBeam::RepoInfo;
        using GitRemoteBeam::GitObject;
        using GitRemoteBeam::git_oid;

        RepoInfo::ID repo_id;
        Env::DocGet("repo_id", repo_id);
        MetaKey start { .m_KeyInContract = { repo_id, 0 } };
        MetaKey end { .m_KeyInContract = { repo_id, std::numeric_limits<GitObject::ID>::max() } };
        start.m_Prefix.m_Cid = cid;
        end.m_Prefix.m_Cid = cid;
        MetaKey key { .m_KeyInContract = { repo_id, 0 } }; // dummy values to initialize;
        return {start, end, key};
    }

    void On_action_get_repo_meta(const ContractID& cid) {
        using GitRemoteBeam::GitObject;
        auto[start, end, key] = PrepareGetObject(cid);

        GitObject::Meta value;
        Env::DocArray objects_array("objects");
        for (Env::VarReader reader(start, end); reader.MoveNext_T(key, value);) {
            Env::DocGroup obj("");
            Env::DocAddBlob_T("object_hash", value.hash);
            Env::DocAddNum("object_type", static_cast<uint32_t>(value.type));
            Env::DocAddNum("object_size", value.data_size);
        }
    }

    void On_action_get_repo_data(const ContractID &cid) {
        using GitRemoteBeam::RepoInfo;
        using GitRemoteBeam::GitObject;
        using GitRemoteBeam::git_oid;
        RepoInfo::ID repo_id;
        git_oid hash;
        Env::DocGet("repo_id", repo_id);
        Env::DocGetBlob("obj_id", &hash, sizeof(hash));
        DataKey key { .m_KeyInContract = {repo_id, hash} };
        key.m_Prefix.m_Cid = cid;
        uint32_t valueLen = 0, keyLen = 0;
        Env::VarReader reader(key, key);
        if (reader.MoveNext(nullptr, keyLen, nullptr, valueLen, 0)) {
            auto buf = std::make_unique<uint8_t[]>(valueLen);
            reader.MoveNext(nullptr, keyLen, buf.get(), valueLen, 1);
            auto *value = reinterpret_cast<GitObject::Data *>(buf.get());
            Env::DocAddBlob("object_data", value->data, valueLen);
        } else {
            Env::DocAddBlob("object_data", nullptr, 0);
//            On_error("sorry, but no object_data(");
        }
    }

    void AddCommit(const mygit2::git_commit& commit) {
        Env::DocGroup commit_obj("commit");
        char oid_buffer[GIT_OID_HEXSZ + 1];
        oid_buffer[GIT_OID_HEXSZ] = '\0';
        Env::DocAddText("raw_header", commit.raw_header);
        Env::DocAddText("raw_message", commit.raw_message);
        git_oid_fmt(oid_buffer, &commit.tree_id);
        Env::DocAddText("tree_oid", oid_buffer);
        Env::DocAddText("author_name", commit.author->name);
        Env::DocAddText("author_email", commit.author->email);
        Env::DocAddText("committer_name", commit.committer->name);
        Env::DocAddText("committer_email", commit.committer->email);
    }

    void AddTree(const mygit2::git_tree& tree) {
        Env::DocGroup tree_obj("tree");
        Env::DocAddNum("entries_num", static_cast<uint64_t>(tree.entries.size));
        char oid_buffer[GIT_OID_HEXSZ + 1];
        oid_buffer[GIT_OID_HEXSZ] = '\0';
        Env::DocArray entries("entries");
        for (size_t i = 0; i < tree.entries.size; ++i) {
            Env::DocGroup entry("");
            Env::DocAddText("filename", tree.entries.ptr[i].filename);
            git_oid_fmt(oid_buffer, tree.entries.ptr[i].oid);
            Env::DocAddNum("attributes", static_cast<uint32_t>(tree.entries.ptr[i].attr));
            Env::DocAddText("oid", oid_buffer);
        }
    }

    void On_action_get_commit(const ContractID &cid) {
        using GitRemoteBeam::RepoInfo;
        using GitRemoteBeam::GitObject;
        using GitRemoteBeam::git_oid;
        RepoInfo::ID repo_id;
        git_oid hash;
        uint32_t data_size;
        Env::DocGet("repo_id", repo_id);
        Env::DocGetBlob("obj_id", &hash, sizeof(hash));
        Env::DocGet("data_size", data_size);
        DataKey key { .m_KeyInContract = {repo_id, hash} };
        key.m_Prefix.m_Cid = cid;
        uint32_t valueLen = 0, keyLen = 0;
        Env::VarReader reader(key, key);
        if (reader.MoveNext(nullptr, keyLen, nullptr, valueLen, 0)) {
            auto buf = std::make_unique<uint8_t[]>(valueLen);
            reader.MoveNext(nullptr, keyLen, buf.get(), valueLen, 1);
            auto *value = reinterpret_cast<GitObject::Data *>(buf.get());
            mygit2::git_commit commit;
            commit_parse(&commit, value->data, valueLen, 0); // Fast parse
            AddCommit(commit);
            Env::DocAddBlob("object_data", value->data, valueLen);
        } else {
            Env::DocAddBlob("object_data", nullptr, 0);
//            On_error("sorry, but no object_data(");
        }
    }

    void On_action_get_tree(const ContractID &cid) {
        using GitRemoteBeam::RepoInfo;
        using GitRemoteBeam::GitObject;
        using GitRemoteBeam::git_oid;
        RepoInfo::ID repo_id;
        git_oid hash;
        uint32_t data_size;
        Env::DocGet("repo_id", repo_id);
        Env::DocGetBlob("obj_id", &hash, sizeof(hash));
        Env::DocGet("data_size", data_size);
        DataKey key { .m_KeyInContract = {repo_id, hash} };
        key.m_Prefix.m_Cid = cid;
        uint32_t valueLen = 0, keyLen = 0;
        Env::VarReader reader(key, key);
        if (reader.MoveNext(nullptr, keyLen, nullptr, valueLen, 0)) {
            auto buf = std::make_unique<uint8_t[]>(valueLen);
            reader.MoveNext(nullptr, keyLen, buf.get(), valueLen, 1);
            auto *value = reinterpret_cast<GitObject::Data *>(buf.get());
            mygit2::git_tree tree;
            tree_parse(&tree, value->data, valueLen);
            Env::DocAddBlob("object_data", value->data, valueLen);
            AddTree(tree);
        } else {
            On_error("No data for tree");
        }
    }

    void GetObjects(const ContractID& cid, GitRemoteBeam::GitObject::Meta::Type type) {
        using GitRemoteBeam::RepoInfo;
        using GitRemoteBeam::GitObject;
        auto[start, end, key] = PrepareGetObject(cid);
        GitObject::Meta value;
        char oid_buffer[GIT_OID_HEXSZ + 1];
        oid_buffer[GIT_OID_HEXSZ] = '\0';
        Env::DocArray objects_array("objects");
        for (Env::VarReader reader(start, end); reader.MoveNext_T(key, value);) {
            if (value.type == type) {
                Env::DocGroup obj("");
                Env::DocAddBlob_T("object_hash", value.hash);
                Env::DocAddNum("object_type", static_cast<uint32_t>(value.type));
                Env::DocAddNum("object_size", value.data_size);
                // Leave here, if we need to return already objects
//                DataKey data_key { .m_KeyInContract = { Utils::FromBE(key.m_KeyInContract.repo_id), value.hash } };
//                data_key.m_Prefix.m_Cid = cid;
//                uint32_t valueLen = 0, keyLen = 0;
//                Env::VarReader data_reader(data_key, data_key);
//                if (data_reader.MoveNext(nullptr, keyLen, nullptr, valueLen, 0)) {
//                    auto buf = std::make_unique<uint8_t[]>(valueLen);
//                    data_reader.MoveNext(nullptr, keyLen, buf.get(), valueLen, 1);
//                    auto *data_value = reinterpret_cast<GitObject::Data *>(buf.get());
//                    Env::DocAddBlob("object_data", data_value->data, valueLen);
//
//                    if (type == GitObject::Meta::GIT_OBJECT_COMMIT) {
//                        mygit2::git_commit commit;
//                        commit_parse(&commit, data_value->data, valueLen, 0); // Fast parse
//                        AddCommit(commit);
//                    } else if (type == GitObject::Meta::GIT_OBJECT_TREE) {
//                        mygit2::git_tree tree;
//                        tree_parse(&tree, data_value->data, valueLen);
//                        AddTree(tree);
//                    }
//                }
            }
        }
    }

    void On_action_get_commits(const ContractID& cid) {
        GetObjects(cid, GitRemoteBeam::GitObject::Meta::GIT_OBJECT_COMMIT);
    }

    void On_action_get_trees(const ContractID& cid) {
        GetObjects(cid, GitRemoteBeam::GitObject::Meta::GIT_OBJECT_TREE);
    }
}

BEAM_EXPORT void Method_0() {
    Env::DocGroup root("");
    {
        Env::DocGroup gr("roles");
        {
            Env::DocGroup grRole("manager");
            {
                Env::DocGroup grMethod("create_contract");
            }
            {
                Env::DocGroup grMethod("destroy_contract");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup grMethod("view_contracts");
            }
            {
                Env::DocGroup grMethod("view_contract_params");
                Env::DocAddText("cid", "ContractID");
            }
        }
        {
            Env::DocGroup grRole("user");
            {
                Env::DocGroup grMethod("create_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
            }
            {
                Env::DocGroup grMethod("my_repos");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup grMethod("all_repos");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup grMethod("delete_repo");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup grMethod("add_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
            }
            {
                Env::DocGroup grMethod("remove_user_params");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("user", "User PubKey");
            }
            {
                Env::DocGroup grMethod("push_objects");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("data", "Push objects");
                Env::DocAddText("ref", "Objects ref");
                Env::DocAddText("ref_target", "Objects ref target");
            }
            {
                Env::DocGroup grMethod("list_refs");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup grMethod("get_key");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup grMethod("repo_id_by_name");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_name", "Name of repo");
            }
            {
                Env::DocGroup grMethod("repo_get_data");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
                Env::DocAddText("data_size", "Size of data");
            }
            {
                Env::DocGroup grMethod("repo_get_meta");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup grMethod("repo_get_commit");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
                Env::DocAddText("data_size", "Size of data");
            }
            {
                Env::DocGroup grMethod("repo_get_tree");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
                Env::DocAddText("obj_id", "Object hash");
                Env::DocAddText("data_size", "Size of data");
            }
            {
                Env::DocGroup grMethod("list_commits");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
            {
                Env::DocGroup grMethod("list_trees");
                Env::DocAddText("cid", "ContractID");
                Env::DocAddText("repo_id", "Repo ID");
            }
        }
    }
}

BEAM_EXPORT void Method_1() {
    Env::DocGroup root("");
    const Actions_map_t VALID_USER_ACTIONS = {
            {"create_repo",        On_action_create_repo},
            {"my_repos",           On_action_my_repos},
            {"all_repos",          On_action_all_repos},
            {"delete_repo",        On_action_delete_repo},
            {"add_user_params",    On_action_add_user_params},
            {"remove_user_params", On_action_remove_user_params},
            {"push_objects",       On_action_push_objects},
            {"list_refs",          On_action_list_refs},
            {"get_key",            On_action_user_get_key},
            {"repo_id_by_name",    On_action_user_get_repo},
            {"repo_get_data",      On_action_get_repo_data},
            {"repo_get_meta",      On_action_get_repo_meta},
            {"repo_get_commit",    On_action_get_commit},
            {"repo_get_tree",      On_action_get_tree},
            {"list_commits",       On_action_get_commits},
            {"list_trees",         On_action_get_trees}
    };

    const Actions_map_t VALID_MANAGER_ACTIONS = {
            {"create_contract",      On_action_create_contract},
            {"destroy_contract",     On_action_destroy_contract},
            {"view_contracts",       On_action_view_contracts},
            {"view_contract_params", On_action_view_contract_params},
    };

    /* Add your new role's actions here */

    const Roles_map_t VALID_ROLES = {
            {"user",    VALID_USER_ACTIONS},
            {"manager", VALID_MANAGER_ACTIONS},
            /* Add your new role here */
    };

    char action[ACTION_BUF_SIZE], role[ROLE_BUF_SIZE];

    if (!Env::DocGetText("role", role, sizeof(role))) {
        return On_error("Role not specified");
    }

    auto it_role = find_if_contains(role, VALID_ROLES);

    if (it_role == VALID_ROLES.end()) {
        return On_error("Invalid role");
    }

    if (!Env::DocGetText("action", action, sizeof(action))) {
        return On_error("Action not specified");
    }

    auto it_action = find_if_contains(action, it_role->second);

    if (it_action != it_role->second.end()) {
        ContractID cid;
        Env::DocGet("cid", cid);
        it_action->second(cid);
    } else {
        return On_error("Invalid action");
    }
}
