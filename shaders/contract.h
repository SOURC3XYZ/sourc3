/*
 * Copyright 2021-2022 SOURC3 Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "Shaders/common.h"
#include "Shaders/upgradable3/contract.h"

#include <array>
#include <cstddef>

namespace sourc3 {
constexpr size_t kIpfsAddressSize = 46;

enum Tag : uint8_t {
    kRepo,
    kObjects,
    kRefs,
    kOrganization,
    kProject,
    kRepoMember,
    kOrganizationMember,
    kProjectMember,
    kUser,
    kNameToId,
};

#pragma pack(push, 1)

using IpfsAddr = std::array<char, kIpfsAddressSize + 1>;  // plus 0-term
using GitOid = std::array<uint8_t, 20>;
using Hash256 = std::array<uint8_t, 32>;

inline Hash256 GetNameHash(const char* name, size_t len) {
    Hash256 res;
    HashProcessor::Sha256 hp;
    hp.Write(name, len);
    hp >> res;
    return res;
}

struct ContractState {
    Amount faucet_balance;
    uint64_t organizations_num;
    uint64_t projects_num;
    uint64_t repos_num;
};

template <class T>
struct IdByName {
    struct Key {
        Tag tag = Tag::kNameToId;
        typename T::NameId name_id;
        explicit Key(const typename T::NameId& id) : name_id{id} {
        }
        Key() : name_id{} {
        }
    };
    typename T::Id id;
};

struct OrganizationData {
    size_t name_len;
    size_t short_title_len;
    size_t about_len;
    size_t website_len;
    size_t twitter_len;
    size_t linkedin_len;
    size_t instagram_len;
    size_t telegram_len;
    size_t discord_len;
    char data[];

    size_t GetTotalLen() const {
        return name_len + short_title_len + about_len + website_len +
               twitter_len + linkedin_len + instagram_len + telegram_len +
               discord_len;
    }

    // plus 0-term
    static const size_t kMaxNameLen = 100 + 1;
    static const size_t kMaxShortTitleLen = 50 + 1;
    static const size_t kMaxAboutLen = 1024 + 1;
    static const size_t kMaxWebsiteLen = 100 + 1;
    static const size_t kMaxSocialNickLen = 50 + 1;

    static constexpr size_t GetMaxSize() {
        return kMaxNameLen + kMaxShortTitleLen + kMaxAboutLen + kMaxWebsiteLen +
               kMaxSocialNickLen * 5;
    };
};

struct Organization {
    using Id = uint64_t;

    struct NameId {
        Hash256 org_name_hash;
    };

    struct Key {
        Tag tag = Tag::kOrganization;
        Id id;
        explicit Key(const Id& id) : id{id} {
        }
        Key() : id{} {
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
    IpfsAddr logo_addr;
    OrganizationData data;

    static const Tag kMemberTag = Tag::kOrganizationMember;
};

struct ProjectData {
    size_t name_len;
    size_t description_len;
    size_t website_len;
    size_t twitter_len;
    size_t linkedin_len;
    size_t instagram_len;
    size_t telegram_len;
    size_t discord_len;
    char data[];

    size_t GetTotalLen() const {
        return name_len + description_len + website_len + twitter_len +
               linkedin_len + instagram_len + telegram_len + discord_len;
    }

    static constexpr size_t GetMaxSize() {
        return kMaxNameLen + kMaxDescriptionLen + kMaxWebsiteLen +
               kMaxSocialNickLen * 5;
    };

    // plus 0-term
    static const size_t kMaxNameLen = 100 + 1;
    static const size_t kMaxDescriptionLen = 1024 + 1;
    static const size_t kMaxWebsiteLen = 100 + 1;
    static const size_t kMaxSocialNickLen = 50 + 1;
};

struct Project {
    using Id = uint64_t;

    struct NameId : Organization::NameId {
        Hash256 proj_name_hash;
    };
    struct Key {
        Tag tag = Tag::kProject;
        Id id;
        explicit Key(const Id& id) : id(id) {
        }
        Key() : id{} {
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
    IpfsAddr logo_addr;
    ProjectData data;

    static const Tag kMemberTag = Tag::kProjectMember;
};

struct Repo {
    using Id = uint64_t;

    enum Permissions : uint8_t {
        kModifyRepo = 0b00001,
        kAddMember = 0b00010,
        kRemoveMember = 0b00100,
        kPush = 0b01000,
        kModifyMember = 0b10000,
        kAll = kModifyRepo | kAddMember | kRemoveMember | kPush | kModifyMember,
    };

    static constexpr size_t kMaxNameSize = 100 + 1;

    struct NameId : Project::NameId {
        Hash256 repo_name_hash;
    };

    struct Key {
        Tag tag = Tag::kRepo;
        Id id;
        explicit Key(const Id& id) : id{Utils::FromBE(id)} {
        }
        Key() : id{} {
        }
    };

    Project::Id project_id;
    size_t cur_objs_number;
    PubKey owner;
    uint32_t is_private;
    size_t name_len;
    char name[];

    static const Tag kMemberTag = Tag::kRepoMember;
};

template <class T>
struct Member {
    struct Key {
        Tag tag = T::kMemberTag;
        typename T::Id id;
        PubKey user;
        Key(const PubKey& u, typename T::Id id) : user(u), id(id) {
        }
        Key() : user{}, id{} {
        }
    };
    typename T::Permissions permissions;
};

struct GitObject {
    using Id = uint64_t;

    struct Meta {
        struct Key {
            Tag tag = kObjects;
            Repo::Id repo_id;
            Id obj_id;
            Key(Repo::Id rid, const Id& oid)
                : repo_id(Utils::FromBE(rid)), obj_id(oid) {
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
        struct Key {
            Tag tag = kObjects;
            Repo::Id repo_id;
            GitOid hash;
            Key(Repo::Id rid, const GitOid& oid)
                : repo_id(Utils::FromBE(rid)), hash(oid) {
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
    struct Key {
        Tag tag = kRefs;
        Repo::Id repo_id;
        Hash256 name_hash;
        Key(Repo::Id rid, const Hash256& nh)
            : repo_id(Utils::FromBE(rid)), name_hash(nh) {
        }

        Key(Repo::Id rid, const char* name, size_t len)
            : repo_id(Utils::FromBE(rid)), name_hash(GetNameHash(name, len)) {
        }
        Key() : repo_id{}, name_hash{} {
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

struct UserData {
    size_t name_len;
    size_t nickname_len;
    size_t email_len;
    size_t description_len;
    size_t website_len;
    size_t twitter_len;
    size_t linkedin_len;
    size_t instagram_len;
    size_t telegram_len;
    size_t discord_len;
    char data[];

    size_t GetTotalLen() const {
        return name_len + nickname_len + email_len + description_len +
               website_len + twitter_len + linkedin_len + instagram_len +
               telegram_len + discord_len;
    }

    static const size_t kMaxNameLen = 100 + 1;
    static const size_t kMaxEmailLen = 320 + 1;
    static const size_t kMaxDescriptionLen = 1024 + 1;
    static const size_t kMaxWebsiteLen = 100 + 1;
    static const size_t kMaxSocialNickLen = 50 + 1;

    static constexpr size_t GetMaxSize() {
        return kMaxNameLen + kMaxDescriptionLen + kMaxWebsiteLen +
               kMaxSocialNickLen * 6 + kMaxEmailLen;
    };
};

struct User {
    using Id = PubKey;
    struct Key {
        explicit Key(PubKey id) : id(id) {
        }

        Tag tag = Tag::kUser;
        Id id;
    };
    IpfsAddr avatar_addr;
    UserData data;
};

namespace method {

struct Initial {
    static const uint32_t kMethod = 0;
    Upgradable3::Settings m_Stgs;
};

struct PushObjects {
    static const uint32_t kMethod = 3;
    struct PackedObject {
        int8_t type;
        GitOid hash;
        uint32_t data_size;
        // followed by data
    };
    Repo::NameId repo_name_id;
    PubKey user;
    size_t objects_number;
    // packed objects after this
};

struct PushRefs {
    static const uint32_t kMethod = 4;
    Repo::NameId repo_name_id;
    PubKey user;
    RefsInfo refs_info;
};

struct CreateOrganization {
    static const uint32_t kMethod = 5;
    PubKey caller;
    IpfsAddr logo_addr;
    OrganizationData data;
};

struct ModifyOrganization {
    static const uint32_t kMethod = 6;
    PubKey caller;
    Organization::NameId organization_name_id;
    IpfsAddr logo_addr;
    OrganizationData data;
};

struct RemoveOrganization {
    static const uint32_t kMethod = 7;
    PubKey caller;
    Organization::NameId id;
};

struct CreateRepo {
    static const uint32_t kMethod = 8;
    Project::NameId project_name_id;
    PubKey caller;
    uint32_t is_private;
    size_t name_len;
    char name[];
};

struct ModifyRepo {
    static const uint32_t kMethod = 9;
    Repo::NameId repo_name_id;
    PubKey caller;
    uint32_t is_private;
    size_t name_len;
    char name[];
};

struct RemoveRepo {
    static const uint32_t kMethod = 10;
    PubKey caller;
    Repo::NameId repo_name_id;
};

struct CreateProject {
    static const uint32_t kMethod = 11;
    Organization::NameId organization_name_id;
    PubKey caller;
    IpfsAddr logo_addr;
    ProjectData data;
};

struct ModifyProject {
    static const uint32_t kMethod = 12;
    Project::NameId project_name_id;
    PubKey caller;
    IpfsAddr logo_addr;
    ProjectData data;
};

struct RemoveProject {
    static const uint32_t kMethod = 13;
    Project::Id project_id;
    PubKey caller;
};

struct AddRepoMember {
    static const uint32_t kMethod = 14;
    Repo::NameId repo_name_id;
    PubKey member;
    PubKey caller;
    Repo::Permissions permissions;
};

struct ModifyRepoMember {
    static const uint32_t kMethod = 15;
    Repo::NameId repo_name_id;
    PubKey member;
    Repo::Permissions permissions;
    PubKey caller;
};

struct RemoveRepoMember {
    static const uint32_t kMethod = 16;
    Repo::NameId repo_name_id;
    PubKey member;
    PubKey caller;
};

struct AddProjectMember {
    static const uint32_t kMethod = 17;
    Project::NameId project_name_id;
    PubKey member;
    Project::Permissions permissions;
    PubKey caller;
};

struct ModifyProjectMember {
    static const uint32_t kMethod = 18;
    Project::NameId project_name_id;
    PubKey member;
    Project::Permissions permissions;
    PubKey caller;
};

struct RemoveProjectMember {
    static const uint32_t kMethod = 19;
    Project::NameId project_name_id;
    PubKey member;
    PubKey caller;
};

struct AddOrganizationMember {
    static const uint32_t kMethod = 20;
    Organization::NameId organization_name_id;
    PubKey member;
    Organization::Permissions permissions;
    PubKey caller;
};

struct ModifyOrganizationMember {
    static const uint32_t kMethod = 21;
    Organization::NameId organization_name_id;
    PubKey member;
    Organization::Permissions permissions;
    PubKey caller;
};

struct RemoveOrganizationMember {
    static const uint32_t kMethod = 22;
    Organization::NameId organization_name_id;
    PubKey member;
    PubKey caller;
};

struct Deposit {
    static const uint32_t kMethod = 23;
    Amount amount;
};

struct Withdraw {
    static const uint32_t kMethod = 24;
    Amount amount;
};

struct ModifyUser {
    static const uint32_t kMethod = 25;
    PubKey id;
    uint32_t rating;
    IpfsAddr avatar_addr;
    UserData data;
};

struct MigrateRepos {
    static const uint32_t kMethod = 26;
    Repo::Id from;
    Repo::Id to;
};

#pragma pack(pop)
}  // namespace method
}  // namespace sourc3
