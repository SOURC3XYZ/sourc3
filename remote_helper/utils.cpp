// Copyright 2021-2022 SOURC3 Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "utils.h"

#include <boost/algorithm/hex.hpp>

#include <iterator>

#include "zlib.h"

namespace sourc3 {
std::string ToHex(const void* p, size_t size) {
    std::string res;
    res.reserve(size * 2);
    const uint8_t* pp = static_cast<const uint8_t*>(p);
    boost::algorithm::hex(pp, pp + size, std::back_inserter(res));
    return res;
}

ByteBuffer Compress(const uint8_t* data, size_t size) {
    ByteBuffer compressed(size);
    uLongf compressed_size;
    auto error = compress2((Bytef*) compressed.data(), &compressed_size,
                           (Bytef*) data, size,
                           Z_BEST_COMPRESSION);
    if (error != F_OK) { // We cannot compress for some reason, use uncompressed
        return ByteBuffer{data, data + size};
    }
    return compressed;
}

ByteBuffer Compress(const ByteBuffer& buffer) {
    return Compress(buffer.data(), buffer.size());
}

ByteBuffer DeCompress(const ByteBuffer& buffer) {
    ByteBuffer uncompressed(buffer.size());
    uLongf uncompressed_size;
    auto error = uncompress((Bytef*) uncompressed.data(), &uncompressed_size,
                            (Bytef*) buffer.data(), buffer.size());
    if (error != F_OK) { // We cannot compress for some reason, use uncompressed
        return buffer;
    }
    return uncompressed;
}

}  // namespace sourc3
