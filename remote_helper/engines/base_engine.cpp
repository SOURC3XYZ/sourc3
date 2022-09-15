#include "engines/base_engine.h"

IEngine::BaseOptions::SetResult IEngine::BaseOptions::SetBool(bool& opt, std::string_view value) {
    if (value == "true") {
        opt = true;
    } else if (value == "false") {
        opt = false;
    } else {
        return SetResult::InvalidValue;
    }
    return SetResult::Ok;
}
