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

namespace sourc3 {
std::string ToHex(const void* p, size_t size) {
    std::string res;
    res.reserve(size * 2);
    const uint8_t* pp = static_cast<const uint8_t*>(p);
    boost::algorithm::hex(pp, pp + size, std::back_inserter(res));
    return res;
}

ByteBuffer StringToByteBuffer(const std::string& str) {
    ByteBuffer buffer(str.size());
    std::move(str.begin(), str.end(), buffer.begin());
    return buffer;
}

std::string ByteBufferToString(const ByteBuffer& buffer) {
    return std::string(buffer.begin(), buffer.end());
}
}  // namespace sourc3
