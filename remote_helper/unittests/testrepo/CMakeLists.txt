cmake_minimum_required(VERSION 3.17)
project(InitialContract2)

set(CMAKE_MODULE_PATH "${BEAM_SHADER_SDK}/beam/cmake" ${CMAKE_MODULE_PATH})
set(CMAKE_MODULE_PATH "${BEAM_SHADER_SDK}/cmake" ${CMAKE_MODULE_PATH})
set(CMAKE_PREFIX_PATH ${CMAKE_PREFIX_PATH} ${BEAM_SHADER_SDK})
set(BEAM_PROJECT_SOURCE_DIR ${BEAM_SHADER_SDK}/beam CACHE INTERNAL "")
set(BEAM_PROJECT_BINARY_DIR ${PROJECT_BINARY_DIR}/beam CACHE INTERNAL "")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${BEAM_SHADER_SDK}/beam/bvm)
message(STATUS "CMAKE_SYSTEM_NAME=${CMAKE_SYSTEM_NAME}")
include(ShaderTools)
include_directories(3rdparty/yas/include)
if(CMAKE_SYSTEM_NAME MATCHES "WASI")
    include(ShaderLib)

    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    string (REPLACE ";" " " BEAM_SHADER_CLANG_OPTIONS_STR "${BEAM_SHADER_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_SHADER_CLANG_OPTIONS_STR}")

    add_subdirectory(shaders)
else()
    set(beam_SOURCE_DIR ${BEAM_SHADER_SDK}/beam)
    include(AddTest)
    include(Bvm)
    include(AddShader)
    find_package(Boost 1.71 REQUIRED COMPONENTS system filesystem )
    find_package(OpenSSL)
    add_subdirectory(unittests)
endif()