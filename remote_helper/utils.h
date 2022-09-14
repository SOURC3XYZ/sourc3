/*
 * Copyright 2021-2022 SOURC3 Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <cstdint>
#include <vector>
#include <string>

namespace sourc3 {
using ByteBuffer = std::vector<uint8_t>;

std::string ToHex(const void* p, size_t size);

ByteBuffer Compress(const ByteBuffer& buffer);
ByteBuffer Compress(const uint8_t* data, size_t size);
ByteBuffer DeCompress(const ByteBuffer& buffer);

}  // namespace sourc3
