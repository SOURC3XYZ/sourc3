# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required (VERSION 3.17)

# should be before project and git 
set(BEAM_WALLET_CLIENT_LIBRARY TRUE)
set(BEAM_TESTS_ENABLED FALSE)
set(BEAM_ATOMIC_SWAP_SUPPORT FALSE)
add_subdirectory(beam)
message(STATUS "CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/beam)

project ("git-remote-beam")
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Include sub-projects.



add_subdirectory (git-remote-beam)
