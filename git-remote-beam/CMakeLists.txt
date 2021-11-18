# CMakeList.txt : CMake project for git-remote-beam, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.17)

# Add source to this project's executable.
add_executable (git-remote-beam "git-remote-beam.cpp" "git-remote-beam.h")

target_include_directories(git-remote-beam PUBLIC ${LIBGIT2_INCLUDES})
target_include_directories(git-remote-beam PUBLIC SYSTEM ${LIBGIT2_SYSTEM_INCLUDES})

target_link_libraries(git-remote-beam 
	PUBLIC
		beam
		bvm
		git2
		wallet
		cli)

build_target(contract)
generate_sid_for_file(contract ${PROJECT_BINARY_DIR}/shaders/shaders ${PROJECT_SOURCE_DIR}/shaders)
build_target(app)


add_dependencies(git-remote-beam contract_header)
add_dependencies(git-remote-beam app_build)
add_dependencies(app_build contract_header) 
