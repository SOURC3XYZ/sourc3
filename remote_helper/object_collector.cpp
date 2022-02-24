#include "object_collector.h"
#include "utils.h"
#include <stdexcept>
#include <utility>
#include <iostream>
namespace pit
{
    /////////////////////////////////////////////////////

    ObjectInfo::ObjectInfo(const git_oid& o, git_object_t t, git_odb_object* obj)
        : oid(o)
        , type(t)
        , object(obj)
    {

    }

    ObjectInfo::ObjectInfo(const ObjectInfo& other)
        : oid(other.oid)
        , type(other.type)
        , name(other.name)
        , fullPath(other.fullPath)
        , selected(other.selected)
        , ipfsHash(other.ipfsHash)
    {
        git_odb_object_dup(&object, other.object);
    }

    ObjectInfo& ObjectInfo::operator=(const ObjectInfo& other)
    {
        if (this != &other)
        {
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
        : oid(other.oid)
        , type(other.type)
        , name(std::move(other.name))
        , fullPath(std::move(other.fullPath))
        , selected(other.selected)
        , ipfsHash(std::move(other.ipfsHash))
        , object(std::exchange(other.object, nullptr))
    {
    }

    ObjectInfo& ObjectInfo::operator=(ObjectInfo&& other) noexcept
    {
        if (this != &other)
        {
            oid = other.oid;
            type = other.type;
            name = std::move(other.name);
            fullPath = std::move(other.fullPath);
            selected = other.selected;
            ipfsHash = std::move(other.ipfsHash);
            object = std::exchange(other.object, nullptr);
        }
        return *this;
    }

    ObjectInfo::~ObjectInfo() noexcept
    {
        git_odb_object_free(object);
    }

    std::string ObjectInfo::GetDataString() const
    {
        return ToHex(GetData(), GetSize());
    }

    int8_t ObjectInfo::GetSerializeType() const
    {
        if (IsIPFSObject())
            return static_cast<int8_t>(type) | 0x80;

        return static_cast<int8_t>(type);
    }

    const uint8_t* ObjectInfo::GetData() const
    {
        if (IsIPFSObject())
            return ipfsHash.data();

        return static_cast<const uint8_t*>(git_odb_object_data(object));
    }

    size_t ObjectInfo::GetSize() const
    {
        if (IsIPFSObject())
            return ipfsHash.size();

        return git_odb_object_size(object);
    }

    bool ObjectInfo::IsIPFSObject() const
    {
        return !ipfsHash.empty();
    }

    /////////////////////////////////////////////////////

    void ObjectCollector::Traverse(const std::vector<Refs>& refs, const std::vector<git_oid>& hidden)
    {
        using namespace git;
        RevWalk walk;
        git_revwalk_new(walk.Addr(), *m_repo);
        git_revwalk_sorting(*walk, GIT_SORT_TIME);
        for (const auto& h : hidden)
        {
            git_revwalk_hide(*walk, &h);
        }
        for (const auto& ref : refs)
        {
            git_revwalk_push_ref(*walk, ref.localRef.c_str());
            auto& r = m_refs.emplace_back();
            git_reference_name_to_id(&r.target, *m_repo, ref.localRef.c_str());
            r.name = ref.remoteRef;
        }
        git_oid oid;
        while (!git_revwalk_next(&oid, *walk))
        {
            // commits
            Object obj;
            git_object_lookup(obj.Addr(), *m_repo, &oid, GIT_OBJECT_ANY);
            auto p = m_set.emplace(oid);
            if (!p.second)
            {
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

    void ObjectCollector::TraverseTree(const git_tree* tree)
    {
        for (size_t i = 0; i < git_tree_entrycount(tree); ++i)
        {
            auto* entry = git_tree_entry_byindex(tree, i);
            auto* entry_oid = git_tree_entry_id(entry);
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
                git::Tree subTree;
                git_tree_lookup(subTree.Addr(), *m_repo, entry_oid);
                TraverseTree(*subTree);
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

    ObjectInfo& ObjectCollector::CollectObject(const git_oid& oid)
    {
        git_odb_object* dbobj = nullptr;
        git_odb_read(&dbobj, *m_odb, &oid);

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
