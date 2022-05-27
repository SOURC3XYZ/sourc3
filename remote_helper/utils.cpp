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
}  // namespace sourc3
