#pragma once

#include "git_utils.h"
#include "utils.h"
#include <vector>
#include <set>
#include <algorithm>

//struct git_odb_object;

namespace pit
{
    // structs for serialization
#pragma pack(push, 1)
    struct GitObject
    {
        int8_t type;
        git_oid hash;
        uint32_t data_size;
        // followed by data
    };

    struct ObjectsInfo
    {
        uint32_t objects_number;
        // followed by data
    };
#pragma pack(pop)

    struct Object
    {
        git_oid         oid;
        git_object_t    type;
        git_odb_object* object;

        std::string     name;
        std::string     fullPath;
        bool            selected = false;

        Object(const git_oid& o, git_object_t t, git_odb_object* obj);
        Object(const Object& other);
        Object& operator=(const Object& other);
        Object(Object&& other) noexcept;
        Object& operator=(Object&& other) noexcept;
        ~Object() noexcept;

        std::string GetDataString() const;
        const uint8_t* GetData() const;
        size_t GetSize() const;
    };

    struct Refs
    {
        std::string localRef;
        std::string remoteRef;
    };

    struct Ref
    {
        std::string name;
        git_oid     target;
    };

    class ObjectCollector : public GitRepoAccessor
    {
    public:
        using GitRepoAccessor::GitRepoAccessor;
        void Traverse(const std::vector<Refs> refs, const std::vector<git_oid>& hidden);
        template<typename Func>
        void Serialize(Func func) 
        {
            // TODO: replace code below with calling serializer
            constexpr size_t SIZE_THRESHOLD = 500000;
            while (true)
            {
                uint32_t count = 0;
                size_t size = 0;
                std::vector<size_t> indecies;
                for (size_t i = 0; i < m_objects.size(); ++i)
                {
                    auto& obj = m_objects[i];
                    if (obj.selected)
                        continue;

                    auto s = sizeof(GitObject) + obj.GetSize();
                    if (size + s <= SIZE_THRESHOLD)
                    {
                        size += s;
                        ++count;
                        indecies.emplace_back(i);
                        obj.selected = true;
                    }
                    if (size == SIZE_THRESHOLD)
                        break;
                }
                if (count == 0)
                    break;

                // serializing
                ByteBuffer buf;
                buf.resize(size + sizeof(ObjectsInfo)); // objects count size
                auto* p = reinterpret_cast<ObjectsInfo*>(buf.data());
                p->objects_number = count;
                auto* serObj = reinterpret_cast<GitObject*>(p + 1);
                for (size_t i = 0; i < count; ++i)
                {
                    const auto& obj = m_objects[indecies[i]];
                    serObj->data_size = static_cast<uint32_t>(obj.GetSize());
                    serObj->type = static_cast<int8_t>(obj.type);
                    git_oid_cpy(&serObj->hash, &obj.oid);
                    auto* data = reinterpret_cast<uint8_t*>(serObj + 1);
                    std::copy_n(obj.GetData(), obj.GetSize(), data);
                    serObj = reinterpret_cast<GitObject*>(data + obj.GetSize());
                }

                func(buf);
            }
        }
    private:
        void TraverseTree(const git_tree* tree);
        std::string Join(const std::vector<std::string>& path, const std::string& name);
        Object& CollectObject(const git_oid& oid);
        void ThrowIfError(int res, std::string_view sv);
    public:
        std::set<git_oid>           m_set;
        std::vector<Object>         m_objects;
        std::vector<Ref>            m_refs;
        size_t                      m_maxSize = 0;
        size_t                      m_totalSize = 0;
        std::vector<std::string>    m_path;
    };
}