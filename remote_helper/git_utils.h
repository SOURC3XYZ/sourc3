#pragma once

#include <git2.h>
#include <string_view>
#include <string>

// struct git_repository;
// struct git_odb;

namespace sourc3 {
template <typename T, void(D)(T*)>
class Holder {
 public:
  Holder() = default;

  explicit Holder(T* ptr) : obj_(ptr) {
    assert(ptr != nullptr);
  }

  Holder(const T&) = delete;

  ~Holder() {
    D(obj_);
  }

  T** Addr() noexcept {
    return &obj_;
  }

  explicit operator bool() const noexcept {
    return obj_;
  }

  T* operator*() const noexcept {
    return obj_;
  }

 private:
  T* obj_ = nullptr;
};

namespace git {
using Index = Holder<git_index, git_index_free>;
using Repository = Holder<git_repository, git_repository_free>;
using Tree = Holder<git_tree, git_tree_free>;
using Commit = Holder<git_commit, git_commit_free>;
using Signature = Holder<git_signature, git_signature_free>;
using Config = Holder<git_config, git_config_free>;
using RevWalk = Holder<git_revwalk, git_revwalk_free>;
using Object = Holder<git_object, git_object_free>;
using ObjectDB = Holder<git_odb, git_odb_free>;
using Reference = Holder<git_reference, git_reference_free>;

struct Init {
  Init() noexcept;
  ~Init() noexcept;
};

struct RepoAccessor {
  explicit RepoAccessor(std::string_view dir);

  Repository m_repo;
  ObjectDB m_odb;
};

}  // namespace git

std::string ToString(const git_oid& oid);
}  // namespace sourc3

bool operator<(const git_oid& left, const git_oid& right) noexcept;
bool operator==(const git_oid& left, const git_oid& right) noexcept;
bool operator!=(const git_oid& left, const git_oid& right) noexcept;
