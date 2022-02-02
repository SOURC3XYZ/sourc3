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
    include_directories(${CMAKE_CURRENT_SOURCE_DIR}/3rdparty/libgit2/include)
endif()

project ("pit")
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
    option(PIT_USE_STATIC "Build with staticaly linked libraries " FALSE)
    option(PIT_USE_STATIC_RUNTIME "Build with staticaly linked runtime" FALSE)
    option(PIT_TESTS_ENABLED "Build tests" TRUE)

    #include(AddShader)
    if(PIT_USE_STATIC)
        set(Boost_USE_MULTITHREADED ON)
        set(Boost_USE_STATIC_LIBS ON)
        set(Boost_USE_STATIC_RUNTIME ${PIT_USE_STATIC_RUNTIME})
    else()
        if (WIN32)
            add_definitions( -DBOOST_ALL_DYN_LINK )
        endif()
    endif()
    find_package(Boost REQUIRED COMPONENTS program_options date_time filesystem container)
    if (PIT_TESTS_ENABLED)
        enable_testing()

        function(add_test_snippet EXE_NAME LIB_NAME)
            add_executable(${EXE_NAME} ${EXE_NAME}.cpp)
            target_link_libraries(${EXE_NAME} ${LIB_NAME} ${ARGN})
            add_test(NAME ${EXE_NAME} COMMAND $<TARGET_FILE:${EXE_NAME}>)
        endfunction()
    endif()
    add_subdirectory(3rdparty/libgit2)
    if (MSVC)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zc:__cplusplus")
        add_compile_options(/W4 /WX)
        if(PIT_USE_STATIC_RUNTIME)
            set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
        endif()
    else()
        add_compile_options(-Wall -Wextra -pedantic -Werror)
    endif()
    add_subdirectory (remote_helper)
    
endif()

