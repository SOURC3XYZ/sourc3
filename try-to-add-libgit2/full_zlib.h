#ifndef GITPARSING_FULL_ZLIB_H
#define GITPARSING_FULL_ZLIB_H

#define ZLIB_INTERNAL

#define STDC
#ifndef OF /* function prototypes */
#  ifdef STDC
#    define OF(args)  args
#  else
#    define OF(args)  ()
#  endif
#endif

#ifndef FAR
#  define FAR
#endif

typedef unsigned char Byte;  /* 8 bits */
typedef Byte  FAR Bytef;
typedef unsigned long uLong; /* 32 bits or more */
typedef uLong FAR uLongf;
typedef unsigned int uInt;  /* 16 bits or more */
typedef void FAR *voidpf;

typedef voidpf (*alloc_func)OF((voidpf opaque, uInt items, uInt size));

typedef void   (*free_func)OF((voidpf opaque, voidpf address));

struct internal_state;

typedef struct z_stream_s {
    Bytef *next_in;     /* next input byte */
    uInt avail_in;  /* number of bytes available at next_in */
    uLong total_in;  /* total number of input bytes read so far */

    Bytef *next_out; /* next output byte will go here */
    uInt avail_out; /* remaining free space at next_out */
    uLong total_out; /* total number of bytes output so far */

    char *msg;  /* last error message, NULL if no error */
    struct internal_state FAR *state; /* not visible by applications */

    alloc_func zalloc;  /* used to allocate the internal state */
    free_func zfree;   /* used to free the internal state */
    voidpf opaque;  /* private data object passed to zalloc and zfree */

    int data_type;  /* best guess about the data type: binary or text
                           for deflate, or the decoding state for inflate */
    uLong adler;      /* Adler-32 or CRC-32 value of the uncompressed data */
    uLong reserved;   /* reserved for future use */
} z_stream;

typedef z_stream FAR *z_streamp;
typedef unsigned long ulg;

typedef struct gz_header_s {
    int text;       /* true if compressed data believed to be text */
    uLong time;       /* modification time */
    int xflags;     /* extra flags (not used when writing a gzip file) */
    int os;         /* operating system */
    Bytef *extra;     /* pointer to extra field or Z_NULL if none */
    uInt extra_len;  /* extra field length (valid if extra != Z_NULL) */
    uInt extra_max;  /* space at extra (only when reading header) */
    Bytef *name;      /* pointer to zero-terminated file name or Z_NULL */
    uInt name_max;   /* space at name (only when reading header) */
    Bytef *comment;   /* pointer to zero-terminated comment or Z_NULL */
    uInt comm_max;   /* space at comment (only when reading header) */
    int hcrc;       /* true if there was or will be a header crc */
    int done;       /* true when done reading gzip header (not used
                           when writing a gzip file) */
} gz_header;

typedef gz_header FAR *gz_headerp;
typedef unsigned short ush;
typedef ush Pos;
typedef unsigned IPos;
typedef Pos FAR Posf;

typedef struct ct_data_s {
    union {
        ush freq;       /* frequency count */
        ush code;       /* bit string */
    } fc;
    union {
        ush dad;        /* father node in Huffman tree */
        ush len;        /* length of bit string */
    } dl;
} FAR ct_data;

#define LENGTH_CODES 29
#define LITERALS  256
#define L_CODES (LITERALS+1+LENGTH_CODES)
#define HEAP_SIZE (2*L_CODES+1)
#define D_CODES   30
#define BL_CODES  19
#define MAX_BITS 15

typedef int   FAR intf;

struct static_tree_desc_s {
    const ct_data *static_tree;  /* static tree or NULL */
    const intf *extra_bits;      /* extra bits for each code or NULL */
    int extra_base;          /* base index for extra_bits */
    int elems;               /* max number of elements in the tree */
    int max_length;          /* max bit length for the codes */
};


typedef struct static_tree_desc_s static_tree_desc;

typedef struct tree_desc_s {
    ct_data *dyn_tree;           /* the dynamic tree */
    int max_code;            /* largest code with non zero frequency */
    const static_tree_desc *stat_desc;  /* the corresponding static tree */
} FAR tree_desc;

typedef unsigned char uch;
typedef uch FAR uchf;
typedef ush FAR ushf;

typedef struct internal_state {
    z_streamp strm;      /* pointer back to this zlib stream */
    int status;        /* as the name implies */
    Bytef *pending_buf;  /* output still pending */
    ulg pending_buf_size; /* size of pending_buf */
    Bytef *pending_out;  /* next pending byte to output to the stream */
    ulg pending;       /* nb of bytes in the pending buffer */
    int wrap;          /* bit 0 true for zlib, bit 1 true for gzip */
    gz_headerp gzhead;  /* gzip header information to write */
    ulg gzindex;       /* where in extra, name, or comment */
    Byte method;        /* can only be DEFLATED */
    int last_flush;    /* value of flush param for previous deflate call */

    /* used by deflate.c: */

    uInt w_size;        /* LZ77 window size (32K by default) */
    uInt w_bits;        /* log2(w_size)  (8..16) */
    uInt w_mask;        /* w_size - 1 */

    Bytef *window;
    /* Sliding window. Input bytes are read into the second half of the window,
     * and move to the first half later to keep a dictionary of at least wSize
     * bytes. With this organization, matches are limited to a distance of
     * wSize-MAX_MATCH bytes, but this ensures that IO is always
     * performed with a length multiple of the block size. Also, it limits
     * the window size to 64K, which is quite useful on MSDOS.
     * To do: use the user input buffer as sliding window.
     */

    ulg window_size;
    /* Actual size of window: 2*wSize, except when the user input buffer
     * is directly used as sliding window.
     */

    Posf *prev;
    /* Link to older string with same hash index. To limit the size of this
     * array to 64K, this link is maintained only for the last 32K strings.
     * An index in this array is thus a window index modulo 32K.
     */

    Posf *head; /* Heads of the hash chains or NIL. */

    uInt ins_h;          /* hash index of string to be inserted */
    uInt hash_size;      /* number of elements in hash table */
    uInt hash_bits;      /* log2(hash_size) */
    uInt hash_mask;      /* hash_size-1 */

    uInt hash_shift;
    /* Number of bits by which ins_h must be shifted at each input
     * step. It must be such that after MIN_MATCH steps, the oldest
     * byte no longer takes part in the hash key, that is:
     *   hash_shift * MIN_MATCH >= hash_bits
     */

    long block_start;
    /* Window position at the beginning of the current output block. Gets
     * negative when the window is moved backwards.
     */

    uInt match_length;           /* length of best match */
    IPos prev_match;             /* previous match */
    int match_available;         /* set if previous match exists */
    uInt strstart;               /* start of string to insert */
    uInt match_start;            /* start of matching string */
    uInt lookahead;              /* number of valid bytes ahead in window */

    uInt prev_length;
    /* Length of the best match at previous step. Matches not greater than this
     * are discarded. This is used in the lazy match evaluation.
     */

    uInt max_chain_length;
    /* To speed up deflation, hash chains are never searched beyond this
     * length.  A higher limit improves compression ratio but degrades the
     * speed.
     */

    uInt max_lazy_match;
    /* Attempt to find a better match only when the current match is strictly
     * smaller than this value. This mechanism is used only for compression
     * levels >= 4.
     */
#   define max_insert_length  max_lazy_match
    /* Insert new strings in the hash table only if the match length is not
     * greater than this length. This saves time but degrades compression.
     * max_insert_length is used only for compression levels <= 3.
     */

    int level;    /* compression level (1..9) */
    int strategy; /* favor or force Huffman coding*/

    uInt good_match;
    /* Use a faster search when the previous match is longer than this */

    int nice_match; /* Stop searching when current match exceeds this */

    /* used by trees.c: */
    /* Didn't use ct_data typedef below to suppress compiler warning */
    struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
    struct ct_data_s dyn_dtree[2 * D_CODES + 1]; /* distance tree */
    struct ct_data_s bl_tree[2 * BL_CODES + 1];  /* Huffman tree for bit lengths */

    struct tree_desc_s l_desc;               /* desc. for literal tree */
    struct tree_desc_s d_desc;               /* desc. for distance tree */
    struct tree_desc_s bl_desc;              /* desc. for bit length tree */

    ush bl_count[MAX_BITS + 1];
    /* number of codes at each bit length for an optimal tree */

    int heap[2 * L_CODES + 1];      /* heap used to build the Huffman trees */
    int heap_len;               /* number of elements in the heap */
    int heap_max;               /* element of largest frequency */
    /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
     * The same heap array is used to build all trees.
     */

    uch depth[2 * L_CODES + 1];
    /* Depth of each subtree used as tie breaker for trees of equal frequency
     */

    uchf *l_buf;          /* buffer for literals or lengths */

    uInt lit_bufsize;
    /* Size of match buffer for literals/lengths.  There are 4 reasons for
     * limiting lit_bufsize to 64K:
     *   - frequencies can be kept in 16 bit counters
     *   - if compression is not successful for the first block, all input
     *     data is still in the window so we can still emit a stored block even
     *     when input comes from standard input.  (This can also be done for
     *     all blocks if lit_bufsize is not greater than 32K.)
     *   - if compression is not successful for a file smaller than 64K, we can
     *     even emit a stored file instead of a stored block (saving 5 bytes).
     *     This is applicable only for zip (not gzip or zlib).
     *   - creating new Huffman trees less frequently may not provide fast
     *     adaptation to changes in the input data statistics. (Take for
     *     example a binary file with poorly compressible code followed by
     *     a highly compressible string table.) Smaller buffer sizes give
     *     fast adaptation but have of course the overhead of transmitting
     *     trees more frequently.
     *   - I can't count above 4
     */

    uInt last_lit;      /* running index in l_buf */

    ushf *d_buf;
    /* Buffer for distances. To simplify the code, d_buf and l_buf have
     * the same number of elements. To use different lengths, an extra flag
     * array would be necessary.
     */

    ulg opt_len;        /* bit length of current block with optimal trees */
    ulg static_len;     /* bit length of current block with static trees */
    uInt matches;       /* number of string matches in current block */
    uInt insert;        /* bytes at end of window left to insert */

#ifdef ZLIB_DEBUG
    ulg compressed_len; /* total bit length of compressed file mod 2^32 */
    ulg bits_sent;      /* bit length of compressed data sent mod 2^32 */
#endif

    ush bi_buf;
    /* Output buffer. bits are inserted starting at the bottom (least
     * significant bits).
     */
    int bi_valid;
    /* Number of valid bits in bi_buf.  All bits above the last valid bit
     * are always zero.
     */

    ulg high_water;
    /* High water mark offset in window for initialized bytes -- bytes above
     * this are set to zero in order to avoid memory check warnings when
     * longest match routines access bytes past the input.  This is then
     * updated to the new high water mark.
     */

} FAR deflate_state;

