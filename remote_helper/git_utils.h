#pragma once

#include <git2.h>
#include <string>

//struct git_repository;
//struct git_odb;

namespace pit
{
    struct GitInit
    {
        GitInit() noexcept;
        ~GitInit() noexcept;
    };

    struct GitRepoAccessor
    {
        GitRepoAccessor(const std::string& dir);
        ~GitRepoAccessor();

        git_repository* m_repo;
        git_odb* m_odb;
    };

    std::string to_string(const git_oid& oid);
}

bool operator<(const git_oid& left, const git_oid& right) noexcept;
bool operator==(const git_oid& left, const git_oid& right) noexcept;
bool operator!=(const git_oid& left, const git_oid& right) noexcept;
