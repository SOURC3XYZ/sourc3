# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required (VERSION 3.17)

set(VERSION_MAJOR 0)
set(VERSION_MINOR 0 )
set(VERSION_REVISION 0)
set(GIT_COMMIT_HASH "unknown")

find_package(Git)
if(Git_FOUND)
    execute_process(
        COMMAND ${GIT_EXECUTABLE} status
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        ERROR_VARIABLE RESULT_STRING
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    string(LENGTH "${RESULT_STRING}" LENGTH_RESULT_STRING)

    if(${LENGTH_RESULT_STRING} EQUAL 0)
        execute_process(
            COMMAND ${GIT_EXECUTABLE} log -1 --format=%H
            WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
            OUTPUT_VARIABLE GIT_COMMIT_HASH
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
        execute_process(
            COMMAND ${GIT_EXECUTABLE} rev-list HEAD --count
            WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
            OUTPUT_VARIABLE VERSION_REVISION
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )

        if(NOT DEFINED BRANCH_NAME)
            execute_process(
                COMMAND ${GIT_EXECUTABLE} rev-parse --abbrev-ref HEAD
                WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                OUTPUT_VARIABLE BRANCH_NAME
                OUTPUT_STRIP_TRAILING_WHITESPACE
            )
        endif()

    endif()
else()
    set(BRANCH_NAME "")
endif()

message("BRANCH_NAME: ${BRANCH_NAME}")

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
    include_directories(${CMAKE_CURRENT_SOURCE_DIR}/3rdparty/libgit2/include)
endif()

project ("sourc3" VERSION ${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_REVISION})
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
# Include sub-projects.

if(CMAKE_SYSTEM_NAME MATCHES "WASI")
    include(ShaderTools)
    include(ShaderLib)

    add_custom_target(sid_generator ALL
        COMMAND echo "dummy")

    include(GenerateSID)
    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    string (REPLACE ";" " " BEAM_SHADER_CLANG_OPTIONS_STR "${BEAM_SHADER_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_SHADER_CLANG_OPTIONS_STR}")

    add_subdirectory(shaders)
else()
    option(SOURC3_USE_STATIC "Build with staticaly linked libraries " FALSE)
    option(SOURC3_USE_STATIC_RUNTIME "Build with staticaly linked runtime" FALSE)
    option(SOURC3_TESTS_ENABLED "Build tests" TRUE)

    #include(AddShader)
    if(SOURC3_USE_STATIC)
        set(Boost_USE_MULTITHREADED ON)
        set(Boost_USE_STATIC_LIBS ON)
        set(Boost_USE_STATIC_RUNTIME ${SOURC3_USE_STATIC_RUNTIME})
    else()
        if (WIN32)
            add_definitions( -DBOOST_ALL_DYN_LINK )
        endif()
    endif()
    configure_file("${PROJECT_SOURCE_DIR}/version.h.in" "${CMAKE_CURRENT_BINARY_DIR}/version.h")
    file(WRITE version.gen ${PROJECT_VERSION})
    include_directories(${CMAKE_CURRENT_BINARY_DIR})
    find_package(Boost REQUIRED COMPONENTS program_options date_time regex filesystem container context coroutine thread json)
    if (SOURC3_TESTS_ENABLED)
        enable_testing()

        function(add_test_snippet EXE_NAME LIB_NAME)
            add_executable(${EXE_NAME} ${EXE_NAME}.cpp)
            target_link_libraries(${EXE_NAME} ${LIB_NAME} ${ARGN})
            add_test(NAME ${EXE_NAME} COMMAND $<TARGET_FILE:${EXE_NAME}> WORKING_DIRECTORY $<TARGET_FILE_DIR:${EXE_NAME}> )
        endfunction()
    endif()

    option(BUILD_SHARED_LIBS       "Build Shared Library (OFF for Static)"                  ON)
    option(BUILD_TESTS             "Build Tests using the Clar suite"                       ON)
    option(USE_BUNDLED_ZLIB        "Use the bundled version of zlib. Can be set to one of Bundled(ON)/Chromium. The Chromium option requires a x86_64 processor with SSE4.2 and CLMUL" OFF)
    option(USE_SSH                 "Link with libssh2 to enable SSH support"                ON)
    option(USE_HTTPS               "Enable HTTPS support. Can be set to a specific backend" ON)
    set(BUILD_TESTS OFF)
    set(BUILD_SHARED_LIBS OFF)
    set(USE_BUNDLED_ZLIB OFF)
    set(USE_SSH OFF)
    set(USE_HTTPS OFF)

    if (MSVC)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zc:__cplusplus")
        if(SOURC3_USE_STATIC_RUNTIME)
            set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
        endif()
    endif()

    add_subdirectory(3rdparty/libgit2)
    if (MSVC)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zc:__cplusplus")
        add_compile_options(/W4 /WX)
    else()
        add_compile_options(-Wall -Wextra -pedantic -Werror)
    endif()
    add_subdirectory (remote_helper)
    
endif()

