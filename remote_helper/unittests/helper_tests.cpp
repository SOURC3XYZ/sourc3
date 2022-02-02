#define BOOST_TEST_MODULE Remote helper test
#include <boost/test/included/unit_test.hpp>

#include<git2.h>

#include "git_utils.h"
#include "object_collector.h"

namespace
{
    template<typename T, void (D)(T*)>
    class Holder
    {
    public:

        Holder() = default;

        Holder(T* ptr)
            : m_obj(ptr)
        {
            assert(ptr != nullptr);
        }

        Holder(const T&) = delete;

        ~Holder()
        {
            D(m_obj);
        }

        T** Addr() noexcept
        {
            return &m_obj;
        }

        explicit operator bool() const noexcept
        {
            return !!m_obj;
        }

        T* operator*() const noexcept
        {
            return m_obj;
        }
    private:
        T* m_obj = nullptr;
    };

    using Index = Holder<git_index, git_index_free>;
    using Repository = Holder<git_repository, git_repository_free>;
    using Tree = Holder<git_tree, git_tree_free>;
    using Commit = Holder<git_commit, git_commit_free>;
    using Signature = Holder<git_signature, git_signature_free>;

    void GenerateTestRepo(std::string_view root)
    {
        Repository repo;
        Commit commit;
        BOOST_TEST_CHECK(git_repository_init(repo.Addr(), root.data(), false) >= 0);
        Signature sig;
        BOOST_TEST_CHECK(git_signature_default(sig.Addr(), *repo) >= 0);
        Index index;
        BOOST_TEST_CHECK(git_repository_index(index.Addr(), *repo) >= 0);

        auto f = [&](const char* wildcard, const char* comment)
        {
            char* p = (char*)wildcard;
            git_strarray paths =
            {
                &p,
                1
            };

            BOOST_TEST_CHECK(git_index_add_all(*index, &paths, 0, nullptr, nullptr) >= 0);
            BOOST_TEST_CHECK(git_index_write(*index) >= 0);
            git_oid treeID;
            Tree tree;
            BOOST_TEST_CHECK(git_index_write_tree(&treeID, *index) >= 0);
            BOOST_TEST_CHECK(git_tree_lookup(tree.Addr(), *repo, &treeID) >= 0);

            git_oid commitID;
            BOOST_TEST_CHECK(git_commit_create_v(&commitID, *repo, "HEAD", *sig, *sig, nullptr, comment, *tree, commit ? 1 : 0, *commit) >= 0);
            BOOST_TEST_CHECK(git_commit_lookup(commit.Addr(), *repo, &commitID) >= 0);
        };
        f("*.cpp", "Initial");
        f("*.h", "Second");
        f("*.*", "The third");
    }
}

BOOST_AUTO_TEST_CASE(TestObjectCollector)
{
    std::string_view root = "./temp/testrepo";
    pit::GitInit init;
    GenerateTestRepo(root);
    pit::ObjectCollector collector(root);

    collector.Traverse({ {"refs/heads/master", "refs/heads/master"} }, {});

    BOOST_TEST_CHECK(collector.m_objects.size() == 27);

    collector.Serialize([&](const auto& buf)
        {
            size_t size = sizeof(pit::ObjectsInfo);
            const auto* p = reinterpret_cast<const pit::ObjectsInfo*>(buf.data());
            BOOST_TEST_CHECK(p->objects_number == uint32_t(27));
            const auto* o = reinterpret_cast<const pit::GitObject*>(p + 1);
            for (uint32_t i = 0; i < p->objects_number; ++i)
            {
                size += sizeof(pit::GitObject) + o->data_size;
                o = reinterpret_cast<const pit::GitObject*>(reinterpret_cast<const uint8_t*>(o + 1) + o->data_size);
            }
            BOOST_TEST_CHECK(size == buf.size());
        });
}