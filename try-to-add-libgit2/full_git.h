#ifndef GITPARSING_FULL_GIT_H
#define GITPARSING_FULL_GIT_H

#include <string_view>

//size_t strlen(const char* data) {
//    return std::string_view(data).size();
//}
//
//const char* memchr (const char* data, char value, size_t length) {
//    return data + std::string_view(data, length).find(value);
//}

char *strdup(const char *src) {
    char *dst = (char *) Env::Heap_Alloc(strlen(src) + 1);  // Space for length plus nul
    if (dst == NULL) return NULL;          // No memory
    Env::Memcpy(dst, src, strlen(src) + 1);                      // Copy the characters
    return dst;                            // Return the new string
}

void* calloc(size_t num, size_t size) {
    return Env::Heap_Alloc(num * size);
}

/** Size (in bytes) of a raw/binary oid */
#define GIT_OID_RAWSZ 20

/** Size (in bytes) of a hex formatted oid */
#define GIT_OID_HEXSZ (GIT_OID_RAWSZ * 2)

//#define UINT16_MAX 65535

typedef int64_t git_off_t;
typedef int64_t git_time_t; /**< time in seconds from epoch */

/** Time in a signature */
namespace mygit2 {
    typedef struct git_time {
        git_time_t time; /**< time in seconds from epoch */
        int offset; /**< timezone offset, in minutes */
        char sign; /**< indicator for questionable '-0000' offsets in signature */
    } git_time;

    typedef struct git_signature {
        char *name; /**< full name of the author */
        char *email; /**< email of the author */
        git_time when; /**< time when the action happened */
    } git_signature;

#define git_array_t(type) struct { type *ptr; size_t size, asize; }

    struct git_str {
        char *ptr;
        size_t asize;
        size_t size;
    };

/** Size (in bytes) of a raw/binary oid */
#define GIT_OID_RAWSZ 20

/** Size (in bytes) of a hex formatted oid */
#define GIT_OID_HEXSZ (GIT_OID_RAWSZ * 2)

/** Minimum length (in number of hex characters,
 * i.e. packets of 4 bits) of an oid prefix */
#define GIT_OID_MINPREFIXLEN 4

/** Unique identity of any object (commit, tree, blob, tag). */
    typedef struct git_oid {
        /** raw binary formatted id */
        unsigned char id[GIT_OID_RAWSZ];
    } git_oid;

    struct git_commit {
        git_array_t(git_oid) parent_ids;
        git_oid tree_id;

        git_signature *author;
        git_signature *committer;

        char *message_encoding;
        char *raw_message;
        char *raw_header;

        char *summary;
        char *body;
    };

    typedef struct {
        git_oid oid;
        int16_t type;  /* git_object_t value */
        uint16_t flags; /* GIT_CACHE_STORE value */
        size_t size;
        int32_t refcount;
    } git_object;

    struct git_tree_entry {
        uint16_t attr;
        uint16_t filename_len;
        const git_oid *oid;
        const char *filename;
    };

    struct git_tree {
        git_object object;
        git_array_t(git_tree_entry) entries;
    };
}

static signed char from_hex[] = {
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 00 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 10 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 20 */
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -1, -1, -1, -1, -1, /* 30 */
        -1, 10, 11, 12, 13, 14, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 40 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 50 */
        -1, 10, 11, 12, 13, 14, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 60 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 70 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 80 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* 90 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* a0 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* b0 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* c0 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* d0 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* e0 */
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, /* f0 */
};

int git__fromhex(char h) {
    return from_hex[(unsigned char) h];
}

int git_oid_fromstrn(mygit2::git_oid *out, const char *str, size_t length) {
    size_t p;
    int v;
    Env::Memset(out->id, 0, GIT_OID_RAWSZ);
    for (p = 0; p < length; p++) {
        v = git__fromhex(str[p]);
        out->id[p / 2] |= (unsigned char) (v << (p % 2 ? 0 : 4));
    }

    return 0;
}

int git_oid_fromstr(mygit2::git_oid *out, const char *str) {
    return git_oid_fromstrn(out, str, GIT_OID_HEXSZ);
}