#define Z_NULL  0
#define ZLIB_VERSION "1.2.11"
#define ZLIB_VERNUM 0x12b0
#define ZLIB_VER_MAJOR 1
#define ZLIB_VER_MINOR 2
#define ZLIB_VER_REVISION 11
#define ZLIB_VER_SUBREVISION 0

#define Z_OK            0
#define Z_STREAM_END    1
#define Z_NEED_DICT     2
#define Z_ERRNO        (-1)
#define Z_STREAM_ERROR (-2)
#define Z_DATA_ERROR   (-3)
#define Z_MEM_ERROR    (-4)
#define Z_BUF_ERROR    (-5)
#define Z_VERSION_ERROR (-6)

static int next_ptr = 0;

typedef struct ptr_table_s {
    voidpf org_ptr;
    voidpf new_ptr;
} ptr_table;

void *myalloc(void *q, unsigned n, unsigned m) {
    (void) q;
    return calloc(n, m);
}

void myfree(void *q, void *p) {
    (void) q;
    free(p);
}

static alloc_func zalloc = myalloc;
static free_func zfree = myfree;

typedef enum {
    HEAD = 16180,   /* i: waiting for magic header */
    FLAGS,      /* i: waiting for method and flags (gzip) */
    TIME,       /* i: waiting for modification time (gzip) */
    OS,         /* i: waiting for extra flags and operating system (gzip) */
    EXLEN,      /* i: waiting for extra length (gzip) */
    EXTRA,      /* i: waiting for extra bytes (gzip) */
    NAME,       /* i: waiting for end of file name (gzip) */
    COMMENT,    /* i: waiting for end of comment (gzip) */
    HCRC,       /* i: waiting for header crc (gzip) */
    DICTID,     /* i: waiting for dictionary check value */
    DICT,       /* waiting for inflateSetDictionary() call */
    TYPE,       /* i: waiting for type bits, including last-flag bit */
    TYPEDO,     /* i: same, but skip check to exit inflate on new block */
    STORED,     /* i: waiting for stored size (length and complement) */
    COPY_,      /* i/o: same as COPY below, but only first time in */
    COPY,       /* i/o: waiting for input or output to copy stored block */
    TABLE,      /* i: waiting for dynamic block table lengths */
    LENLENS,    /* i: waiting for code length code lengths */
    CODELENS,   /* i: waiting for length/lit and distance code lengths */
    LEN_,       /* i: same as LEN below, but only first time in */
    LEN,        /* i: waiting for length/lit/eob code */
    LENEXT,     /* i: waiting for length extra bits */
    DIST,       /* i: waiting for distance code */
    DISTEXT,    /* i: waiting for distance extra bits */
    MATCH,      /* o: waiting for output space to copy string */
    LIT,        /* o: waiting for output space to write literal */
    CHECK,      /* i: waiting for 32-bit check value */
    LENGTH,     /* i: waiting for 32-bit length (gzip) */
    DONE,       /* finished check, done -- remain here until reset */
    BAD,        /* got a data error -- remain here until reset */
    MEM,        /* got an inflate() memory error -- remain here until reset */
    SYNC        /* looking for synchronization bytes to restart inflate() */
} inflate_mode;

#define ENOUGH_LENS 852
#define ENOUGH_DISTS 592
#define ENOUGH (ENOUGH_LENS+ENOUGH_DISTS)

typedef struct {
    unsigned char op;           /* operation, extra bits, table bits */
    unsigned char bits;         /* bits in this part of the code */
    unsigned short val;         /* offset in table or code value */
} code;

struct inflate_state {
    z_streamp strm;             /* pointer back to this zlib stream */
    inflate_mode mode;          /* current inflate mode */
    int last;                   /* true if processing last block */
    int wrap;                   /* bit 0 true for zlib, bit 1 true for gzip,
                                   bit 2 true to validate check value */
    int havedict;               /* true if dictionary provided */
    int flags;                  /* gzip header method and flags (0 if zlib) */
    unsigned dmax;              /* zlib header max distance (INFLATE_STRICT) */
    unsigned long check;        /* protected copy of check value */
    unsigned long total;        /* protected copy of output count */
    gz_headerp head;            /* where to save gzip header information */
    /* sliding window */
    unsigned wbits;             /* log base 2 of requested window size */
    unsigned wsize;             /* window size or zero if not using window */
    unsigned whave;             /* valid bytes in the window */
    unsigned wnext;             /* window write index */
    unsigned char FAR *window;  /* allocated sliding window, if needed */
    /* bit accumulator */
    unsigned long hold;         /* input bit accumulator */
    unsigned bits;              /* number of bits in "in" */
    /* for string and stored block copying */
    unsigned length;            /* literal or length of data to copy */
    unsigned offset;            /* distance back to copy string from */
    /* for table and code decoding */
    unsigned extra;             /* extra bits needed */
    /* fixed and dynamic code tables */
    code const FAR *lencode;    /* starting table for length/literal codes */
    code const FAR *distcode;   /* starting table for distance codes */
    unsigned lenbits;           /* index bits for lencode */
    unsigned distbits;          /* index bits for distcode */
    /* dynamic table building */
    unsigned ncode;             /* number of code length code lengths */
    unsigned nlen;              /* number of length code lengths */
    unsigned ndist;             /* number of distance code lengths */
    unsigned have;              /* number of code lengths in lens[] */
    code FAR *next;             /* next available space in codes[] */
    unsigned short lens[320];   /* temporary storage for code lengths */
    unsigned short work[288];   /* work area for code table building */
    code codes[ENOUGH];         /* space for code tables */
    int sane;                   /* if false, allow invalid distance too far */
    int back;                   /* bits back of last unprocessed length/lit */
    unsigned was;               /* initial length of match */
};

#define MAX_PTR 10

static ptr_table table[MAX_PTR];

