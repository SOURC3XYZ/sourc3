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
