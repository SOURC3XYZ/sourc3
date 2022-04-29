#define BOOST_TEST_MODULE Remote helper test
#include <boost/test/included/unit_test.hpp>

#include <git2.h>
#include "git_utils.h"
#include "object_collector.h"

using namespace sourc3;

namespace {
void GenerateTestRepo(std::string_view root) {
  using namespace git;
  Repository repo;
  Commit commit;
  BOOST_TEST_CHECK(git_repository_init(repo.Addr(), root.data(), false) >= 0);
  Config config;
  BOOST_TEST_CHECK(git_repository_config(config.Addr(), *repo) >= 0);

  BOOST_TEST_CHECK(git_config_set_string(*config, "user.name", "test user") >=
                   0);
  BOOST_TEST_CHECK(
      git_config_set_string(*config, "user.email", "test@sourc3.io") >= 0);

  Signature sig;
  BOOST_TEST_CHECK(git_signature_default(sig.Addr(), *repo) >= 0);
  Index index;
  BOOST_TEST_CHECK(git_repository_index(index.Addr(), *repo) >= 0);

  auto f = [&](const char* wildcard, const char* comment) {
    char* p = (char*)wildcard;
    git_strarray paths = {&p, 1};

    BOOST_TEST_CHECK(git_index_add_all(*index, &paths, 0, nullptr, nullptr) >=
                     0);
    BOOST_TEST_CHECK(git_index_write(*index) >= 0);
    git_oid treeID;
    Tree tree;
    BOOST_TEST_CHECK(git_index_write_tree(&treeID, *index) >= 0);
    BOOST_TEST_CHECK(git_tree_lookup(tree.Addr(), *repo, &treeID) >= 0);

    git_oid commitID;
    BOOST_TEST_CHECK(git_commit_create_v(&commitID, *repo, "HEAD", *sig, *sig,
                                         nullptr, comment, *tree,
                                         commit ? 1 : 0, *commit) >= 0);
    BOOST_TEST_CHECK(git_commit_lookup(commit.Addr(), *repo, &commitID) >= 0);
  };
  f("*.cpp", "Initial");
  f("*.h", "Second");
  f("*.*", "The third");
}
}  // namespace

BOOST_AUTO_TEST_CASE(TestObjectCollector) {
  std::string_view root = "./temp/testrepo";
  git::Init init;
  GenerateTestRepo(root);
  sourc3::ObjectCollector collector(root);

  collector.Traverse({{"refs/heads/master", "refs/heads/master"}}, {});

  BOOST_TEST_CHECK(collector.m_objects.size() == 27);

  collector.Serialize([&](const auto& buf, bool lastBlock) {
    BOOST_TEST_CHECK(lastBlock == true);
    size_t size = sizeof(sourc3::ObjectsInfo);
    const auto* p = reinterpret_cast<const sourc3::ObjectsInfo*>(buf.data());
    BOOST_TEST_CHECK(p->objects_number == uint32_t(27));
    const auto* o = reinterpret_cast<const sourc3::GitObject*>(p + 1);
    for (uint32_t i = 0; i < p->objects_number; ++i) {
      size += sizeof(sourc3::GitObject) + o->data_size;
      o = reinterpret_cast<const sourc3::GitObject*>(
          reinterpret_cast<const uint8_t*>(o + 1) + o->data_size);
    }
    BOOST_TEST_CHECK(size == buf.size());
  });
}