const char *git_commit_message(const mygit2::git_commit *commit) {
    const char *message;

    message = commit->raw_message;

    /* trim leading newlines from raw message */
    while (*message && *message == '\n')
        ++message;

    return message;
}

bool git__isspace(int c) {
    return (c == ' ' || c == '\t' || c == '\n' || c == '\f' || c == '\r' || c == '\v');
}

static char to_hex[] = "0123456789abcdef";

char *fmt_one(char *str, unsigned int val) {
    *str++ = to_hex[val >> 4];
    *str++ = to_hex[val & 0xf];
    return str;
}

int git_oid_nfmt(char *str, size_t n, const mygit2::git_oid *oid) {
    size_t i, max_i;

    if (!oid) {
        Env::Memset(str, 0, n);
        return 0;
    }
    if (n > GIT_OID_HEXSZ) {
        Env::Memset(&str[GIT_OID_HEXSZ], 0, n - GIT_OID_HEXSZ);
        n = GIT_OID_HEXSZ;
    }

    max_i = n / 2;

    for (i = 0; i < max_i; i++)
        str = fmt_one(str, oid->id[i]);

    if (n & 1)
        *str++ = to_hex[oid->id[i] >> 4];

    return 0;
}

int git_oid_fmt(char *str, const mygit2::git_oid *oid) {
    return git_oid_nfmt(str, GIT_OID_HEXSZ, oid);
}

int git_oid__parse(
        mygit2::git_oid *oid, const char **buffer_out,
        const char *buffer_end, const char *header) {
    const size_t sha_len = GIT_OID_HEXSZ;
    const size_t header_len = strlen(header);

    const char *buffer = *buffer_out;

    if (buffer + (header_len + sha_len + 1) > buffer_end)
        return -1;

    if (Env::Memcmp(buffer, header, header_len) != 0)
        return -1;

    if (buffer[header_len + sha_len] != '\n')
        return -1;

    if (git_oid_fromstr(oid, buffer + header_len) < 0)
        return -1;

    *buffer_out = buffer + (header_len + sha_len + 1);

    return 0;
}

typedef enum {
    GIT_COMMIT_PARSE_QUICK = (1 << 0), /**< Only parse parents and committer info */
} git_commit__parse_flags;

/* use a generic array for growth, return 0 on success */

typedef git_array_t(char) git_array_generic_t;

static void *stdalloc__reallocarray(void *ptr, size_t nelem, size_t elsize) {
    size_t newsize = nelem * elsize;
    return Env::Heap_Alloc(newsize);
}

int git_array_grow(void *_a, size_t item_size) {
    volatile git_array_generic_t *a = (git_array_generic_t *) _a;
    size_t new_size;
    char *new_array;

    if (a->size < 8) {
        new_size = 8;
    } else {
        new_size = a->size * 3;
        new_size /= 2;
    }

    if ((new_array = (char *) stdalloc__reallocarray(a->ptr, new_size, item_size)) == nullptr) {
    }

    a->ptr = new_array;
    a->asize = new_size;
    return 0;
}

#define git_array_alloc(a) \
    (((a).size < (a).asize || git_array_grow(&(a), sizeof(*(a).ptr)) == 0) ? \
    &(a).ptr[(a).size++] : (void *)NULL)

const void *git__memrchr(const void *s, int c, size_t n) {
    const unsigned char *cp;

    if (n != 0) {
        cp = (unsigned char *) s + n;
        do {
            if (*(--cp) == (unsigned char) c)
                return cp;
        } while (--n != 0);
    }

    return NULL;
}

static bool is_crud(unsigned char c) {
    return c <= 32 ||
           c == '.' ||
           c == ',' ||
           c == ':' ||
           c == ';' ||
           c == '<' ||
           c == '>' ||
           c == '"' ||
           c == '\\' ||
           c == '\'';
}

static char *stdalloc__substrdup(const char *start, size_t n) {
    char *ptr;
    size_t alloclen = n + 1;
    if (!(ptr = (char *) Env::Heap_Alloc(alloclen)))
        return NULL;

    Env::Memcpy(ptr, start, n);
    ptr[n] = '\0';
    return ptr;
}

