#define BOOST_TEST_MODULE Remote helper test
#include <boost/test/included/unit_test.hpp>

#include<git2.h>

#include "git_utils.h"

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

    void GenerateTestRepo()
    {
        pit::GitInit init;
        Repository repo;
        Commit commit;
        BOOST_TEST_CHECK(git_repository_init(repo.Addr(), "./testrepo", false) >= 0);
        Signature sig;
        BOOST_TEST_CHECK(git_signature_default(sig.Addr(), *repo) >= 0);
        Index index;
        BOOST_TEST_CHECK(git_repository_index(index.Addr(), *repo) >= 0);

        auto f = [&](char* wildcard, const char* comment)
        {
            git_strarray paths =
            {
                &wildcard,
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
    GenerateTestRepo();
}