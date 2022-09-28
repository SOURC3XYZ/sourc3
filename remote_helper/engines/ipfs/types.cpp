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

#include "types.h"
#include "git/git_utils.h"

#include <sstream>

namespace sourc3 {
std::string GitIdWithIPFS::ToString() const {
    return std::to_string(type) + "\t" + ipfs + "\n" + sourc3::ToString(oid);
}

bool GitIdWithIPFS::operator==(const GitIdWithIPFS& other) const {
    return (type == other.type) && (oid == other.oid) && (ipfs == other.ipfs);
}

CommitMetaBlock::CommitMetaBlock(const std::string& serialized) {
    std::istringstream ss(serialized);
    std::string hash_oid;
    ss >> hash.type;
    ss >> hash.ipfs;
    ss >> hash_oid;
    hash.oid = sourc3::FromString(hash_oid);
    ss >> tree_meta_hash;
    int8_t type;
    std::string hash_ipfs;
    while (ss >> type) {
        ss >> hash_ipfs;
        if (hash_ipfs.empty()) {
            break;
        }
        ss >> hash_oid;
        parent_hashes.emplace_back(type, sourc3::FromString(hash_oid),
                                   std::move(hash_ipfs));
    }
}

std::string CommitMetaBlock::Serialize() const {
    std::string data = hash.ToString() + "\n" + tree_meta_hash + "\n";
    for (const auto& parent : parent_hashes) {
        data += parent.ToString() + "\n";
    }
    return data;
}

TreeMetaBlock::TreeMetaBlock(const std::string& serialized) {
    std::istringstream ss(serialized);
    std::string hash_oid;
    ss >> hash.type;
    ss >> hash.ipfs;
    ss >> hash_oid;
    hash.oid = sourc3::FromString(hash_oid);
    int8_t type;
    std::string hash_ipfs;
    while (ss >> type) {
        ss >> hash_ipfs;
        if (hash_oid.empty()) {
            break;
        }
        ss >> hash_oid;
        entries.emplace_back(type, sourc3::FromString(hash_oid),
                             std::move(hash_ipfs));
    }
}

std::string TreeMetaBlock::Serialize() const {
    std::string data = hash.ToString() + "\n";
    for (const auto& entry : entries) {
        data += entry.ToString() + "\n";
    }
    return data;
}
}  // namespace sourc3
