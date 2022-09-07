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

#include "git_utils.h"

#include <stdexcept>

namespace sourc3::git {
Init::Init() noexcept {
    git_libgit2_init();
}

Init::~Init() noexcept {
    git_libgit2_shutdown();
}

/////////////////////////////////////////////////////
RepoAccessor::RepoAccessor(std::string_view dir) {
    if (git_repository_open(m_repo.Addr(), dir.data()) < 0) {
        throw std::runtime_error("Failed to open repository!");
    }
    if (git_repository_odb(m_odb.Addr(), *m_repo) < 0) {
        throw std::runtime_error("Failed to open repository database!");
    }
}
}  // namespace sourc3::git
namespace sourc3 {
std::string ToString(const git_oid& oid) {
    std::string r;
    r.resize(GIT_OID_HEXSZ);
    git_oid_fmt(r.data(), &oid);
    return r;
}

git_oid FromString(const std::string& str) {
    git_oid oid;
    git_oid_fromstr(&oid, str.c_str());
    return oid;
}
}  // namespace sourc3

bool operator<(const git_oid& left, const git_oid& right) noexcept {
    return git_oid_cmp(&left, &right) < 0;
}

bool operator==(const git_oid& left, const git_oid& right) noexcept {
    return git_oid_cmp(&left, &right) == 0;
}

bool operator!=(const git_oid& left, const git_oid& right) noexcept {
    return git_oid_cmp(&left, &right) != 0;
}