voidpf zcalloc(voidpf opaque, unsigned items, unsigned size) {
    voidpf buf;
    ulg bsize = (ulg) items * size;

    (void) opaque;

    /* If we allocate less than 65520 bytes, we assume that farmalloc
     * will return a usable pointer which doesn't have to be normalized.
     */
    if (bsize < 65520L) {
        buf = malloc(bsize);
        if (*(ush *) &buf != 0) return buf;
    } else {
        buf = malloc(bsize + 16L);
    }
    if (buf == NULL || next_ptr >= MAX_PTR) return NULL;
    table[next_ptr].org_ptr = buf;

    /* Normalize the pointer to seg:0 */
    *((ush *) &buf + 1) += ((ush) *((uch *) buf - 0) + 15) >> 4;
    *(ush *) &buf = 0;
    table[next_ptr++].new_ptr = buf;
    return buf;
}

#define ZALLOC(strm, items, size) \
           (*((strm)->zalloc))((strm)->opaque, (items), (size))
#define ZFREE(strm, addr)  (*((strm)->zfree))((strm)->opaque, (voidpf)(addr))
#define TRY_FREE(s, p) {if (p) ZFREE(s, p);}

static int inflateStateCheck(z_streamp strm) {
    struct inflate_state FAR *state;
    if (strm == Z_NULL ||
        strm->zalloc == (alloc_func) 0 || strm->zfree == (free_func) 0)
        return 1;
    state = (struct inflate_state FAR *) strm->state;
    if (state == Z_NULL || state->strm != strm ||
        state->mode < HEAD || state->mode > SYNC)
        return 1;
    return 0;
}

int inflateResetKeep(z_streamp strm) {
    struct inflate_state FAR *state;

    if (inflateStateCheck(strm)) return Z_STREAM_ERROR;
    state = (struct inflate_state FAR *) strm->state;
    strm->total_in = strm->total_out = state->total = 0;
    strm->msg = Z_NULL;
    if (state->wrap)        /* to support ill-conceived Java test suite */
        strm->adler = state->wrap & 1;
    state->mode = HEAD;
    state->last = 0;
    state->havedict = 0;
    state->dmax = 32768U;
    state->head = Z_NULL;
    state->hold = 0;
    state->bits = 0;
    state->lencode = state->distcode = state->next = state->codes;
    state->sane = 1;
    state->back = -1;
    return Z_OK;
}

int inflateReset(z_streamp strm) {
    struct inflate_state FAR *state;

    if (inflateStateCheck(strm)) return Z_STREAM_ERROR;
    state = (struct inflate_state FAR *) strm->state;
    state->wsize = 0;
    state->whave = 0;
    state->wnext = 0;
    return inflateResetKeep(strm);
}

int inflateReset2(z_streamp strm, int windowBits) {
    int wrap;
    struct inflate_state FAR *state;

/* get the state */
    if (inflateStateCheck(strm)) return Z_STREAM_ERROR;
    state = (struct inflate_state FAR *) strm->state;

/* extract wrap request from windowBits parameter */
    if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
    } else {
        wrap = (windowBits >> 4) + 5;
#ifdef GUNZIP
        if (windowBits < 48)
                    windowBits &= 15;
#endif
    }

/* set number of window bits, free window if different */
    if (windowBits && (windowBits < 8 || windowBits > 15))
        return Z_STREAM_ERROR;
    if (state->window != Z_NULL && state->wbits != (unsigned) windowBits) {
        ZFREE(strm, state->window);
        state->window = Z_NULL;
    }

/* update state and reset the rest of it */
    state->wrap = wrap;
    state->wbits = (unsigned) windowBits;
    return inflateReset(strm);
}

int inflateInit2_(
        z_streamp strm,
        int windowBits,
        const char *version,
        int stream_size) {
    int ret;
    struct inflate_state FAR *state;

    if (version == Z_NULL || version[0] != ZLIB_VERSION[0] ||
        stream_size != (int) (sizeof(z_stream)))
        return Z_VERSION_ERROR;
    if (strm == Z_NULL) return Z_STREAM_ERROR;
    strm->msg = Z_NULL;                 /* in case we return an error */
    if (strm->zalloc == (alloc_func) nullptr) {
#ifdef Z_SOLO
        return Z_STREAM_ERROR;
#else
        strm->zalloc = zcalloc;
        strm->opaque = (voidpf) nullptr;
#endif
    }
    if (strm->zfree == (free_func) nullptr)
#ifdef Z_SOLO
        return Z_STREAM_ERROR;
#else
        strm->zfree = zfree;
#endif
    state = (struct inflate_state FAR *)
            ZALLOC(strm, 1, sizeof(struct inflate_state));
    if (state == Z_NULL) return Z_MEM_ERROR;
    strm->state = (struct internal_state FAR *) state;
    state->strm = strm;
    state->window = Z_NULL;
    state->mode = HEAD;     /* to pass state test in inflateReset2() */
    ret = inflateReset2(strm, windowBits);
    if (ret != Z_OK) {
        ZFREE(strm, state);
        strm->state = Z_NULL;
    }
    return ret;
}

#ifndef MAX_WBITS
#  define MAX_WBITS   15 /* 32K LZ77 window */
#endif

#ifndef DEF_WBITS
#  define DEF_WBITS MAX_WBITS
#endif

int inflateInit_(
        z_streamp strm,
        const char *version,
        int stream_size) {
    return inflateInit2_(strm, DEF_WBITS, version, stream_size);
}

#define LOAD() \
    do { \
        put = strm->next_out; \
        left = strm->avail_out; \
        next = strm->next_in; \
        have = strm->avail_in; \
        hold = state->hold; \
        bits = state->bits; \
    } while (0)

/* Restore state from registers in inflate() */
#define RESTORE() \
    do { \
        strm->next_out = put; \
        strm->avail_out = left; \
        strm->next_in = next; \
        strm->avail_in = have; \
        state->hold = hold; \
        state->bits = bits; \
    } while (0)

/* Clear the input bit accumulator */
#define INITBITS() \
    do { \
        hold = 0; \
        bits = 0; \
    } while (0)

/* Get a byte of input into the bit accumulator, or return from inflate()
   if there is no input available. */
#define PULLBYTE() \
    do { \
        if (have == 0) goto inf_leave; \
        have--; \
        hold += (unsigned long)(*next++) << bits; \
        bits += 8; \
    } while (0)

/* Assure that there are at least n bits in the bit accumulator.  If there is
   not enough available input to do that, then return from inflate(). */
#define NEEDBITS(n) \
    do { \
        while (bits < (unsigned)(n)) \
            PULLBYTE(); \
    } while (0)

/* Return the low n bits of the bit accumulator (n < 16) */
#define BITS(n) \
    ((unsigned)hold & ((1U << (n)) - 1))

/* Remove n bits from the bit accumulator */
#define DROPBITS(n) \
    do { \
        hold >>= (n); \
        bits -= (unsigned)(n); \
    } while (0)

/* Remove zero to seven bits as needed to go to a byte boundary */
#define BYTEBITS() \
    do { \
        hold >>= bits & 7; \
        bits -= bits & 7; \
    } while (0)

#define Z_DEFLATED   8

#define BASE 65521U     /* largest prime smaller than 65536 */
#define NMAX 5552
/* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */

#define DO1(buf, i)  {adler += (buf)[i]; sum2 += adler;}
#define DO2(buf, i)  DO1(buf,i); DO1(buf,i+1);
#define DO4(buf, i)  DO2(buf,i); DO2(buf,i+2);
#define DO8(buf, i)  DO4(buf,i); DO4(buf,i+4);
#define DO16(buf)   DO8(buf,0); DO8(buf,8);

/* use NO_DIVIDE if your processor does not do division in hardware --
   try it both ways to see which is faster */
#ifdef NO_DIVIDE
/* note that this assumes BASE is 65521, where 65536 % 65521 == 15
   (thank you to John Reiser for pointing this out) */
#  define CHOP(a) \
    do { \
        unsigned long tmp = a >> 16; \
        a &= 0xffffUL; \
        a += (tmp << 4) - tmp; \
    } while (0)
#  define MOD28(a) \
    do { \
        CHOP(a); \
        if (a >= BASE) a -= BASE; \
    } while (0)
#  define MOD(a) \
    do { \
        CHOP(a); \
        MOD28(a); \
    } while (0)
#  define MOD63(a) \
    do { /* this assumes a is not negative */ \
        z_off64_t tmp = a >> 32; \
        a &= 0xffffffffL; \
        a += (tmp << 8) - (tmp << 5) + tmp; \
        tmp = a >> 16; \
        a &= 0xffffL; \
        a += (tmp << 4) - tmp; \
        tmp = a >> 16; \
        a &= 0xffffL; \
        a += (tmp << 4) - tmp; \
        if (a >= BASE) a -= BASE; \
    } while (0)
