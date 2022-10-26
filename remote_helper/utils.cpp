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

#include <boost/json/parse.hpp>
#include <boost/json.hpp>

#include <iterator>
#include <sstream>
#include <iostream>

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

struct ProgressReporter final : IProgressReporter {
    ProgressReporter(std::string_view title, size_t total) : title_(title), total_(total) {
        UpdateProgress(0);
    }

    ~ProgressReporter() {
        if (failure_reason_.empty()) {
            Done();
        } else {
            StopProgress(failure_reason_);
        }
    }

    void UpdateProgress(size_t done) final {
        done_ = done;
        ShowProgress("\r");
    }

    void AddProgress(size_t done) final {
        done_ += done;
        ShowProgress("\r");
    }

    void Done() final {
        StopProgress("done");
    }

    void Failed(const std::string& failure) final {
        failure_reason_ = failure;
    }

    void StopProgress(std::string_view result) final {
        std::stringstream ss;
        ss << ", " << result << ".\n";
        ShowProgress(ss.str());
    }

private:
    std::string_view title_;
    std::string failure_reason_;
    size_t done_ = 0;
    size_t total_;

    void ShowProgress(std::string_view eol);
};

void ProgressReporter::ShowProgress(std::string_view eol) {
    std::stringstream ss;
    ss << title_ << ": ";
    if (total_ > 0) {
        size_t percent = done_ * 100 / total_;
        ss << percent << "%"
           << " (" << done_ << "/" << total_ << ")";
    } else {
        ss << done_;
    }
    ss << eol;
    std::cerr << ss.str();
    std::cerr.flush();
}

struct NoOpReporter : IProgressReporter {
    void UpdateProgress(size_t) override {
    }
    void AddProgress(size_t) override {
    }
    void Done() override {
    }
    void Failed(const std::string&) override {
    }
    void StopProgress(std::string_view) override {
    }
};

std::unique_ptr<IProgressReporter> MakeProgress(std::string_view title, size_t total,
                                                ReporterType type) {
    if (type == ReporterType::Progress) {
        return std::make_unique<ProgressReporter>(title, total);
    } else if (type == ReporterType::NoOp) {
        return std::make_unique<NoOpReporter>();
    }

    return {};
}

boost::json::value ParseJsonAndTest(boost::json::string_view sv) {
    auto r = boost::json::parse(sv);
    if (!r.is_object()) {
        throw std::runtime_error{sv.to_string() + " isn't an object."};
    }

    if (const auto* error = r.as_object().if_contains("error"); error) {
        std::cerr << "message: " 
                  << r.as_object()["error"].as_object()["message"].as_string()
                  << "\ndata:    " 
                  << r.as_object()["error"].as_object()["data"].as_string() 
                  << std::endl;
        throw std::runtime_error(error->as_object().at("message").as_string().c_str());
    }
    return r;
}
}  // namespace sourc3
