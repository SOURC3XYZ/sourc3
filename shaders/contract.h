#pragma once

#include <cstddef>
#include "Shaders/common.h"
#include "../upgradable3/contract.h"

namespace git_remote_beam {
enum Tag : uint8_t {
    kRepo,
    kObjects,
    kRefs,
    kOrganization,
    kProject,
    kRepoMember,
    kOrganizationMember,
    kProjectMember,
};
constexpr Tag kAllTags[] = {kRepo, kObjects, kRefs, kOrganization};

#pragma pack(push, 1)

using GitOid = Opaque<20>;
using Hash256 = Opaque<32>;

Hash256 GetNameHash(const char* name, size_t len);

struct ContractState {
    uint64_t last_repo_id;
    uint64_t last_organization_id;
    uint64_t last_project_id;
};

struct Organization {
    using Id = uint64_t;
    struct Key {
        Tag tag = Tag::kOrganization;
        Id id;
        explicit Key(const Id& id) : id(id) {
        }
    };
    enum Permissions : uint8_t {
        kAddProject = 0b000001,
        kAddMember = 0b000010,
        kRemoveProject = 0b000100,
        kRemoveMember = 0b001000,
        kModifyMember = 0b010000,
        kModifyOrganization = 0b100000,
        kAll = kAddProject | kAddMember | kRemoveProject | kRemoveMember |
               kModifyOrganization | kModifyMember,
    };
    PubKey creator;
    size_t name_len;
    char name[];
    static const size_t kMaxNameLen = 256;
};

struct Project {
    using Id = uint64_t;
    struct Key {
        Tag tag = Tag::kProject;
        Id id;
        explicit Key(const Id& id) : id(id) {
        }
    };
    enum Permissions : uint8_t {
        kAddRepo = 0b000001,
        kAddMember = 0b000010,
        kRemoveRepo = 0b000100,
        kRemoveMember = 0b001000,
        kModifyMember = 0b010000,
        kModifyProject = 0b100000,
        kAll = kAddRepo | kAddMember | kRemoveRepo | kRemoveMember |
               kModifyProject | kModifyMember,
    };
    Organization::Id organization_id;
    PubKey creator;
    size_t name_len;
    char name[];
    static const size_t kMaxNameLen = 256;
};

struct Repo {
    using Id = uint64_t;  // big-endinan

    enum Permissions : uint8_t {
        kModifyRepo = 0b00001,
        kAddMember = 0b00010,
        kRemoveMember = 0b00100,
        kPush = 0b01000,
        kModifyMember = 0b10000,
        kAll = kModifyRepo | kAddMember | kRemoveMember | kPush | kModifyMember,
    };

    static constexpr size_t kMaxNameSize = 256;

    struct NameKey {
        PubKey owner;
        Hash256 name_hash;
        NameKey(const PubKey& o, const Hash256& h) : owner(o) {
            Env::Memcpy(&name_hash, &h, sizeof(name_hash));
        }
    };
    struct BaseKey {
        Tag tag;
        Id repo_id;
        BaseKey(Tag t, Repo::Id id) : tag(t), repo_id(Utils::FromBE(id)) {
        }  // swap bytes
    };
    struct Key : BaseKey {
        explicit Key(Repo::Id id) : BaseKey(kRepo, id) {
        }
        Key() : Key(0) {
        }
    };

    Project::Id project_id;
    Hash256 name_hash;
    Id repo_id;
    size_t cur_objs_number;
    PubKey owner;
    size_t name_len;
    char name[];
};

template <Tag TG, class T>
struct Members {
    struct Key {
        Tag tag = TG;
        PubKey user;
        typename T::Id id;
        Key(const PubKey& u, typename T::Id id) : user(u), id(id) {
        }
    };
};

struct GitObject {
    using Id = uint64_t;

    struct Meta {
        struct Key : Repo::BaseKey {
            Id obj_id;
            Key(Repo::Id rid, const Id& oid)
                : Repo::BaseKey(kObjects, rid), obj_id(oid) {
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
        struct Key : Repo::BaseKey {
            GitOid hash;
            Key(Repo::Id rid, const GitOid& oid)
                : Repo::BaseKey(kObjects, rid) {
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
    struct Key : Repo::BaseKey {
        Hash256 name_hash;
        Key(Repo::Id rid, const Hash256& nh)
            : Repo::BaseKey(kRefs, rid), name_hash(nh) {
            Env::Memcpy(&name_hash, &nh, sizeof(name_hash));
        }

        Key(Repo::Id rid, const char* name, size_t len)
            : Repo::BaseKey(kRefs, rid), name_hash(GetNameHash(name, len)) {
        }

        Key() : Repo::BaseKey(kRefs, 0) {
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

struct UserInfo {
    uint8_t permissions;
};

namespace method {

struct Initial {
    static const uint32_t kMethod = 0;
};

struct PushObjects {
    static const uint32_t kMethod = 3;
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

struct PushRefs {
    static const uint32_t kMethod = 4;
    uint64_t repo_id;
    PubKey user;
    RefsInfo refs_info;
};

struct CreateOrganization {
    static const uint32_t kMethod = 5;
    PubKey caller;
    size_t name_len;
    char name[];
};

struct ModifyOrganization {
    static const uint32_t kMethod = 6;
    PubKey caller;
    Organization::Id id;
    size_t name_len;
    char name[];
};

struct RemoveOrganization {
    static const uint32_t kMethod = 7;
    PubKey caller;
    Organization::Id id;
};

struct CreateRepo {
    static const uint32_t kMethod = 8;
    Project::Id project_id;
    PubKey caller;
    size_t name_len;
    char name[];
};

struct ModifyRepo {
    static const uint32_t kMethod = 9;
    Repo::Id repo_id;
    PubKey caller;
    size_t name_len;
    char name[];
};

struct RemoveRepo {
    static const uint32_t kMethod = 10;
    PubKey caller;
    Repo::Id repo_id;
};

struct CreateProject {
    static const uint32_t kMethod = 11;
    Organization::Id organization_id;
    PubKey caller;
    size_t name_len;
    char name[];
};

struct ModifyProject {
    static const uint32_t kMethod = 12;
    Organization::Id organization_id;
    Project::Id project_id;
    PubKey caller;
    size_t name_len;
    char name[];
};

struct RemoveProject {
    static const uint32_t kMethod = 13;
    Project::Id project_id;
    PubKey caller;
};

struct AddRepoMember {
    static const uint32_t kMethod = 14;
    Repo::Id repo_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct ModifyRepoMember {
    static const uint32_t kMethod = 15;
    Repo::Id repo_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct RemoveRepoMember {
    static const uint32_t kMethod = 16;
    Repo::Id repo_id;
    PubKey member;
    PubKey caller;
};

struct AddProjectMember {
    static const uint32_t kMethod = 17;
    Project::Id project_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct ModifyProjectMember {
    static const uint32_t kMethod = 18;
    Project::Id project_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct RemoveProjectMember {
    static const uint32_t kMethod = 19;
    Project::Id project_id;
    PubKey member;
    PubKey caller;
};

struct AddOrganizationMember {
    static const uint32_t kMethod = 20;
    Organization::Id organization_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct ModifyOrganizationMember {
    static const uint32_t kMethod = 21;
    Organization::Id organization_id;
    PubKey member;
    uint8_t permissions;
    PubKey caller;
};

struct RemoveOrganizationMember {
    static const uint32_t kMethod = 22;
    Organization::Id organization_id;
    PubKey member;
    PubKey caller;
};

#pragma pack(pop)
}  // namespace method
}  // namespace git_remote_beam