#else
#  define MOD(a) a %= BASE
#  define MOD28(a) a %= BASE
#  define MOD63(a) a %= BASE
#endif

typedef unsigned long z_size_t;

/* ========================================================================= */
uLong adler32_z(uLong adler, const Bytef *buf, z_size_t len) {
    unsigned long sum2;
    unsigned n;

/* split Adler-32 into component sums */
    sum2 = (adler >> 16) & 0xffff;
    adler &= 0xffff;

/* in case user likes doing a byte at a time, keep it fast */
    if (len == 1) {
        adler += buf[0];
        if (adler >= BASE)
            adler -= BASE;
        sum2 += adler;
        if (sum2 >= BASE)
            sum2 -= BASE;
        return adler | (sum2 << 16);
    }

/* initial Adler-32 value (deferred check for len == 1 speed) */
    if (buf == Z_NULL)
        return 1L;

/* in case short lengths are provided, keep it somewhat fast */
    if (len < 16) {
        while (len--) {
            adler += *buf++;
            sum2 += adler;
        }
        if (adler >= BASE)
            adler -= BASE;
        MOD28(sum2);            /* only added so many BASE's */
        return adler | (sum2 << 16);
    }

/* do length NMAX blocks -- requires just one modulo operation */
    while (len >= NMAX) {
        len -= NMAX;
        n = NMAX / 16;          /* NMAX is divisible by 16 */
        do {
            DO16(buf);          /* 16 sums unrolled */
            buf += 16;
        } while (--n);
        MOD(adler);
        MOD(sum2);
    }

/* do remaining bytes (less than NMAX, still just one modulo) */
    if (len) {                  /* avoid modulos if none remaining */
        while (len >= 16) {
            len -= 16;
            DO16(buf);
            buf += 16;
        }
        while (len--) {
            adler += *buf++;
            sum2 += adler;
        }
        MOD(adler);
        MOD(sum2);
    }

/* return recombined sums */
    return adler | (sum2 << 16);
}

/* ========================================================================= */
uLong adler32(uLong adler, const Bytef *buf, uInt len) {
    return adler32_z(adler, buf, len);
}

#define ZSWAP32(q) ((((q) >> 24) & 0xff) + (((q) >> 8) & 0xff00) + \
                    (((q) & 0xff00) << 8) + (((q) & 0xff) << 24))

#define Z_NO_FLUSH      0
#define Z_PARTIAL_FLUSH 1
#define Z_SYNC_FLUSH    2
#define Z_FULL_FLUSH    3
#define Z_FINISH        4
#define Z_BLOCK         5
#define Z_TREES         6

static void fixedtables(struct inflate_state FAR *state) {
#ifdef BUILDFIXED
    static int virgin = 1;
        static code *lenfix, *distfix;
        static code fixed[544];

        /* build fixed huffman tables if first call (may not be thread safe) */
        if (virgin) {
            unsigned sym, bits;
            static code *next;

            /* literal/length table */
            sym = 0;
            while (sym < 144) state->lens[sym++] = 8;
            while (sym < 256) state->lens[sym++] = 9;
            while (sym < 280) state->lens[sym++] = 7;
            while (sym < 288) state->lens[sym++] = 8;
            next = fixed;
            lenfix = next;
            bits = 9;
            inflate_table(LENS, state->lens, 288, &(next), &(bits), state->work);

            /* distance table */
            sym = 0;
            while (sym < 32) state->lens[sym++] = 5;
            distfix = next;
            bits = 5;
            inflate_table(DISTS, state->lens, 32, &(next), &(bits), state->work);

            /* do this just once */
            virgin = 0;
        }
#else /* !BUILDFIXED */

#   include "inffixed.h"

#endif /* BUILDFIXED */
    state->lencode = lenfix;
    state->lenbits = 9;
    state->distcode = distfix;
    state->distbits = 5;
}

typedef enum {
    CODES,
    LENS,
    DISTS
} codetype;

#define MAXBITS 15

int ZLIB_INTERNAL inflate_table(codetype type, unsigned short FAR *lens, unsigned codes,
        code FAR *FAR *table, unsigned FAR *bits, unsigned short FAR *work) {
unsigned len;               /* a code's length in bits */
unsigned sym;               /* index of code symbols */
unsigned min, max;          /* minimum and maximum code lengths */
unsigned root;              /* number of index bits for root table */
unsigned curr;              /* number of index bits for current table */
unsigned drop;              /* code bits to drop for sub-table */
int left;                   /* number of prefix codes available */
unsigned used;              /* code entries in table used */
unsigned huff;              /* Huffman code */
unsigned incr;              /* for incrementing code, index */
unsigned fill;              /* index for replicating entries */
unsigned low;               /* low bits for current root entry */
unsigned mask;              /* mask for low root bits */
code here;                  /* table entry for duplication */
code FAR *next;             /* next available space in table */
const unsigned short FAR *base;     /* base value table to use */
const unsigned short FAR *extra;    /* extra bits table to use */
unsigned match;             /* use base and extra for symbol >= match */
unsigned short count[MAXBITS + 1];    /* number of codes of each length */
unsigned short offs[MAXBITS + 1];     /* offsets in table for each length */
static const unsigned short lbase[31] = { /* Length codes 257..285 base */
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0};
static const unsigned short lext[31] = { /* Length codes 257..285 extra */
        16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
        19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 77, 202};
static const unsigned short dbase[32] = { /* Distance codes 0..29 base */
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
        257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
        8193, 12289, 16385, 24577, 0, 0};
static const unsigned short dext[32] = { /* Distance codes 0..29 extra */
        16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
        23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
        28, 28, 29, 29, 64, 64};

/*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
 */

/* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
for (len = 0; len <= MAXBITS; len++)
count[len] = 0;
for (sym = 0; sym < codes; sym++)
count[lens[sym]]++;

/* bound code lengths, force root to be within code lengths */
root = *bits;
for (max = MAXBITS; max >= 1; max--)
if (count[max] != 0) break;
if (root > max) root = max;
if (max == 0) {                     /* no symbols to code at all */
here.op = (unsigned char) 64;    /* invalid code marker */
here.bits = (unsigned char) 1;
here.val = (unsigned short) 0;
*(*table)++ = here;             /* make a table to force an error */
*(*table)++ = here;
*bits = 1;
return 0;     /* no symbols, but wait for decoding to report error */
}
for (min = 1; min < max; min++)
if (count[min] != 0) break;
if (root < min) root = min;

/* check for an over-subscribed or incomplete set of lengths */
left = 1;
for (len = 1; len <= MAXBITS; len++) {
left <<= 1;
left -= count[len];
if (left < 0) return -1;        /* over-subscribed */
}
if (left > 0 && (type == CODES || max != 1))
return -1;                      /* incomplete set */

/* generate offsets into symbol table for each length for sorting */
offs[1] = 0;
for (len = 1; len < MAXBITS; len++)
offs[len + 1] = offs[len] + count[len];

/* sort symbols by length, by symbol order within each length */
for (sym = 0; sym < codes; sym++)
if (lens[sym] != 0) work[offs[lens[sym]]++] = (unsigned short) sym;

/*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
 */

/* set up for code type */
switch (type) {
case CODES:
base = extra = work;    /* dummy value--not used */
match = 20;
break;
case LENS:
base = lbase;
extra = lext;
match = 257;
break;
default:    /* DISTS */
base = dbase;
extra = dext;
match = 0;
}

/* initialize state for loop */
huff = 0;                   /* starting code */
sym = 0;                    /* starting code symbol */
len = min;                  /* starting code length */
next = *table;              /* current table to fill in */
curr = root;                /* current table index bits */
drop = 0;                   /* current bits to drop from code for index */
low = (unsigned) (-1);       /* trigger new sub-table when len > root */
used = 1U << root;          /* use root table entries */
mask = used - 1;            /* mask for comparing low */

/* check available table space */
if ((type == LENS && used > ENOUGH_LENS) ||
(type == DISTS && used > ENOUGH_DISTS))
return 1;

/* process all codes and make table entries */
for (;;) {
/* create table entry */
here.bits = (unsigned char) (len - drop);
if (work[sym] + 1U < match) {
here.op = (unsigned char) 0;
here.val = work[sym];
} else if (work[sym] >= match) {
here.op = (unsigned char) (extra[work[sym] - match]);
here.val = base[work[sym] - match];
} else {
here.op = (unsigned char) (32 + 64);         /* end of block */
here.val = 0;
}

/* replicate for those indices with low len bits equal to huff */
incr = 1U << (len - drop);
fill = 1U << curr;
min = fill;                 /* save offset to next table */
do {
fill -= incr;
next[(huff >> drop) + fill] = here;
} while (fill != 0);

/* backwards increment the len-bit code huff */
incr = 1U << (len - 1);
while (huff & incr)
incr >>= 1;
if (incr != 0) {
huff &= incr - 1;
huff += incr;
} else
huff = 0;

/* go to next symbol, update count, len */
sym++;
if (--(count[len]) == 0) {
if (len == max) break;
len = lens[work[sym]];
}

/* create new sub-table if needed */
if (len > root && (huff & mask) != low) {
/* if first time, transition to sub-tables */
if (drop == 0)
drop = root;

/* increment past last table */
next += min;            /* here min is 1 << curr */

/* determine length of next table */
curr = len - drop;
left = (int) (1 << curr);
while (curr + drop < max) {
left -= count[curr + drop];
if (left <= 0) break;
curr++;
left <<= 1;
}

/* check for enough space */
used += 1U << curr;
if ((type == LENS && used > ENOUGH_LENS) ||
(type == DISTS && used > ENOUGH_DISTS))
return 1;

/* point entry in root table to sub-table */
low = huff & mask;
(*table)[low].op = (unsigned char) curr;
(*table)[low].bits = (unsigned char) root;
(*table)[low].val = (unsigned short) (next - *table);
}
}

/* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
if (huff != 0) {
here.op = (unsigned char) 64;            /* invalid code marker */
here.bits = (unsigned char) (len - drop);
here.val = (unsigned short) 0;
next[huff] = here;
}

