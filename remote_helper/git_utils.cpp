#include "git_utils.h"

#include <stdexcept>

namespace pit
{
    GitInit::GitInit() noexcept
    {
        git_libgit2_init();
    }
    
    GitInit::~GitInit() noexcept
    {
        git_libgit2_shutdown();
    }

    /////////////////////////////////////////////////////
    GitRepoAccessor::GitRepoAccessor(const std::string& dir)
    {
        if (git_repository_open(&m_repo, dir.c_str()) < 0)
        {
            throw std::runtime_error("Failed to open repository!");
        }
        if (git_repository_odb(&m_odb, m_repo) < 0)
        {
            throw std::runtime_error("Failed to open repository database!");
        }
    }

    GitRepoAccessor::~GitRepoAccessor()
    {
        git_odb_free(m_odb);
        git_repository_free(m_repo);
    }

    std::string to_string(const git_oid& oid)
    {
        std::string r;
        r.resize(GIT_OID_HEXSZ);
        git_oid_fmt(r.data(), &oid);
        return r;
    }
}

bool operator<(const git_oid& left, const git_oid& right) noexcept
{
    return git_oid_cmp(&left, &right) < 0;
}

bool operator==(const git_oid& left, const git_oid& right) noexcept
{
    return git_oid_cmp(&left, &right) == 0;
}
