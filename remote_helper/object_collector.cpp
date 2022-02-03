#include "object_collector.h"
#include "utils.h"
#include <stdexcept>
#include <utility>
#include <iostream>
namespace pit
{
    /////////////////////////////////////////////////////

    Object::Object(const git_oid& o, git_object_t t, git_odb_object* obj)
        : oid(o)
        , type(t)
        , object(obj)
    {

    }

    Object::Object(const Object& other)
        : oid(other.oid)
        , type(other.type)
    {
        git_odb_object_dup(&object, other.object);
    }

    Object& Object::operator=(const Object& other)
    {
        if (this != &other)
        {
            oid = other.oid;
            type = other.type;
            git_odb_object_dup(&object, other.object);
        }
        return *this;
    }

    Object::Object(Object&& other) noexcept
        : oid(other.oid)
        , type(other.type)
        , object(std::exchange(other.object, nullptr))
    {
    }

    Object& Object::operator=(Object&& other) noexcept
    {
        if (this != &other)
        {
            oid = other.oid;
            type = other.type;
            object = std::exchange(other.object, nullptr);
        }
        return *this;
    }

    Object::~Object() noexcept
    {
        git_odb_object_free(object);
    }

    std::string Object::GetDataString() const
    {
        return ToHex(git_odb_object_data(object), git_odb_object_size(object));
    }

    const uint8_t* Object::GetData() const
    {
        return static_cast<const uint8_t*>(git_odb_object_data(object));
    }

    size_t Object::GetSize() const
    {
        return git_odb_object_size(object);
    }


    /////////////////////////////////////////////////////

    void ObjectCollector::Traverse(const std::vector<Refs> refs, const std::vector<git_oid>& hidden)
    {
        git_revwalk* walk = nullptr;
        git_revwalk_new(&walk, m_repo);
        git_revwalk_sorting(walk, GIT_SORT_TIME);
        for (const auto& h : hidden)
        {
            git_revwalk_hide(walk, &h);
        }
        for (const auto& ref : refs)
        {
            git_revwalk_push_ref(walk, ref.localRef.c_str());
            auto& r = m_refs.emplace_back();
            git_reference_name_to_id(&r.target, m_repo, ref.localRef.c_str());
            r.name = ref.remoteRef;
            std::clog << "Ref: " << to_string(r.target) << std::endl;
        }
        git_oid oid;
        while (!git_revwalk_next(&oid, walk))
        {
            // commits
            git_object* obj = nullptr;
            git_object_lookup(&obj, m_repo, &oid, GIT_OBJECT_ANY);
            std::clog << "Obj: " << to_string(oid) << std::endl;
            auto p = m_set.emplace(oid);
            if (!p.second)
            {
                continue;
            }
            
            git_odb_object* dbobj = nullptr;
            git_odb_read(&dbobj, m_odb, &oid);
            m_objects.emplace_back(oid, git_object_type(obj), dbobj);

            git_tree* tree = nullptr;
            git_commit* commit = nullptr;
            git_commit_lookup(&commit, m_repo, &oid);
            git_commit_tree(&tree, commit);

            m_set.emplace(*git_tree_id(tree));
            CollectObject(*git_tree_id(tree));
            TraverseTree(tree);
            git_commit_free(commit);
            git_tree_free(tree);
        }

        git_revwalk_free(walk);
    }

    void ObjectCollector::TraverseTree(const git_tree* tree)
    {
        for (size_t i = 0; i < git_tree_entrycount(tree); ++i)
        {
            auto* entry = git_tree_entry_byindex(tree, i);
            auto* entry_oid = git_tree_entry_id(entry);
            std::clog << "Obj: " << to_string(*entry_oid) << std::endl;
            auto p = m_set.emplace(*entry_oid);
            if (!p.second)
                continue; // already visited

            auto type = git_tree_entry_type(entry);
            switch (type)
            {
            case GIT_OBJECT_TREE:
            {
                auto& obj = CollectObject(*entry_oid);
                obj.name = git_tree_entry_name(entry);
                obj.fullPath = Join(m_path, obj.name);
                m_path.push_back(obj.name);
                git_tree* subTree = nullptr;
                git_tree_lookup(&subTree, m_repo, entry_oid);
                TraverseTree(subTree);
                m_path.pop_back();
            }   break;
            case GIT_OBJECT_BLOB:
            {
                auto& obj = CollectObject(*entry_oid);
                obj.name = git_tree_entry_name(entry);
                obj.fullPath = Join(m_path, obj.name);
            }   break;
            default:
                break;
            }
        }
    }

    std::string ObjectCollector::Join(const std::vector<std::string>& path, const std::string& name)
    {
        std::string res;
        for (const auto& p : path)
        {
            res.append(p);
            res.append("/");
        }
        res.append(name);
        return res;
    }

    Object& ObjectCollector::CollectObject(const git_oid& oid)
    {
        git_odb_object* dbobj = nullptr;
        git_odb_read(&dbobj, m_odb, &oid);

        auto objSize = git_odb_object_size(dbobj);
        auto& obj = m_objects.emplace_back(oid, git_odb_object_type(dbobj), dbobj);
        git_oid r;
        git_odb_hash(&r, git_odb_object_data(dbobj), objSize, git_odb_object_type(dbobj));

        m_maxSize = std::max(m_maxSize, objSize);
        m_totalSize += objSize;

        return obj;
    }

    void ObjectCollector::ThrowIfError(int res, std::string_view sv)
    {
        if (res < 0)
        {
            throw std::runtime_error(sv.data());
        }
    }

}