/* set return parameters */
*table += used;
*bits = root;
return 0;
}

void inflate_fast(z_streamp strm, unsigned start)         /* inflate()'s starting value for strm->avail_out */
{
    struct inflate_state FAR *state;
    unsigned char FAR *in;      /* local strm->next_in */
    unsigned char FAR *last;    /* have enough input while in < last */
    unsigned char FAR *out;     /* local strm->next_out */
    unsigned char FAR *beg;     /* inflate()'s initial strm->next_out */
    unsigned char FAR *end;     /* while out < end, enough space available */
#ifdef INFLATE_STRICT
    unsigned dmax;              /* maximum distance from zlib header */
#endif
    unsigned wsize;             /* window size or zero if not using window */
    unsigned whave;             /* valid bytes in the window */
    unsigned wnext;             /* window write index */
    unsigned char FAR *window;  /* allocated sliding window, if wsize != 0 */
    unsigned long hold;         /* local strm->hold */
    unsigned bits;              /* local strm->bits */
    code const FAR *lcode;      /* local strm->lencode */
    code const FAR *dcode;      /* local strm->distcode */
    unsigned lmask;             /* mask for first level of length codes */
    unsigned dmask;             /* mask for first level of distance codes */
    code here;                  /* retrieved table entry */
    unsigned op;                /* code bits, operation, extra bits, or */
/*  window position, window bytes to copy */
    unsigned len;               /* match length, unused bytes */
    unsigned dist;              /* match distance */
    unsigned char FAR *from;    /* where to copy match from */

/* copy state to local variables */
    state = (struct inflate_state FAR *) strm->state;
    in = strm->next_in;
    last = in + (strm->avail_in - 5);
    out = strm->next_out;
    beg = out - (start - strm->avail_out);
    end = out + (strm->avail_out - 257);
#ifdef INFLATE_STRICT
    dmax = state->dmax;
#endif
    wsize = state->wsize;
    whave = state->whave;
    wnext = state->wnext;
    window = state->window;
    hold = state->hold;
    bits = state->bits;
    lcode = state->lencode;
    dcode = state->distcode;
    lmask = (1U << state->lenbits) - 1;
    dmask = (1U << state->distbits) - 1;

/* decode literals and length/distances until end-of-block or not enough
   input data or output space */
    do {
        if (bits < 15) {
            hold += (unsigned long) (*in++) << bits;
            bits += 8;
            hold += (unsigned long) (*in++) << bits;
            bits += 8;
        }
        here = lcode[hold & lmask];
        dolen:
        op = (unsigned) (here.bits);
        hold >>= op;
        bits -= op;
        op = (unsigned) (here.op);
        if (op == 0) {                          /* literal */
            *out++ = (unsigned char) (here.val);
        } else if (op & 16) {                     /* length base */
            len = (unsigned) (here.val);
            op &= 15;                           /* number of extra bits */
            if (op) {
                if (bits < op) {
                    hold += (unsigned long) (*in++) << bits;
                    bits += 8;
                }
                len += (unsigned) hold & ((1U << op) - 1);
                hold >>= op;
                bits -= op;
            }
            if (bits < 15) {
                hold += (unsigned long) (*in++) << bits;
                bits += 8;
                hold += (unsigned long) (*in++) << bits;
                bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
            op = (unsigned) (here.bits);
            hold >>= op;
            bits -= op;
            op = (unsigned) (here.op);
            if (op & 16) {                      /* distance base */
                dist = (unsigned) (here.val);
                op &= 15;                       /* number of extra bits */
                if (bits < op) {
                    hold += (unsigned long) (*in++) << bits;
                    bits += 8;
                    if (bits < op) {
                        hold += (unsigned long) (*in++) << bits;
                        bits += 8;
                    }
                }
                dist += (unsigned) hold & ((1U << op) - 1);
#ifdef INFLATE_STRICT
                if (dist > dmax) {
                                    strm->msg = (char *)"invalid distance too far back";
                                    state->mode = BAD;
                                    break;
                                }
#endif
                hold >>= op;
                bits -= op;
                op = (unsigned) (out - beg);     /* max distance in output */
                if (dist > op) {                /* see if copy from window */
                    op = dist - op;             /* distance back in window */
                    if (op > whave) {
                        if (state->sane) {
                            strm->msg =
                                    (char *) "invalid distance too far back";
                            state->mode = BAD;
                            break;
                        }
#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                        if (len <= op - whave) {
                                                    do {
                                                        *out++ = 0;
                                                    } while (--len);
                                                    continue;
                                                }
                                                len -= op - whave;
                                                do {
                                                    *out++ = 0;
                                                } while (--op > whave);
                                                if (op == 0) {
                                                    from = out - dist;
                                                    do {
                                                        *out++ = *from++;
                                                    } while (--len);
                                                    continue;
                                                }
#endif
                    }
                    from = window;
                    if (wnext == 0) {           /* very common case */
                        from += wsize - op;
                        if (op < len) {         /* some from window */
                            len -= op;
                            do {
                                *out++ = *from++;
                            } while (--op);
                            from = out - dist;  /* rest from output */
                        }
                    } else if (wnext < op) {      /* wrap around window */
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {         /* some from end of window */
                            len -= op;
                            do {
                                *out++ = *from++;
                            } while (--op);
                            from = window;
                            if (wnext < len) {  /* some from start of window */
                                op = wnext;
                                len -= op;
                                do {
                                    *out++ = *from++;
                                } while (--op);
                                from = out - dist;      /* rest from output */
                            }
                        }
                    } else {                      /* contiguous in window */
                        from += wnext - op;
                        if (op < len) {         /* some from window */
                            len -= op;
                            do {
                                *out++ = *from++;
                            } while (--op);
                            from = out - dist;  /* rest from output */
                        }
                    }
                    while (len > 2) {
                        *out++ = *from++;
                        *out++ = *from++;
                        *out++ = *from++;
                        len -= 3;
                    }
                    if (len) {
                        *out++ = *from++;
                        if (len > 1)
                            *out++ = *from++;
                    }
                } else {
                    from = out - dist;          /* copy direct from output */
                    do {                        /* minimum length is three */
                        *out++ = *from++;
                        *out++ = *from++;
                        *out++ = *from++;
                        len -= 3;
                    } while (len > 2);
                    if (len) {
                        *out++ = *from++;
                        if (len > 1)
                            *out++ = *from++;
                    }
                }
            } else if ((op & 64) == 0) {          /* 2nd level distance code */
                here = dcode[here.val + (hold & ((1U << op) - 1))];
                goto dodist;
            } else {
                strm->msg = (char *) "invalid distance code";
                state->mode = BAD;
                break;
            }
        } else if ((op & 64) == 0) {              /* 2nd level length code */
            here = lcode[here.val + (hold & ((1U << op) - 1))];
            goto dolen;
        } else if (op & 32) {                     /* end-of-block */
            state->mode = TYPE;
            break;
        } else {
            strm->msg = (char *) "invalid literal/length code";
            state->mode = BAD;
            break;
        }
    } while (in < last && out < end);

/* return unused bytes (on entry, bits < 8, so in won't go too far back) */
    len = bits >> 3;
    in -= len;
    bits -= len << 3;
    hold &= (1U << bits) - 1;

/* update state and return */
    strm->next_in = in;
    strm->next_out = out;
    strm->avail_in = (unsigned) (in < last ? 5 + (last - in) : 5 - (in - last));
    strm->avail_out = (unsigned) (out < end ?
                                  257 + (end - out) : 257 - (out - end));
    state->hold = hold;
    state->bits = bits;
}