static char *extract_trimmed(const char *ptr, size_t len) {
    while (len && is_crud((unsigned char) ptr[0])) {
        ptr++;
        len--;
    }

    while (len && is_crud((unsigned char) ptr[len - 1])) {
        len--;
    }

    return stdalloc__substrdup(ptr, len);
}

int git__strntol64(int64_t *result, const char *nptr, size_t nptr_len, const char **endptr, int base) {
    const char *p;
    int64_t n, nn, v;
    int c, ovfl, neg, ndig;

    p = nptr;
    neg = 0;
    n = 0;
    ndig = 0;
    ovfl = 0;

    /*
     * White space
     */
    while (nptr_len && git__isspace(*p))
        p++, nptr_len--;

    if (!nptr_len)
        goto Return;

    /*
     * Sign
     */
    if (*p == '-' || *p == '+') {
        if (*p == '-')
            neg = 1;
        p++;
        nptr_len--;
    }

    if (!nptr_len)
        goto Return;

    /*
     * Automatically detect the base if none was given to us.
     * Right now, we assume that a number starting with '0x'
     * is hexadecimal and a number starting with '0' is
     * octal.
     */
    if (base == 0) {
        if (*p != '0')
            base = 10;
        else if (nptr_len > 2 && (p[1] == 'x' || p[1] == 'X'))
            base = 16;
        else
            base = 8;
    }

    if (base < 0 || 36 < base)
        goto Return;

    /*
     * Skip prefix of '0x'-prefixed hexadecimal numbers. There is no
     * need to do the same for '0'-prefixed octal numbers as a
     * leading '0' does not have any impact. Also, if we skip a
     * leading '0' in such a string, then we may end up with no
     * digits left and produce an error later on which isn't one.
     */
    if (base == 16 && nptr_len > 2 && p[0] == '0' && (p[1] == 'x' || p[1] == 'X')) {
        p += 2;
        nptr_len -= 2;
    }

    /*
     * Non-empty sequence of digits
     */
    for (; nptr_len > 0; p++, ndig++, nptr_len--) {
        c = *p;
        v = base;
        if ('0' <= c && c <= '9')
            v = c - '0';
        else if ('a' <= c && c <= 'z')
            v = c - 'a' + 10;
        else if ('A' <= c && c <= 'Z')
            v = c - 'A' + 10;
        if (v >= base)
            break;
        v = neg ? -v : v;
        nn = (int64_t) n * base;
        n = (int64_t) nn * v;
//        if (git__multiply_int64_overflow(&nn, n, base) || git__add_int64_overflow(&n, nn, v)) {
//            ovfl = 1;
//            /* Keep on iterating until the end of this number */
//            continue;
//        }
    }

    Return:
    if (ndig == 0) {
//		git_error_set(GIT_ERROR_INVALID, "failed to convert string to long: not a number");
        return -1;
    }

    if (endptr)
        *endptr = p;

    if (ovfl) {
//		git_error_set(GIT_ERROR_INVALID, "failed to convert string to long: overflow error");
        return -1;
    }

    *result = n;
    return 0;
}

int git__strntol32(int32_t *result, const char *nptr, size_t nptr_len, const char **endptr, int base) {
    const char *tmp_endptr;
    int32_t tmp_int;
    int64_t tmp_long;
    int error;

    if ((error = git__strntol64(&tmp_long, nptr, nptr_len, &tmp_endptr, base)) < 0)
        return error;

    tmp_int = tmp_long & 0xFFFFFFFF;
    if (tmp_int != tmp_long) {
//        int len = (int) (tmp_endptr - nptr);
//		git_error_set(GIT_ERROR_INVALID, "failed to convert: '%.*s' is too large", len, nptr);
        return -1;
    }

    *result = tmp_int;
    if (endptr)
        *endptr = tmp_endptr;

    return error;
}

