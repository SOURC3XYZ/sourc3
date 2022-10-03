#include "parsing.h"

#include <deque>
#include <unordered_set>

namespace sourc3 {
size_t sourc3::OidHasher::operator()(const git_oid& oid) const {
    return hasher(ToString(oid));
}

std::string CreateRefsFile(const std::vector<Ref>& refs, const HashMapping& mapping) {
    std::string file;
    for (const auto& ref : refs) {
        if (mapping.count(ref.target) == 0) {
            throw std::runtime_error{"Some refs are not used!"};
        }
        file += ref.name + "\t" + mapping.at(ref.target) + "\t" + ToString(ref.target) + "\n";
    }
    return file;
}

std::vector<Ref> ParseRefs(const std::string& refs_file) {
    std::vector<Ref> refs;
    if (refs_file.empty()) {
        return refs;
    }

    std::istringstream ss(refs_file);
    std::string ref_name;
    std::string target_ipfs;
    std::string target_oid;
    while (ss >> ref_name) {
        if (ref_name.empty()) {
            break;
        }
        ss >> target_ipfs;
        ss >> target_oid;
        refs.push_back(Ref{std::move(ref_name), target_ipfs, FromString(target_oid)});
    }
    return refs;
}

HashMapping ParseRefHashed(const std::string& refs_file) {
    HashMapping mapping;
    if (refs_file.empty()) {
        return mapping;
    }

    std::istringstream ss(refs_file);
    std::string ref_name;
    std::string target_ipfs;
    std::string target_oid;
    while (ss >> ref_name) {
        if (ref_name.empty()) {
            break;
        }
        ss >> target_ipfs;
        ss >> target_oid;
        mapping[FromString(target_oid)] = std::move(target_ipfs);
    }
    return mapping;
}

std::unique_ptr<CommitMetaBlock> GetCommitMetaBlock(const git::Commit& commit,
                                                    const HashMapping& oid_to_meta,
                                                    const HashMapping& oid_to_ipfs) {
    auto block = std::make_unique<CommitMetaBlock>();
    git_commit* raw_commit = *commit;
    const auto* commit_id = git_commit_id(raw_commit);
    block->hash.type = GIT_OBJECT_COMMIT;
    block->hash.oid = *commit_id;
    block->hash.ipfs = oid_to_ipfs.at(*commit_id);
    if (oid_to_meta.count(*git_commit_tree_id(raw_commit)) == 0) {
        throw std::runtime_error{"Cannot find tree " + ToString(*git_commit_tree_id(raw_commit)) +
                                 " meta on IPFS"};
    }
    block->tree_meta_hash = oid_to_meta.at(*git_commit_tree_id(raw_commit));
    unsigned int parents_count = git_commit_parentcount(raw_commit);
    for (unsigned int i = 0; i < parents_count; ++i) {
        auto* parent_id = git_commit_parent_id(raw_commit, i);
        if (oid_to_meta.count(*parent_id) > 0) {
            block->parent_hashes.emplace_back(GIT_OBJECT_COMMIT,
                                              *parent_id, oid_to_meta.at(*parent_id));
        } else {
            throw std::runtime_error{
                "Something wrong with push, "
                "we cannot find meta object for parent " +
                ToString(*parent_id)};
        }
    }
    return block;
}

std::unique_ptr<TreeMetaBlock> GetTreeMetaBlock(const git::Tree& tree,
                                                const HashMapping& oid_to_meta,
                                                const HashMapping& oid_to_ipfs) {
    git_tree* raw_tree = *tree;
    const auto* tree_id = git_tree_id(raw_tree);
    auto block = std::make_unique<TreeMetaBlock>();
    if (auto tree_pos = oid_to_ipfs.find(*tree_id); tree_pos != oid_to_ipfs.end()) {
        block->hash = {GIT_OBJECT_TREE, *tree_id, tree_pos->second};
    } else {
        throw std::runtime_error{"Tree content wasn't upload to IPFS for oid: " +
                                 sourc3::ToString(*tree_id)};
    }
    for (size_t i = 0, size = git_tree_entrycount(raw_tree); i < size; ++i) {
        auto entry = git_tree_entry_byindex(raw_tree, i);
        const auto& entry_id = *git_tree_entry_id(entry);
        auto type = git_tree_entry_type(entry);
        if (type == GIT_OBJECT_TREE) {  // Another tree, need to save meta
            if (auto meta_pos = oid_to_meta.find(entry_id); meta_pos != oid_to_meta.end()) {
                block->entries.emplace_back(type, entry_id, oid_to_meta.at(entry_id));
            } else {
                throw std::runtime_error{"Subtree wasn't upload to IPFS for oid: " +
                                         sourc3::ToString(entry_id)};
            }
        } else if (type == GIT_OBJECT_COMMIT) { // Submodule
            block->entries.emplace_back(type, entry_id,
                                        std::string(oid_to_ipfs.begin()->second.size(), '0'));
        } else {
            if (auto entry_pos = oid_to_ipfs.find(entry_id); entry_pos != oid_to_ipfs.end()) {
                block->entries.emplace_back(type, entry_id, oid_to_ipfs.at(entry_id));
            } else {
                throw std::runtime_error{
                    "Entry wasn't upload to IPFS for oid: " + sourc3::ToString(entry_id) +
                    " and type: " + std::to_string(type)};
            }
        }
    }
    return block;
}

std::unique_ptr<MetaBlock> GetMetaBlock(const sourc3::git::RepoAccessor& accessor,
                                        const ObjectInfo& obj, const HashMapping& oid_to_meta,
                                        const HashMapping& oid_to_ipfs) {
    if (obj.type == GIT_OBJECT_COMMIT) {
        git::Commit commit;
        git_commit_lookup(commit.Addr(), *accessor.m_repo, &obj.oid);
        return GetCommitMetaBlock(commit, oid_to_meta, oid_to_ipfs);
    } else if (obj.type == GIT_OBJECT_TREE) {
        git::Tree tree;
        git_tree_lookup(tree.Addr(), *accessor.m_repo, &obj.oid);
        return GetTreeMetaBlock(tree, oid_to_meta, oid_to_ipfs);
    }

    return nullptr;
}

bool CheckCommitsLinking(const Metas& metas, const std::vector<Ref>& new_refs,
                         const HashMapping& oid_to_meta) {
    std::deque<std::string> working_hashes;
    std::unordered_set<std::string> used;
    for (const auto& ref : new_refs) {
        if (oid_to_meta.count(ref.target) == 0) {
            return false;
        }
        std::string hash = oid_to_meta.at(ref.target);
        working_hashes.push_back(hash);
    }

    while (!working_hashes.empty()) {
        std::string hash = std::move(working_hashes.back());
        working_hashes.pop_back();
        used.insert(hash);
        if (metas.count(hash) == 0) {
            return false;
        }

        auto* commit = std::get_if<CommitMetaBlock>(&metas.at(hash));
        if (commit == nullptr) {
            return false;
        }

        for (const auto& parent_meta : commit->parent_hashes) {
            if (used.count(parent_meta.ipfs) == 0) {
                working_hashes.push_back(parent_meta.ipfs);
            }
        }
    }
    return true;
}
}  // namespace sourc3