#ifdef GUNZIP
#  define UPDATE(check, buf, len) \
    (state->flags ? crc32(check, buf, len) : adler32(check, buf, len))
#else
#  define UPDATE(check, buf, len) adler32(check, buf, len)
#endif

static int updatewindow(z_streamp strm, const Bytef *end, unsigned copy) {
    struct inflate_state FAR *state;
    unsigned dist;

    state = (struct inflate_state FAR *) strm->state;

/* if it hasn't been done already, allocate space for the window */
    if (state->window == Z_NULL) {
        state->window = (unsigned char FAR *)
                ZALLOC(strm, 1U << state->wbits,
                       sizeof(unsigned char));
        if (state->window == Z_NULL) return 1;
    }

/* if window not in use yet, initialize */
    if (state->wsize == 0) {
        state->wsize = 1U << state->wbits;
        state->wnext = 0;
        state->whave = 0;
    }

/* copy state->wsize or less output bytes into the circular window */
    if (copy >= state->wsize) {
        memcpy(state->window, end - state->wsize, state->wsize);
        state->wnext = 0;
        state->whave = state->wsize;
    } else {
        dist = state->wsize - state->wnext;
        if (dist > copy) dist = copy;
        memcpy(state->window + state->wnext, end - copy, dist);
        copy -= dist;
        if (copy) {
            memcpy(state->window, end - copy, copy);
            state->wnext = copy;
            state->whave = state->wsize;
        } else {
            state->wnext += dist;
            if (state->wnext == state->wsize) state->wnext = 0;
            if (state->whave < state->wsize) state->whave += dist;
        }
    }
    return 0;
}

