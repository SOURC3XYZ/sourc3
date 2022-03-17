#pragma once

#include <cstdint>
#include <vector>
#include <string>

namespace sourc3
{
    using ByteBuffer = std::vector<uint8_t>;

    std::string ToHex(const void* p, size_t size);

}