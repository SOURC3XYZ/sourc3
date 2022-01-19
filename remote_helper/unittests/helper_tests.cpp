#define BOOST_TEST_MODULE Remote helper test
#include <boost/test/included/unit_test.hpp>

#include<git2.h>

#include "git_utils.h"

namespace
{
    void GenerateTestRepo()
    {
        pit::GitInit init;
        git_repository* repo = nullptr;
        git_repository_init(&repo, "./testrepo", false);
        git_repository_free(repo);

    }
}

BOOST_AUTO_TEST_CASE(TestObjectCollector)
{
    GenerateTestRepo();
    BOOST_TEST_CHECK(false);
}