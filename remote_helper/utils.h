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
#include <memory>

#include <boost/json/value.hpp>
#include <boost/json/string_view.hpp>
#include <boost/algorithm/hex.hpp>

namespace sourc3 {
using ByteBuffer = std::vector<uint8_t>;

std::string ToHex(const void* p, size_t size);
ByteBuffer StringToByteBuffer(const std::string& str);
std::string ByteBufferToString(const ByteBuffer& buffer);

struct IProgressReporter {
public:
    virtual ~IProgressReporter() = default;

    virtual void UpdateProgress(size_t done) = 0;

    virtual void AddProgress(size_t done) = 0;

    virtual void Done() = 0;

    virtual void Failed(const std::string& failure) = 0;

    virtual void StopProgress(std::string_view result) = 0;
};

enum class ReporterType { NoOp, Progress };

std::unique_ptr<IProgressReporter> MakeProgress(std::string_view title, size_t total,
                                                ReporterType type);

boost::json::value ParseJsonAndTest(boost::json::string_view sv);

template <typename String>
ByteBuffer FromHex(const String& s) {
    ByteBuffer res;
    res.reserve(s.size() / 2);
    boost::algorithm::unhex(s.begin(), s.end(), std::back_inserter(res));
    return res;
}
}  // namespace sourc3
