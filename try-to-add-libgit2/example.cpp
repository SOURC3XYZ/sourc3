#include <iostream>
#include <cstring>
#include <fstream>
#include <vector>
#include "full_git.h"
#include "full_zlib.h"


int main() {
    Byte *uncompr;
    uLong comprLen = 10000*sizeof(int); /* don't overflow on MSDOS */
    uLong uncomprLen = comprLen;

    std::ifstream reader("../.git/objects/0e/f6a54ec48808e62b0d9ef01d8ac9ac14b7f356",
                         std::ios::binary);
    std::string commit_blob;
    std::string buffer(100, '\0');
    while (!reader.eof()) {
        size_t read = reader.readsome(buffer.data(), buffer.size());
        if (read == 0) {
            break;
        }
        buffer.resize(read);
        commit_blob += buffer;
    }

    uncompr  = (Byte*)calloc((uInt)uncomprLen, 1);
    uncompress(uncompr, &uncomprLen, (Byte*) commit_blob.data(), commit_blob.size());

    for (int i = 0; i < uncomprLen; ++i) {
        std::cout << (char) uncompr[i];
    }

    std::string val(uncompr, uncompr + uncomprLen);
    val = val.substr(val.find('\0') + 1);
    auto *commit = (mygit2::git_commit *) malloc(sizeof(mygit2::git_commit));
    commit_parse(commit, val.data(), val.size(), 0);
    std::cout << commit->raw_message << "\n" << commit->author->name;
    return 0;
}