int git_signature__parse(mygit2::git_signature *sig, const char **buffer_out,
                         const char *buffer_end, const char *header, char ender) {
    const char *buffer = *buffer_out;
    const char *email_start, *email_end;

    Env::Memset(sig, 0, sizeof(mygit2::git_signature));

    if (ender &&
        (buffer_end = (const char *) memchr(buffer, ender, buffer_end - buffer)) == NULL)
        return -1;

    if (header) {
        const size_t header_len = strlen(header);

        if (buffer + header_len >= buffer_end || Env::Memcmp(buffer, header, header_len) != 0)
            return -1;

        buffer += header_len;
    }

    email_start = (const char *) git__memrchr(buffer, '<', buffer_end - buffer);
    email_end = (const char *) git__memrchr(buffer, '>', buffer_end - buffer);

    if (!email_start || !email_end || email_end <= email_start)
        return -1;

    email_start += 1;
    sig->name = extract_trimmed(buffer, email_start - buffer - 1);
    sig->email = extract_trimmed(email_start, email_end - email_start);

    /* Do we even have a time at the end of the signature? */
    if (email_end + 2 < buffer_end) {
        const char *time_start = email_end + 2;
        const char *time_end;

        if (git__strntol64(&sig->when.time, time_start,
                           buffer_end - time_start, &time_end, 10) < 0) {
            Env::Heap_Free(sig->name);
            Env::Heap_Free(sig->email);
            sig->name = sig->email = NULL;
            return -1;
        }

        /* do we have a timezone? */
        if (time_end + 1 < buffer_end) {
            int offset, hours, mins;
            const char *tz_start, *tz_end;

            tz_start = time_end + 1;

            if ((tz_start[0] != '-' && tz_start[0] != '+') ||
                git__strntol32(&offset, tz_start + 1,
                               buffer_end - tz_start - 1, &tz_end, 10) < 0) {
                /* malformed timezone, just assume it's zero */
                offset = 0;
            }

            hours = offset / 100;
            mins = offset % 100;

            /*
             * only store timezone if it's not overflowing;
             * see http://www.worldtimezone.com/faq.html
             */
            if (hours <= 14 && mins <= 59) {
                sig->when.offset = (hours * 60) + mins;
                sig->when.sign = tz_start[0];
                if (tz_start[0] == '-')
                    sig->when.offset = -sig->when.offset;
            }
        }
    }

    *buffer_out = buffer_end + 1;
    return 0;
}

int git__tolower(int c) {
    return (c >= 'A' && c <= 'Z') ? (c + 32) : c;
}

int prefixcmp(const char *str, size_t str_n, const char *prefix, bool icase) {
    int s, p;

    while (str_n--) {
        s = (unsigned char) *str++;
        p = (unsigned char) *prefix++;

        if (icase) {
            s = git__tolower(s);
            p = git__tolower(p);
        }

        if (!p)
            return 0;

        if (s != p)
            return s - p;
    }

    return (0 - *prefix);
}