int inflate(z_streamp strm, int flush) {
    struct inflate_state FAR *state;
    unsigned char FAR *next;    /* next input */
    unsigned char FAR *put;     /* next output */
    unsigned have, left;        /* available input and output */
    unsigned long hold;         /* bit buffer */
    unsigned bits;              /* bits in bit buffer */
    unsigned in, out;           /* save starting available input and output */
    unsigned copy;              /* number of stored or match bytes to copy */
    unsigned char FAR *from;    /* where to copy match bytes from */
    code here;                  /* current decoding table entry */
    code last;                  /* parent table entry */
    unsigned len;               /* length to copy for repeats, bits to drop */
    int ret;                    /* return code */
#ifdef GUNZIP
    unsigned char hbuf[4];      /* buffer for gzip header crc calculation */
#endif
    static const unsigned short order[19] = /* permutation of code lengths */
            {16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15};

    if (inflateStateCheck(strm) || strm->next_out == Z_NULL ||
        (strm->next_in == Z_NULL && strm->avail_in != 0))
        return Z_STREAM_ERROR;

    state = (struct inflate_state FAR *) strm->state;
    if (state->mode == TYPE) state->mode = TYPEDO;      /* skip check */
    LOAD();
    in = have;
    out = left;
    ret = Z_OK;
    for (;;)
        switch (state->mode) {
            case HEAD:
                if (state->wrap == 0) {
                    state->mode = TYPEDO;
                    break;
                }
                NEEDBITS(16);
#ifdef GUNZIP
                if ((state->wrap & 2) && hold == 0x8b1f) {  /* gzip header */
                                if (state->wbits == 0)
                                    state->wbits = 15;
                                state->check = crc32(0L, Z_NULL, 0);
                                CRC2(state->check, hold);
                                INITBITS();
                                state->mode = FLAGS;
                                break;
                            }
                            state->flags = 0;           /* expect zlib header */
                            if (state->head != Z_NULL)
                                state->head->done = -1;
                            if (!(state->wrap & 1) ||   /* check if zlib header allowed */
#else
                if (
#endif
((BITS(8) << 8) + (hold >> 8)) % 31) {
                    strm->msg = (char *) "incorrect header check";
                    state->mode = BAD;
                    break;
                }
                if (BITS(4) != Z_DEFLATED) {
                    strm->msg = (char *) "unknown compression method";
                    state->mode = BAD;
                    break;
                }
                DROPBITS(4);
                len = BITS(4) + 8;
                if (state->wbits == 0)
                    state->wbits = len;
                if (len > 15 || len > state->wbits) {
                    strm->msg = (char *) "invalid window size";
                    state->mode = BAD;
                    break;
                }
                state->dmax = 1U << len;
                strm->adler = state->check = adler32(0L, Z_NULL, 0);
                state->mode = hold & 0x200 ? DICTID : TYPE;
                INITBITS();
                break;
#ifdef GUNZIP
                case FLAGS:
                            NEEDBITS(16);
                            state->flags = (int)(hold);
                            if ((state->flags & 0xff) != Z_DEFLATED) {
                                strm->msg = (char *)"unknown compression method";
                                state->mode = BAD;
                                break;
                            }
                            if (state->flags & 0xe000) {
                                strm->msg = (char *)"unknown header flags set";
                                state->mode = BAD;
                                break;
                            }
                            if (state->head != Z_NULL)
                                state->head->text = (int)((hold >> 8) & 1);
                            if ((state->flags & 0x0200) && (state->wrap & 4))
                                CRC2(state->check, hold);
                            INITBITS();
                            state->mode = TIME;
                        case TIME:
                            NEEDBITS(32);
                            if (state->head != Z_NULL)
                                state->head->time = hold;
                            if ((state->flags & 0x0200) && (state->wrap & 4))
                                CRC4(state->check, hold);
                            INITBITS();
                            state->mode = OS;
                        case OS:
                            NEEDBITS(16);
                            if (state->head != Z_NULL) {
                                state->head->xflags = (int)(hold & 0xff);
                                state->head->os = (int)(hold >> 8);
                            }
                            if ((state->flags & 0x0200) && (state->wrap & 4))
                                CRC2(state->check, hold);
                            INITBITS();
                            state->mode = EXLEN;
                        case EXLEN:
                            if (state->flags & 0x0400) {
                                NEEDBITS(16);
                                state->length = (unsigned)(hold);
                                if (state->head != Z_NULL)
                                    state->head->extra_len = (unsigned)hold;
                                if ((state->flags & 0x0200) && (state->wrap & 4))
                                    CRC2(state->check, hold);
                                INITBITS();
                            }
                            else if (state->head != Z_NULL)
                                state->head->extra = Z_NULL;
                            state->mode = EXTRA;
                        case EXTRA:
                            if (state->flags & 0x0400) {
                                copy = state->length;
                                if (copy > have) copy = have;
                                if (copy) {
                                    if (state->head != Z_NULL &&
                                        state->head->extra != Z_NULL) {
                                        len = state->head->extra_len - state->length;
                                        zmemcpy(state->head->extra + len, next,
                                                len + copy > state->head->extra_max ?
                                                state->head->extra_max - len : copy);
                                    }
                                    if ((state->flags & 0x0200) && (state->wrap & 4))
                                        state->check = crc32(state->check, next, copy);
                                    have -= copy;
                                    next += copy;
                                    state->length -= copy;
                                }
                                if (state->length) goto inf_leave;
                            }
                            state->length = 0;
                            state->mode = NAME;
                        case NAME:
                            if (state->flags & 0x0800) {
                                if (have == 0) goto inf_leave;
                                copy = 0;
                                do {
                                    len = (unsigned)(next[copy++]);
                                    if (state->head != Z_NULL &&
                                            state->head->name != Z_NULL &&
                                            state->length < state->head->name_max)
                                        state->head->name[state->length++] = (Bytef)len;
                                } while (len && copy < have);
                                if ((state->flags & 0x0200) && (state->wrap & 4))
                                    state->check = crc32(state->check, next, copy);
                                have -= copy;
                                next += copy;
                                if (len) goto inf_leave;
                            }
                            else if (state->head != Z_NULL)
                                state->head->name = Z_NULL;
                            state->length = 0;
                            state->mode = COMMENT;
                        case COMMENT:
                            if (state->flags & 0x1000) {
                                if (have == 0) goto inf_leave;
                                copy = 0;
                                do {
                                    len = (unsigned)(next[copy++]);
                                    if (state->head != Z_NULL &&
                                            state->head->comment != Z_NULL &&
                                            state->length < state->head->comm_max)
                                        state->head->comment[state->length++] = (Bytef)len;
                                } while (len && copy < have);
                                if ((state->flags & 0x0200) && (state->wrap & 4))
                                    state->check = crc32(state->check, next, copy);
                                have -= copy;
                                next += copy;
                                if (len) goto inf_leave;
                            }
                            else if (state->head != Z_NULL)
                                state->head->comment = Z_NULL;
                            state->mode = HCRC;
                        case HCRC:
                            if (state->flags & 0x0200) {
                                NEEDBITS(16);
                                if ((state->wrap & 4) && hold != (state->check & 0xffff)) {
                                    strm->msg = (char *)"header crc mismatch";
                                    state->mode = BAD;
                                    break;
                                }
                                INITBITS();
                            }
                            if (state->head != Z_NULL) {
                                state->head->hcrc = (int)((state->flags >> 9) & 1);
                                state->head->done = 1;
                            }
                            strm->adler = state->check = crc32(0L, Z_NULL, 0);
                            state->mode = TYPE;
                            break;
#endif
            case DICTID:
                NEEDBITS(32);
                strm->adler = state->check = ZSWAP32(hold);
                INITBITS();
                state->mode = DICT;
            case DICT:
                if (state->havedict == 0) {
                    RESTORE();
                    return Z_NEED_DICT;
                }
                strm->adler = state->check = adler32(0L, Z_NULL, 0);
                state->mode = TYPE;
            case TYPE:
                if (flush == Z_BLOCK || flush == Z_TREES) goto inf_leave;
            case TYPEDO:
                if (state->last) {
                    BYTEBITS();
                    state->mode = CHECK;
                    break;
                }
                NEEDBITS(3);
                state->last = BITS(1);
                DROPBITS(1);
                switch (BITS(2)) {
                    case 0:                             /* stored block */
                        state->mode = STORED;
                        break;
                    case 1:                             /* fixed block */
                        fixedtables(state);
                        state->mode = LEN_;             /* decode codes */
                        if (flush == Z_TREES) {
                            DROPBITS(2);
                            goto inf_leave;
                        }
                        break;
                    case 2:                             /* dynamic block */
                        state->mode = TABLE;
                        break;
                    case 3:
                        strm->msg = (char *) "invalid block type";
                        state->mode = BAD;
                }
                DROPBITS(2);
                break;
            case STORED:
                BYTEBITS();                         /* go to byte boundary */
                NEEDBITS(32);
                if ((hold & 0xffff) != ((hold >> 16) ^ 0xffff)) {
                    strm->msg = (char *) "invalid stored block lengths";
                    state->mode = BAD;
                    break;
                }
                state->length = (unsigned) hold & 0xffff;
                INITBITS();
                state->mode = COPY_;
                if (flush == Z_TREES) goto inf_leave;
            case COPY_:
                state->mode = COPY;
            case COPY:
                copy = state->length;
                if (copy) {
                    if (copy > have) copy = have;
                    if (copy > left) copy = left;
                    if (copy == 0) goto inf_leave;
                    memcpy(put, next, copy);
                    have -= copy;
                    next += copy;
                    left -= copy;
                    put += copy;
                    state->length -= copy;
                    break;
                }
                state->mode = TYPE;
                break;
            case TABLE:
                NEEDBITS(14);
                state->nlen = BITS(5) + 257;
                DROPBITS(5);
                state->ndist = BITS(5) + 1;
                DROPBITS(5);
                state->ncode = BITS(4) + 4;
                DROPBITS(4);
#ifndef PKZIP_BUG_WORKAROUND
                if (state->nlen > 286 || state->ndist > 30) {
                    strm->msg = (char *) "too many length or distance symbols";
                    state->mode = BAD;
                    break;
                }
#endif
                state->have = 0;
                state->mode = LENLENS;
            case LENLENS:
                while (state->have < state->ncode) {
                    NEEDBITS(3);
                    state->lens[order[state->have++]] = (unsigned short) BITS(3);
                    DROPBITS(3);
                }
                while (state->have < 19)
                    state->lens[order[state->have++]] = 0;
                state->next = state->codes;
                state->lencode = (const code FAR *) (state->next);
                state->lenbits = 7;
                ret = inflate_table(CODES, state->lens, 19, &(state->next),
                                    &(state->lenbits), state->work);
                if (ret) {
                    strm->msg = (char *) "invalid code lengths set";
                    state->mode = BAD;
                    break;
                }
                state->have = 0;
                state->mode = CODELENS;
            case CODELENS:
                while (state->have < state->nlen + state->ndist) {
                    for (;;) {
                        here = state->lencode[BITS(state->lenbits)];
                        if ((unsigned) (here.bits) <= bits) break;
                        PULLBYTE();
                    }
                    if (here.val < 16) {
                        DROPBITS(here.bits);
                        state->lens[state->have++] = here.val;
                    } else {
                        if (here.val == 16) {
                            NEEDBITS(here.bits + 2);
                            DROPBITS(here.bits);
                            if (state->have == 0) {
                                strm->msg = (char *) "invalid bit length repeat";
                                state->mode = BAD;
                                break;
                            }
                            len = state->lens[state->have - 1];
                            copy = 3 + BITS(2);
                            DROPBITS(2);
                        } else if (here.val == 17) {
                            NEEDBITS(here.bits + 3);
                            DROPBITS(here.bits);
                            len = 0;
                            copy = 3 + BITS(3);
                            DROPBITS(3);
                        } else {
                            NEEDBITS(here.bits + 7);
                            DROPBITS(here.bits);
                            len = 0;
                            copy = 11 + BITS(7);
                            DROPBITS(7);
                        }
                        if (state->have + copy > state->nlen + state->ndist) {
                            strm->msg = (char *) "invalid bit length repeat";
                            state->mode = BAD;
                            break;
                        }
                        while (copy--)
                            state->lens[state->have++] = (unsigned short) len;
                    }
                }

/* handle error breaks in while */
                if (state->mode == BAD) break;

/* check for end-of-block code (better have one) */
                if (state->lens[256] == 0) {
                    strm->msg = (char *) "invalid code -- missing end-of-block";
                    state->mode = BAD;
                    break;
                }

/* build code tables -- note: do not change the lenbits or distbits
   values here (9 and 6) without reading the comments in inftrees.h
   concerning the ENOUGH constants, which depend on those values */
                state->next = state->codes;
                state->lencode = (const code FAR *) (state->next);
                state->lenbits = 9;
                ret = inflate_table(LENS, state->lens, state->nlen, &(state->next),
                                    &(state->lenbits), state->work);
                if (ret) {
                    strm->msg = (char *) "invalid literal/lengths set";
                    state->mode = BAD;
                    break;
                }
                state->distcode = (const code FAR *) (state->next);
                state->distbits = 6;
                ret = inflate_table(DISTS, state->lens + state->nlen, state->ndist,
                                    &(state->next), &(state->distbits), state->work);
                if (ret) {
                    strm->msg = (char *) "invalid distances set";
                    state->mode = BAD;
                    break;
                }
                state->mode = LEN_;
                if (flush == Z_TREES) goto inf_leave;
            case LEN_:
                state->mode = LEN;
            case LEN:
                if (have >= 6 && left >= 258) {
                    RESTORE();
                    inflate_fast(strm, out);
                    LOAD();
                    if (state->mode == TYPE)
                        state->back = -1;
                    break;
                }
                state->back = 0;
                for (;;) {
                    here = state->lencode[BITS(state->lenbits)];
                    if ((unsigned) (here.bits) <= bits) break;
                    PULLBYTE();
                }
                if (here.op && (here.op & 0xf0) == 0) {
                    last = here;
                    for (;;) {
                        here = state->lencode[last.val +
                                              (BITS(last.bits + last.op) >> last.bits)];
                        if ((unsigned) (last.bits + here.bits) <= bits) break;
                        PULLBYTE();
                    }
                    DROPBITS(last.bits);
                    state->back += last.bits;
                }
                DROPBITS(here.bits);
                state->back += here.bits;
                state->length = (unsigned) here.val;
                if ((int) (here.op) == 0) {
                    state->mode = LIT;
                    break;
                }
                if (here.op & 32) {
                    state->back = -1;
                    state->mode = TYPE;
                    break;
                }
                if (here.op & 64) {
                    strm->msg = (char *) "invalid literal/length code";
                    state->mode = BAD;
                    break;
                }
                state->extra = (unsigned) (here.op) & 15;
                state->mode = LENEXT;
            case LENEXT:
                if (state->extra) {
                    NEEDBITS(state->extra);
                    state->length += BITS(state->extra);
                    DROPBITS(state->extra);
                    state->back += state->extra;
                }
                state->was = state->length;
                state->mode = DIST;
            case DIST:
                for (;;) {
                    here = state->distcode[BITS(state->distbits)];
                    if ((unsigned) (here.bits) <= bits) break;
                    PULLBYTE();
                }
                if ((here.op & 0xf0) == 0) {
                    last = here;
                    for (;;) {
                        here = state->distcode[last.val +
                                               (BITS(last.bits + last.op) >> last.bits)];
                        if ((unsigned) (last.bits + here.bits) <= bits) break;
                        PULLBYTE();
                    }
                    DROPBITS(last.bits);
                    state->back += last.bits;
                }
                DROPBITS(here.bits);
                state->back += here.bits;
                if (here.op & 64) {
                    strm->msg = (char *) "invalid distance code";
                    state->mode = BAD;
                    break;
                }
                state->offset = (unsigned) here.val;
                state->extra = (unsigned) (here.op) & 15;
                state->mode = DISTEXT;
            case DISTEXT:
                if (state->extra) {
                    NEEDBITS(state->extra);
                    state->offset += BITS(state->extra);
                    DROPBITS(state->extra);
                    state->back += state->extra;
                }
#ifdef INFLATE_STRICT
                if (state->offset > state->dmax) {
                                strm->msg = (char *)"invalid distance too far back";
                                state->mode = BAD;
                                break;
                            }
#endif
                state->mode = MATCH;
            case MATCH:
                if (left == 0) goto inf_leave;
                copy = out - left;
                if (state->offset > copy) {         /* copy from window */
                    copy = state->offset - copy;
                    if (copy > state->whave) {
                        if (state->sane) {
                            strm->msg = (char *) "invalid distance too far back";
                            state->mode = BAD;
                            break;
                        }
#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                        Trace((stderr, "inflate.c too far\n"));
                                            copy -= state->whave;
                                            if (copy > state->length) copy = state->length;
                                            if (copy > left) copy = left;
                                            left -= copy;
                                            state->length -= copy;
                                            do {
                                                *put++ = 0;
                                            } while (--copy);
                                            if (state->length == 0) state->mode = LEN;
                                            break;
#endif
                    }
                    if (copy > state->wnext) {
                        copy -= state->wnext;
                        from = state->window + (state->wsize - copy);
                    } else
                        from = state->window + (state->wnext - copy);
                    if (copy > state->length) copy = state->length;
                } else {                              /* copy from output */
                    from = put - state->offset;
                    copy = state->length;
                }
                if (copy > left) copy = left;
                left -= copy;
                state->length -= copy;
                do {
                    *put++ = *from++;
                } while (--copy);
                if (state->length == 0) state->mode = LEN;
                break;
            case LIT:
                if (left == 0) goto inf_leave;
                *put++ = (unsigned char) (state->length);
                left--;
                state->mode = LEN;
                break;
            case CHECK:
                if (state->wrap) {
                    NEEDBITS(32);
                    out -= left;
                    strm->total_out += out;
                    state->total += out;
                    if ((state->wrap & 4) && out)
                        strm->adler = state->check =
                                UPDATE(state->check, put - out, out);
                    out = left;
                    if ((state->wrap & 4) && (
#ifdef GUNZIP
                                                     state->flags ? hold :
#endif
                                                     ZSWAP32(hold)) != state->check) {
                        strm->msg = (char *) "incorrect data check";
                        state->mode = BAD;
                        break;
                    }
                    INITBITS();
                }
#ifdef GUNZIP
                state->mode = LENGTH;
                        case LENGTH:
                            if (state->wrap && state->flags) {
                                NEEDBITS(32);
                                if (hold != (state->total & 0xffffffffUL)) {
                                    strm->msg = (char *)"incorrect length check";
                                    state->mode = BAD;
                                    break;
                                }
                                INITBITS();
                                Tracev((stderr, "inflate:   length matches trailer\n"));
                            }
#endif
                state->mode = DONE;
            case DONE:
                ret = Z_STREAM_END;
                goto inf_leave;
            case BAD:
                ret = Z_DATA_ERROR;
                goto inf_leave;
            case MEM:
                return Z_MEM_ERROR;
            case SYNC:
            default:
                return Z_STREAM_ERROR;
        }

/*
   Return from inflate(), updating the total counts and the check value.
   If there was no progress during the inflate() call, return a buffer
   error.  Call updatewindow() to create and/or update the window state.
   Note: a memory error from inflate() is non-recoverable.
 */
    inf_leave:
    RESTORE();
    if (state->wsize || (out != strm->avail_out && state->mode < BAD &&
                         (state->mode < CHECK || flush != Z_FINISH)))
        if (updatewindow(strm, strm->next_out, out - strm->avail_out)) {
            state->mode = MEM;
            return Z_MEM_ERROR;
        }
    in -= strm->avail_in;
    out -= strm->avail_out;
    strm->total_in += in;
    strm->total_out += out;
    state->total += out;
    if ((state->wrap & 4) && out)
        strm->adler = state->check =
                UPDATE(state->check, strm->next_out - out, out);
    strm->data_type = (int) state->bits + (state->last ? 64 : 0) +
                      (state->mode == TYPE ? 128 : 0) +
                      (state->mode == LEN_ || state->mode == COPY_ ? 256 : 0);
    if (((in == 0 && out == 0) || flush == Z_FINISH) && ret == Z_OK)
        ret = Z_BUF_ERROR;
    return ret;
}

int inflateEnd(z_streamp strm) {
    struct inflate_state FAR *state;
    if (inflateStateCheck(strm))
        return Z_STREAM_ERROR;
    state = (struct inflate_state FAR *) strm->state;
    if (state->window != Z_NULL) ZFREE(strm, state->window);
    ZFREE(strm, strm->state);
    strm->state = Z_NULL;
    return Z_OK;
}

int uncompress2(
        Bytef *dest,
        uLongf *destLen,
        const Bytef *source,
        uLong *sourceLen) {
    z_stream stream;
    int err;
    const uInt max = (uInt) -1;
    uLong len, left;
    Byte buf[1];    /* for detection of incomplete stream when *destLen == 0 */

    len = *sourceLen;
    if (*destLen) {
        left = *destLen;
        *destLen = 0;
    } else {
        left = 1;
        dest = buf;
    }

    stream.next_in = (Bytef *) source;
    stream.avail_in = 0;
    stream.zalloc = (alloc_func) nullptr;
    stream.zfree = (free_func) nullptr;
    stream.opaque = (voidpf) nullptr;

    err = inflateInit_(&stream, ZLIB_VERSION, (int)sizeof(z_stream));
    if (err != Z_OK) return err;

    stream.next_out = dest;
    stream.avail_out = 0;

    do {
        if (stream.avail_out == 0) {
            stream.avail_out = left > (uLong) max ? max : (uInt) left;
            left -= stream.avail_out;
        }
        if (stream.avail_in == 0) {
            stream.avail_in = len > (uLong) max ? max : (uInt) len;
            len -= stream.avail_in;
        }
        err = inflate(&stream, Z_NO_FLUSH);
    } while (err == Z_OK);

    *sourceLen -= len + stream.avail_in;
    if (dest != buf)
        *destLen = stream.total_out;
    else if (stream.total_out && err == Z_BUF_ERROR)
        left = 1;

    inflateEnd(&stream);
    return err == Z_STREAM_END ? Z_OK :
           err == Z_NEED_DICT ? Z_DATA_ERROR :
           err == Z_BUF_ERROR && left + stream.avail_out ? Z_DATA_ERROR :
           err;
}

int uncompress(
        Bytef *dest,
        uLongf *destLen,
        const Bytef *source,
        uLong sourceLen) {
    return uncompress2(dest, destLen, source, &sourceLen);
}

#endif //GITPARSING_FULL_ZLIB_H
