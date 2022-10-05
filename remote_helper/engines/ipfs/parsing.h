#pragma once

#include <unordered_map>
#include <set>

#include "git2.h"

#include "engines/ipfs/types.h"
#include "utils.h"
#include "git/object_collector.h"

namespace sourc3 {
using Metas = std::unordered_map<std::string, std::variant<TreeMetaBlock, CommitMetaBlock>>;

struct OidHasher {
    size_t operator()(const git_oid& oid) const;
};

using HashMapping = std::unordered_map<git_oid, std::string, OidHasher>;

std::string CreateRefsFile(const std::vector<Ref>& refs, const HashMapping& mapping);

std::vector<Ref> ParseRefs(const std::string& refs_file);

HashMapping ParseRefHashed(const std::string& refs_file);

std::unique_ptr<CommitMetaBlock> GetCommitMetaBlock(const git::Commit& commit,
                                                    const HashMapping& oid_to_meta,
                                                    const HashMapping& oid_to_ipfs);

std::unique_ptr<TreeMetaBlock> GetTreeMetaBlock(const git::Tree& tree,
                                                const HashMapping& oid_to_meta,
                                                const HashMapping& oid_to_ipfs);

std::unique_ptr<MetaBlock> GetMetaBlock(const sourc3::git::RepoAccessor& accessor,
                                        const ObjectInfo& obj, const HashMapping& oid_to_meta,
                                        const HashMapping& oid_to_ipfs);

bool CheckCommitsLinking(const Metas& metas, const std::vector<Ref>& new_refs,
                         const HashMapping& oid_to_meta);
}  // namespace sourc3