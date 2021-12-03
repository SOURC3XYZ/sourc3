# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required (VERSION 3.17)
if(CMAKE_SYSTEM_NAME MATCHES "WASI")
    if (NOT BEAM_SHADER_SDK)
        set(BEAM_SHADER_SDK $ENV{BEAM_SHADER_SDK})
    endif()

    if (NOT BEAM_SHADER_SDK)
        message(FATAL_ERROR "BEAM_SHADER_SDK is not defined")
    endif()

    if (NOT WASI_SDK_PREFIX)
        set(WASI_SDK_PREFIX $ENV{WASI_SDK_PREFIX})
    endif()

    if (NOT WASI_SDK_PREFIX)
        message(FATAL_ERROR "WASI_SDK_PREFIX is not defined")
    endif()
endif()
set(CMAKE_MODULE_PATH "${BEAM_SHADER_SDK}/beam/cmake" ${CMAKE_MODULE_PATH})
set(CMAKE_MODULE_PATH "${BEAM_SHADER_SDK}/cmake" ${CMAKE_MODULE_PATH})
set(CMAKE_PREFIX_PATH ${CMAKE_PREFIX_PATH} ${BEAM_SHADER_SDK})
set(BEAM_PROJECT_SOURCE_DIR ${BEAM_SHADER_SDK}/beam CACHE INTERNAL "")
set(BEAM_PROJECT_BINARY_DIR ${PROJECT_BINARY_DIR}/beam CACHE INTERNAL "")
 
if(NOT CMAKE_SYSTEM_NAME MATCHES "WASI")
    # should be before project and git 
    set(BEAM_WALLET_CLIENT_LIBRARY TRUE)
    set(BEAM_TESTS_ENABLED FALSE)
    set(BEAM_ATOMIC_SWAP_SUPPORT FALSE)
    add_subdirectory(beam)
    message(STATUS "CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")
    include_directories(${CMAKE_CURRENT_SOURCE_DIR}/beam)
    include_directories(${CMAKE_CURRENT_SOURCE_DIR}/3rdparty/libgit2/include)
endif()

project ("git-remote-beam")
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Include sub-projects.

if(CMAKE_SYSTEM_NAME MATCHES "WASI")
    include(ShaderTools)
    include(ShaderLib)
    include(GenerateSID)
    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    string (REPLACE ";" " " BEAM_SHADER_CLANG_OPTIONS_STR "${BEAM_SHADER_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_SHADER_CLANG_OPTIONS_STR}")

    add_subdirectory(shaders)
else()
    if(BEAM_USE_STATIC)
        add_definitions(-DBEAM_USE_STATIC)
    endif()
    if (MSVC)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zc:__cplusplus")
    endif()
    #include(AddShader)
    find_package(Boost REQUIRED COMPONENTS program_options)
    add_subdirectory(3rdparty/libgit2)
    add_subdirectory (git-remote-beam)
    
endif()

