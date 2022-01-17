#pragma once

#include <cstdint>
#include <vector>
#include <string>

namespace pit
{
    using ByteBuffer = std::vector<uint8_t>;

    std::string ToHex(const void* p, size_t size);

}