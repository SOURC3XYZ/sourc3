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

#include "git_utils.h"
#include "utils.h"
#include <vector>
#include <set>
#include <algorithm>
#include <stdexcept>

// struct git_odb_object;

namespace sourc3 {
// structs for serialization
#pragma pack(push, 1)
struct GitObject {
    int8_t type;
    git_oid hash;
    uint32_t data_size;
    // followed by data

    bool IsValidObjectType() const {
        auto t = type & 0x7f;  // clear first bit
        return t >= GIT_OBJECT_COMMIT && t <= GIT_OBJECT_TAG;
    }

    git_object_t GetObjectType() const {
        if (IsValidObjectType()) {
            return static_cast<git_object_t>(type & 0x7f);
        }

        throw std::runtime_error("Invalid object type");
    }

    bool IsIPFSObject() const {
        return (type & 0x80) != 0 && IsValidObjectType();
    }
};

struct ObjectsInfo {
    uint32_t objects_number;
    // followed by data
};
#pragma pack(pop)

struct ObjectInfo {
    git_oid oid;
    git_object_t type;
    git_odb_object* object;

    std::string name;
    std::string fullPath;
    bool selected = false;
    ByteBuffer ipfsHash;

    ObjectInfo(const git_oid& o, git_object_t t, git_odb_object* obj);
    ObjectInfo(const ObjectInfo& other);
    ObjectInfo& operator=(const ObjectInfo& other);
    ObjectInfo(ObjectInfo&& other) noexcept;
    ObjectInfo& operator=(ObjectInfo&& other) noexcept;
    ~ObjectInfo() noexcept;

    int8_t GetSerializeType() const;
    std::string GetDataString() const;
    const uint8_t* GetData() const;
    size_t GetSize() const;
    bool IsIPFSObject() const;
};

struct Refs {
    std::string localRef;
    std::string remoteRef;
};

struct Ref {
    std::string name;
    std::string ipfs_hash;
    git_oid target;
};

class ObjectCollector : public git::RepoAccessor {
public:
    using git::RepoAccessor::RepoAccessor;
    void Traverse(const std::vector<Refs>& refs,
                  const std::vector<git_oid>& hidden);
    template <typename Func>
    void Serialize(Func func) {
        // TODO: replace code below with calling serializer
        constexpr size_t kSizeThreshold = 100000;
        size_t done = 0;

        while (true) {
            uint32_t count = 0;
            size_t serialized_size = 0;
            std::vector<size_t> indecies;
            for (size_t i = 0; i < m_objects.size(); ++i) {
                auto& obj = m_objects[i];
                if (obj.selected) {
                    continue;
                }

                auto obj_size = obj.GetSize();
                auto s = sizeof(GitObject) + obj_size;
                if (serialized_size + s <= kSizeThreshold) {
                    serialized_size += s;
                    ++count;
                    indecies.emplace_back(i);
                    obj.selected = true;
                }
                if (serialized_size == kSizeThreshold) {
                    break;
                }
            }

            ByteBuffer buf;
            if (count == 0) {
                func(buf, done);
                break;
            }

            // serializing
            buf.resize(serialized_size +
                       sizeof(ObjectsInfo));  // objects count size
            auto* p = reinterpret_cast<ObjectsInfo*>(buf.data());
            p->objects_number = count;
            auto* ser_obj = reinterpret_cast<GitObject*>(p + 1);
            for (size_t i = 0; i < count; ++i) {
                const auto& obj = m_objects[indecies[i]];
                ser_obj->data_size = static_cast<uint32_t>(obj.GetSize());
                ser_obj->type = obj.GetSerializeType();
                git_oid_cpy(&ser_obj->hash, &obj.oid);
                auto* data = reinterpret_cast<uint8_t*>(ser_obj + 1);
                std::copy_n(obj.GetData(), obj.GetSize(), data);
                ser_obj = reinterpret_cast<GitObject*>(data + obj.GetSize());
            }

            done += count;
            if (func(buf, done) == false) {
                break;
            }
        }
    }

private:
    void TraverseTree(const git_tree* tree);
    std::string Join(const std::vector<std::string>& path,
                     const std::string& name);
    ObjectInfo& CollectObject(const git_oid& oid);

public:
    std::set<git_oid> m_set;
    std::vector<ObjectInfo> m_objects;
    std::vector<Ref> m_refs;
    std::vector<std::string> m_path;
};
}  // namespace sourc3
