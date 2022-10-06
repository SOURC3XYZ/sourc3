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

#define BOOST_TEST_MODULE Remote helper serialization tests
#include <boost/test/included/unit_test.hpp>

#include "engines/ipfs/types.h"
#include "git/git_utils.h"

using namespace sourc3;

BOOST_AUTO_TEST_CASE(Serialization) {

}

BOOST_AUTO_TEST_CASE(Deserialization) {

}

BOOST_AUTO_TEST_CASE(SerializationDeserializationSync) {
    {
        CommitMetaBlock src_commit;
        src_commit.hash.type = 2;
        src_commit.hash.ipfs = "QmcXwrYbTubpNr4VRg1cUjdbum1U7PtMbpkLq3YTa7AXjx";
        src_commit.hash.oid = sourc3::FromString("3c9f033dc854aac7ab790255485caf2016a5ad7c");
        src_commit.tree_meta_hash = "QmcXwrYbTubpNr4VRg1cUjdbum1U7PtMbpkLq3YTa7AXjx";
        auto commit_serialized = src_commit.Serialize();
        CommitMetaBlock commit(commit_serialized);
        BOOST_TEST_CHECK(commit.Serialize() == commit_serialized);
        BOOST_TEST_CHECK((src_commit == commit));
    }
    {
        TreeMetaBlock src_tree;
        src_tree.hash.type = 1;
        src_tree.hash.ipfs = "QmcXwrYbTubpNr4VRg1cUjdbum1U7PtMbpkLq3YTa7AXjx";
        src_tree.hash.oid = sourc3::FromString("3c9f033dc854aac7ab790255485caf2016a5ad7c");
        auto tree_serialized = src_tree.Serialize();
        TreeMetaBlock tree(tree_serialized);
        BOOST_TEST_CHECK(tree.Serialize() == tree_serialized);
        BOOST_TEST_CHECK((src_tree == tree));
    }
}
