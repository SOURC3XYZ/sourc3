#pragma once

#include <cstddef>
#include "Shaders/common.h"

namespace git_remote_beam {
enum Operations : uint8_t {
    kRepo,
    kObjects,
    kRefs,
};
constexpr Operations kAllOperations[] = {kRepo, kObjects, kRefs};

enum Permissions : uint8_t {
    kDeleteRepo = 0b0001,
    kAddUser = 0b0010,
    kRemoveUser = 0b0100,
    kPush = 0b1000,
    kAll = kDeleteRepo | kAddUser | kRemoveUser | kPush,
};

#pragma pack(push, 1)

using GitOid = Opaque<20>;
using Hash256 = Opaque<32>;

Hash256 GetNameHash(const char* name, size_t len);

struct RepoInfo {
    using Id = uint64_t;  // big-endinan

    static constexpr size_t kMaxNameSize = 256;

    struct NameKey {
        PubKey owner;
        Hash256 name_hash;
        NameKey(const PubKey& o, const Hash256& h) : owner(o) {
            Env::Memcpy(&name_hash, &h, sizeof(name_hash));
        }
    };
    struct BaseKey {
        Operations tag;
        Id repo_id;
        BaseKey(Operations t, RepoInfo::Id id)
            : tag(t), repo_id(Utils::FromBE(id)) {
        }  // swap bytes
    };
    struct Key : BaseKey {
        explicit Key(RepoInfo::Id id) : BaseKey(kRepo, id) {
        }
        Key() : Key(0) {
        }
    };

    Hash256 name_hash;
    Id repo_id;
    size_t cur_objs_number;
    PubKey owner;
    size_t name_length;
    char name[];
};

struct GitObject {
    using Id = uint64_t;

    struct Meta {
        struct Key : RepoInfo::BaseKey {
            Id obj_id;
            Key(RepoInfo::Id rid, const Id& oid)
                : RepoInfo::BaseKey(kObjects, rid), obj_id(oid) {
            }
        };
        enum Type : int8_t {
            // excerpt from libgit2
            kGitObjectCommit = 1, /**< A commit object. */
            kGitObjectTree = 2,   /**< A tree (directory listing) object. */
            kGitObjectBlob = 3,   /**< A file revision object. */
            kGitObjectTag = 4,    /**< An annotated tag object. */
        } type;
        Id id;
        GitOid hash;
        uint32_t data_size;
    } meta;

    struct Data {
        struct Key : RepoInfo::BaseKey {
            GitOid hash;
            Key(RepoInfo::Id rid, const GitOid& oid)
                : RepoInfo::BaseKey(kObjects, rid) {
                Env::Memcpy(&hash, &oid, sizeof(oid));
            }
        };

        char data[];
    } data;

    /*
    GitObject& operator=(const GitObject& from)
    {
            this->hash = from.hash;
            this->data_size = from.data_size;
            this->type = from.type;
            Env::Memcpy(this->data, from.data, from.data_size);
            return *this;
    }
    */
};

struct GitRef {
    static constexpr size_t kMaxNameSize = 256;
    struct Key : RepoInfo::BaseKey {
        Hash256 name_hash;
        Key(RepoInfo::Id rid, const Hash256& nh)
            : RepoInfo::BaseKey(kRefs, rid), name_hash(nh) {
            Env::Memcpy(&name_hash, &nh, sizeof(name_hash));
        }

        Key(RepoInfo::Id rid, const char* name, size_t len)
            : RepoInfo::BaseKey(kRefs, rid), name_hash(GetNameHash(name, len)) {
        }

        Key() : RepoInfo::BaseKey(kRefs, 0) {
        }
    };

    GitOid commit_hash;
    size_t name_length;
    char name[];

    GitRef& operator=(const GitRef& from) {
        this->commit_hash = from.commit_hash;
        Env::Memcpy(this->name, from.name, from.name_length);
        return *this;
    }
};

struct ObjectsInfo {
    size_t objects_number;
    // GitObject objects[];
    //  data
};

struct RefsInfo {
    size_t refs_number;
    GitRef refs[];
};

struct RepoUser {
    struct Key {
        PubKey user;
        RepoInfo::Id repo_id;
        Key(const PubKey& u, RepoInfo::Id id) : user(u), repo_id(id) {
        }
    };
};

struct UserInfo {
    uint8_t permissions;
};

struct ContractState {
    uint64_t last_repo_id;
};

struct InitialParams {
    static const uint32_t kMethod = 0;
};

struct CreateRepoParams {
    static const uint32_t kMethod = 2;
    PubKey repo_owner;
    size_t repo_name_length;
    char repo_name[];
};

struct DeleteRepoParams {
    static const uint32_t kMethod = 3;
    uint64_t repo_id;
    PubKey user;
};

struct AddUserParams {
    static const uint32_t kMethod = 4;
    uint64_t repo_id;
    PubKey initiator;
    PubKey user;
    uint8_t permissions;
};

struct RemoveUserParams {
    static const uint32_t kMethod = 5;
    uint64_t repo_id;
    PubKey user;
    PubKey initiator;
};

struct PushObjectsParams {
    static const uint32_t kMethod = 6;
    struct PackedObject {
        int8_t type;
        GitOid hash;
        uint32_t data_size;
        // followed by data
    };
    uint64_t repo_id;
    PubKey user;
    size_t objects_number;
    // packed objects after this
};

struct PushRefsParams {
    static const uint32_t kMethod = 7;
    uint64_t repo_id;
    PubKey user;
    RefsInfo refs_info;
};

#pragma pack(pop)
}  // namespace git_remote_beam
