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

#pragma once

#include "git2.h"
#include <string>
#include <utility>
#include <vector>
#include <unordered_map>
#include <variant>

namespace sourc3 {
struct GitIdWithIPFS {
    GitIdWithIPFS() = default;

    GitIdWithIPFS(int8_t type, git_oid oid, std::string ipfs)
        : type(type), oid(std::move(oid)), ipfs(std::move(ipfs)) {
    }

    int8_t type;
    git_oid oid;
    std::string ipfs;

    std::string ToString() const;

    bool operator==(const GitIdWithIPFS& other) const;
    bool operator!=(const GitIdWithIPFS& other) const;
};

struct MetaBlock {
    GitIdWithIPFS hash;

    virtual ~MetaBlock() = default;

    virtual std::string Serialize() const = 0;
};

struct CommitMetaBlock final : MetaBlock {
    std::string tree_meta_hash;
    std::vector<GitIdWithIPFS> parent_hashes;

    CommitMetaBlock() = default;

    explicit CommitMetaBlock(const std::string& serialized);

    std::string Serialize() const final;

    bool operator==(const CommitMetaBlock& other) const;
};

struct TreeMetaBlock final : MetaBlock {
    std::vector<GitIdWithIPFS> entries;

    TreeMetaBlock() = default;

    explicit TreeMetaBlock(const std::string& serialized);

    std::string Serialize() const final;

    bool operator==(const TreeMetaBlock& other) const;
};
}  // namespace sourc3