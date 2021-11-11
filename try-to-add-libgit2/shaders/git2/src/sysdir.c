/*
 * Copyright (C) the libgit2 contributors. All rights reserved.
 *
 * This file is part of libgit2, distributed under the GNU GPL v2 with
 * a Linking Exception. For full terms see the included COPYING file.
 */

#include "sysdir.h"

#include "runtime.h"
#include "str.h"
#include "path.h"
#include <ctype.h>

static int git_sysdir_guess_programdata_dirs(git_str *out)
{
    return 0;
}

static int git_sysdir_guess_system_dirs(git_str *out)
{
    return 0;
}

#ifndef GIT_WIN32
static int get_passwd_home(git_str *out, uid_t uid)
{
	return 0;
}
#endif

static int git_sysdir_guess_global_dirs(git_str *out)
{
    return 0;
}

static int git_sysdir_guess_xdg_dirs(git_str *out)
{
    return 0;
}

static int git_sysdir_guess_template_dirs(git_str *out)
{
    return 0;
}

struct git_sysdir__dir {
	git_str buf;
	int (*guess)(git_str *out);
};

static struct git_sysdir__dir git_sysdir__dirs[] = {
	{ GIT_STR_INIT, git_sysdir_guess_system_dirs },
	{ GIT_STR_INIT, git_sysdir_guess_global_dirs },
	{ GIT_STR_INIT, git_sysdir_guess_xdg_dirs },
	{ GIT_STR_INIT, git_sysdir_guess_programdata_dirs },
	{ GIT_STR_INIT, git_sysdir_guess_template_dirs },
};

static void git_sysdir_global_shutdown(void)
{

}

int git_sysdir_global_init(void)
{
	return 0;
}

static int git_sysdir_check_selector(git_sysdir_t which)
{
	return 0;
}


int git_sysdir_get(const git_str **out, git_sysdir_t which)
{
	return 0;
}

#define PATH_MAGIC "$PATH"

int git_sysdir_set(git_sysdir_t which, const char *search_path)
{
	return 0;
}

static int git_sysdir_find_in_dirlist(
	git_str *path,
	const char *name,
	git_sysdir_t which,
	const char *label)
{
	return 0;
}

int git_sysdir_find_system_file(git_str *path, const char *filename)
{
	return 0;
}

int git_sysdir_find_global_file(git_str *path, const char *filename)
{
	return 0;
}

int git_sysdir_find_xdg_file(git_str *path, const char *filename)
{
	return 0;
}

int git_sysdir_find_programdata_file(git_str *path, const char *filename)
{
	return 0;
}

int git_sysdir_find_template_dir(git_str *path)
{
	return 0;
}

int git_sysdir_expand_global_file(git_str *path, const char *filename)
{
    return 0;
}
