#pragma once

#include <cstddef>
#include "Shaders/common.h"

namespace git_remote_beam {
enum Tag : uint8_t {
  kRepo,
  kObjects,
  kRefs,
  kOrganization,
  kProject,
  kOrganizationMember,
  kProjectMember,
  kProjectRepo,
};
constexpr Tag kAllTags[] = {kRepo, kObjects, kRefs, kOrganization};

enum Permissions : uint8_t {
  kDeleteRepo = 0b0001,
  kAddUser = 0b0010,
  kRemoveUser = 0b0100,
  kPush = 0b1000,
  kAllPermissions = kDeleteRepo | kAddUser | kRemoveUser | kPush,
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
    Tag tag;
    Id repo_id;
    BaseKey(Tag t, RepoInfo::Id id)
        : tag(t),
          repo_id(Utils::FromBE(id)) {}  // swap bytes
  };
  struct Key : BaseKey {
    explicit Key(RepoInfo::Id id) : BaseKey(kRepo, id) {}
    Key() : Key(0) {}
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
          : RepoInfo::BaseKey(kObjects, rid), obj_id(oid) {}
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
        : RepoInfo::BaseKey(kRefs, rid), name_hash(GetNameHash(name, len)) {}

    Key() : RepoInfo::BaseKey(kRefs, 0) {}
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
    Key(const PubKey& u, RepoInfo::Id id) : user(u), repo_id(id) {}
  };
};

struct UserInfo {
  uint8_t permissions;
};

struct ContractState {
  uint64_t last_repo_id;
};

struct Organization {
  using Id = uint64_t;
  struct Key {
    Tag tag = Tag::kOrganization;
    Id id;
  };
  enum Permission : uint8_t {
    kAddProject =     0b000001,
    kAddMember =      0b000010,
    kRemoveProject =  0b000100,
    kRemoveMember =   0b001000,
    kModifyMember =   0b010000,
    kModifyProject =  0b100000,
    kAll = kAddProject | kAddMember | kRemoveProject | kRemoveMember |
      kModifyProject | kModifyMember,
  };
  PubKey creator;
  size_t name_len;
  char name[];
  //name of variable length
  static const size_t kMaxNameLen = 256;
};

struct Project {
  using Id = uint64_t;
  struct Key {
    Tag tag = Tag::kProject;
    Id id;
  };
  enum Permission : uint8_t {
    kAddRepo =      0b000001,
    kAddMember =    0b000010,
    kRemoveRepo =   0b000100,
    kRemoveMember = 0b001000,
    kModifyMember = 0b010000,
    kModifyRepo =   0b100000,
    kAll = kAddRepo | kAddMember | kRemoveRepo | kRemoveMember |
      kModifyRepo | kModifyMember,
  };
  Organization::Id organization_id;
  PubKey creator;
  size_t name_len;
  char name[];
  // name of variable length
  static const size_t kMaxNameLen = 256;
};

struct OrganizationMember {
  struct Key {
    Tag tag = Tag::kOrganizationMember;
    Organization::Id organization_id;
    PubKey member_id;
  };
  uint8_t permissions;
};

struct ProjectMember {
  struct Key {
    Tag tag = Tag::kProjectMember;
    Project::Id project_id;
    PubKey member_id;
  };
  uint8_t permissions;
};

struct ProjectRepo {
  struct Key {
    Tag tag = Tag::kProjectRepo;
    Project::Id project_id;
    RepoInfo::Id repo_id;
  };
};

namespace method {

struct Initial {
  static const uint32_t kMethod = 0;
};

struct CreateRepo {
  static const uint32_t kMethod = 2;
  PubKey repo_owner;
  size_t repo_name_length;
  char repo_name[];
};

struct DeleteRepo {
  static const uint32_t kMethod = 3;
  uint64_t repo_id;
  PubKey user;
};

struct AddUser {
  static const uint32_t kMethod = 4;
  uint64_t repo_id;
  PubKey initiator;
  PubKey user;
  uint8_t permissions;
};

struct RemoveUser {
  static const uint32_t kMethod = 5;
  uint64_t repo_id;
  PubKey user;
  PubKey initiator;
};

struct PushObjects {
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

struct PushRefs {
  static const uint32_t kMethod = 7;
  uint64_t repo_id;
  PubKey user;
  RefsInfo refs_info;
};

struct CreateProject {
  static const uint32_t kMethod = 8;
  Organization::Id organization_id;
  PubKey creator;
  size_t name_len;
  char name[];
  // followed by project name
};

struct CreateOrganization {
  static const uint32_t kMethod = 9;
  PubKey creator;
  size_t name_len;
  char name[];
  // followed by organization name
};

struct SetProjectRepo {
  static const uint32_t kMethod = 10;
  enum class Request { kAdd, kRemove } request;
  Project::Id project_id;
  RepoInfo::Id repo_id;
  PubKey caller;
};

struct SetOrganizationProject {
  static const uint32_t kMethod = 11;
  enum class Request { kAdd, kRemove } request;
  Organization::Id organization_id;
  Project::Id project_id;
  PubKey caller;
};

struct SetProjectMember {
  static const uint32_t kMethod = 12;
  enum class Request { kAdd, kModify, kRemove } request;
  Project::Id project_id;
  PubKey member;
  uint8_t permissions;
  PubKey caller;
};

struct SetOrganizationMember {
  static const uint32_t kMethod = 13;
  enum class Request { kAdd, kModify, kRemove } request;
  Organization::Id organization_id;
  PubKey member;
  uint8_t permissions;
  PubKey caller;
};

#pragma pack(pop)
}  // namespace method
}  // namespace git_remote_beam
