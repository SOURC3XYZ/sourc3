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

#include "object_collector.h"
#include "utils.h"
#include <stdexcept>
#include <utility>
#include <iostream>
namespace sourc3 {
/////////////////////////////////////////////////////

ObjectInfo::ObjectInfo(const git_oid& o, git_object_t t, git_odb_object* obj)
    : oid(o), type(t), object(obj) {
}

ObjectInfo::ObjectInfo(const ObjectInfo& other)
    : oid(other.oid),
      type(other.type),
      name(other.name),
      fullPath(other.fullPath),
      selected(other.selected),
      ipfsHash(other.ipfsHash) {
    git_odb_object_dup(&object, other.object);
}

ObjectInfo& ObjectInfo::operator=(const ObjectInfo& other) {
    if (this != &other) {
        oid = other.oid;
        type = other.type;

        name = other.name;
        fullPath = other.fullPath;
        selected = other.selected;
        ipfsHash = other.ipfsHash;

        git_odb_object_dup(&object, other.object);
    }
    return *this;
}

ObjectInfo::ObjectInfo(ObjectInfo&& other) noexcept
    : oid(other.oid),
      type(other.type),
      object(std::exchange(other.object, nullptr)),
      name(std::move(other.name)),
      fullPath(std::move(other.fullPath)),
      selected(other.selected),
      ipfsHash(std::move(other.ipfsHash))

{
}

ObjectInfo& ObjectInfo::operator=(ObjectInfo&& other) noexcept {
    if (this != &other) {
        oid = other.oid;
        type = other.type;
        object = std::exchange(other.object, nullptr);
        name = std::move(other.name);
        fullPath = std::move(other.fullPath);
        selected = other.selected;
        ipfsHash = std::move(other.ipfsHash);
    }
    return *this;
}

ObjectInfo::~ObjectInfo() noexcept {
    git_odb_object_free(object);
}

std::string ObjectInfo::GetDataString() const {
    return ToHex(GetData(), GetSize());
}

int8_t ObjectInfo::GetSerializeType() const {
    if (IsIPFSObject()) {
        return static_cast<int8_t>(type) | 0x80;
    }

    return static_cast<int8_t>(type);
}

const uint8_t* ObjectInfo::GetData() const {
    if (IsIPFSObject()) {
        return ipfsHash.data();
    }

    return static_cast<const uint8_t*>(git_odb_object_data(object));
}

size_t ObjectInfo::GetSize() const {
    if (IsIPFSObject()) {
        return ipfsHash.size();
    }

    return git_odb_object_size(object);
}

bool ObjectInfo::IsIPFSObject() const {
    return !ipfsHash.empty();
}

/////////////////////////////////////////////////////

void ObjectCollector::Traverse(const std::vector<Refs>& refs,
                               const std::vector<git_oid>& hidden) {
    using namespace git;
    RevWalk walk;
    git_revwalk_new(walk.Addr(), *m_repo);
    git_revwalk_sorting(*walk, GIT_SORT_TIME);
    for (const auto& h : hidden) {
        git_revwalk_hide(*walk, &h);
    }
    for (const auto& ref : refs) {
        git_revwalk_push_ref(*walk, ref.localRef.c_str());
        auto& r = m_refs.emplace_back();
        git_reference_name_to_id(&r.target, *m_repo, ref.localRef.c_str());
        r.name = ref.remoteRef;
    }
    git_oid oid;
    while (git_revwalk_next(&oid, *walk) == 0) {
        // commits
        Object obj;
        git_object_lookup(obj.Addr(), *m_repo, &oid, GIT_OBJECT_ANY);
        auto p = m_set.emplace(oid);
        if (!p.second) {
            continue;
        }

        git_odb_object* dbobj = nullptr;
        git_odb_read(&dbobj, *m_odb, &oid);
        m_objects.emplace_back(oid, git_object_type(*obj), dbobj);

        Tree tree;
        Commit commit;
        git_commit_lookup(commit.Addr(), *m_repo, &oid);
        git_commit_tree(tree.Addr(), *commit);

        m_set.emplace(*git_tree_id(*tree));
        CollectObject(*git_tree_id(*tree));
        TraverseTree(*tree);
    }
}

void ObjectCollector::TraverseTree(const git_tree* tree) {
    for (size_t i = 0; i < git_tree_entrycount(tree); ++i) {
        auto* entry = git_tree_entry_byindex(tree, i);
        auto* entry_oid = git_tree_entry_id(entry);
        auto p = m_set.emplace(*entry_oid);
        if (!p.second) {
            continue;  // already visited
        }

        auto type = git_tree_entry_type(entry);
        switch (type) {
            case GIT_OBJECT_TREE: {
                auto& obj = CollectObject(*entry_oid);
                obj.name = git_tree_entry_name(entry);
                obj.fullPath = Join(m_path, obj.name);
                m_path.push_back(obj.name);
                git::Tree sub_tree;
                git_tree_lookup(sub_tree.Addr(), *m_repo, entry_oid);
                TraverseTree(*sub_tree);
                m_path.pop_back();
            } break;
            case GIT_OBJECT_BLOB: {
                auto& obj = CollectObject(*entry_oid);
                obj.name = git_tree_entry_name(entry);
                obj.fullPath = Join(m_path, obj.name);
            } break;
            default:
                break;
        }
    }
}

std::string ObjectCollector::Join(const std::vector<std::string>& path,
                                  const std::string& name) {
    std::string res;
    for (const auto& p : path) {
        res.append(p);
        res.append("/");
    }
    res.append(name);
    return res;
}

ObjectInfo& ObjectCollector::CollectObject(const git_oid& oid) {
    git_odb_object* dbobj = nullptr;
    git_odb_read(&dbobj, *m_odb, &oid);

    auto obj_size = git_odb_object_size(dbobj);
    auto& obj = m_objects.emplace_back(oid, git_odb_object_type(dbobj), dbobj);
    git_oid r;
    git_odb_hash(&r, git_odb_object_data(dbobj), obj_size,
                 git_odb_object_type(dbobj));

    return obj;
}
}  // namespace sourc3