static int commit_parse(mygit2::git_commit *commit, const char *data, size_t size, unsigned int flags) {
    const char *buffer_start = data, *buffer;
    const char *buffer_end = buffer_start + size;
    mygit2::git_oid parent_id;
    size_t header_len;
    mygit2::git_signature dummy_sig;

    buffer = buffer_start;

    /* Allocate for one, which will allow not to realloc 90% of the time  */
    commit->parent_ids.size = 0;
    commit->parent_ids.asize = 1;
    commit->parent_ids.ptr = (mygit2::git_oid *) calloc(1, sizeof(commit->parent_ids.ptr));

    /* The tree is always the first field */
    if (!(flags & GIT_COMMIT_PARSE_QUICK)) {
        git_oid__parse(&commit->tree_id, &buffer, buffer_end, "tree ");
    } else {
        size_t tree_len = strlen("tree ") + GIT_OID_HEXSZ + 1;
        buffer += tree_len;
    }

    /*
     * TODO: commit grafts!
     */

    while (git_oid__parse(&parent_id, &buffer, buffer_end, "parent ") == 0) {
        auto *new_id = (mygit2::git_oid *) git_array_alloc(commit->parent_ids);
        Env::Memcpy(parent_id.id, new_id->id, sizeof(parent_id.id));
    }

    if (!(flags & GIT_COMMIT_PARSE_QUICK)) {
        commit->author = (mygit2::git_signature *) Env::Heap_Alloc(sizeof(mygit2::git_signature));
        if (git_signature__parse(commit->author, &buffer, buffer_end, "author ", '\n') < 0)
            return -1;
    }

    /* Some tools create multiple author fields, ignore the extra ones */
    while (!prefixcmp(buffer, buffer_end - buffer, "author ", false)) {
        if (git_signature__parse(&dummy_sig, &buffer, buffer_end, "author ", '\n') < 0)
            return -1;

        Env::Heap_Free(dummy_sig.name);
        Env::Heap_Free(dummy_sig.email);
    }

    /* Always parse the committer; we need the commit time */
    commit->committer = (mygit2::git_signature *) Env::Heap_Alloc(sizeof(mygit2::git_signature));

    if (git_signature__parse(commit->committer, &buffer, buffer_end, "committer ", '\n') < 0)
        return -1;

    if (flags & GIT_COMMIT_PARSE_QUICK)
        return 0;

    /* Parse add'l header entries */
    while (buffer < buffer_end) {
        const char *eoln = buffer;
        if (buffer[-1] == '\n' && buffer[0] == '\n')
            break;

        while (eoln < buffer_end && *eoln != '\n')
            ++eoln;

        if (prefixcmp(buffer, buffer_end - buffer, "encoding ", false) == 0) {
            buffer += strlen("encoding ");

            commit->message_encoding = stdalloc__substrdup(buffer, eoln - buffer);
        }

        if (eoln < buffer_end && *eoln == '\n')
            ++eoln;
        buffer = eoln;
    }

    header_len = buffer - buffer_start;
    commit->raw_header = stdalloc__substrdup(buffer_start, header_len);

    /* point "buffer" to data after header, +1 for the final LF */
    buffer = buffer_start + header_len + 1;

    /* extract commit message */
    if (buffer <= buffer_end)
        commit->raw_message = stdalloc__substrdup(buffer, buffer_end - buffer);
    else
        commit->raw_message = strdup("");

    return 0;
}

static int parse_mode(uint16_t *mode_out, const char *buffer, size_t buffer_len, const char **buffer_out) {
    int32_t mode;
    int error;

    if (!buffer_len || git__isspace(*buffer))
        return -1;

    if ((error = git__strntol32(&mode, buffer, buffer_len, buffer_out, 8)) < 0)
        return error;

    if (mode < 0 || mode > UINT16_MAX)
        return -1;

    *mode_out = mode;

    return 0;
}

#define DEFAULT_TREE_SIZE 16

int tree_parse(void *_tree, const char *data, size_t size) {
    auto *tree = (mygit2::git_tree *) _tree;
    const char *buffer;
    const char *buffer_end;

    buffer = data;
    buffer_end = buffer + size;

    (tree->entries).size = 0;
    (tree->entries).asize = DEFAULT_TREE_SIZE;
    (tree->entries).ptr = (mygit2::git_tree_entry *) calloc(DEFAULT_TREE_SIZE, sizeof(*(tree->entries).ptr));

    while (buffer < buffer_end) {
        mygit2::git_tree_entry *entry;
        size_t filename_len;
        const char *nul;
        uint16_t attr;

        if (parse_mode(&attr, buffer, buffer_end - buffer, &buffer) < 0 || !buffer)
            return -1;

        if (buffer >= buffer_end || (*buffer++) != ' ')
            return -1;

        if ((nul = (const char *) memchr(buffer, 0, buffer_end - buffer)) == NULL)
            return -1;

        if ((filename_len = nul - buffer) == 0 || filename_len > UINT16_MAX)
            return -1;

        if ((buffer_end - (nul + 1)) < GIT_OID_RAWSZ)
            return -1;

        /* Allocate the entry */
        {
            entry = (mygit2::git_tree_entry *) git_array_alloc(tree->entries);

            entry->attr = attr;
            entry->filename_len = (uint16_t) filename_len;
            entry->filename = buffer;
            entry->oid = (mygit2::git_oid *) ((char *) buffer + filename_len + 1);
        }

        buffer += filename_len + 1;
        buffer += GIT_OID_RAWSZ;
    }

    return 0;
}

#endif //GITPARSING_FULL_GIT_H
