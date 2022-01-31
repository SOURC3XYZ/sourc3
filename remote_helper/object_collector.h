#pragma once

#include "git_utils.h"
#include <vector>
#include <set>

//struct git_odb_object;

namespace pit
{
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