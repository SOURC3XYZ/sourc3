# CMakeList.txt : CMake project for git-remote-beam, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.17)

# Add source to this project's executable.
add_executable (git-remote-beam "git-remote-beam.cpp" "git-remote-beam.h")

target_link_libraries(git-remote-beam 
	PUBLIC
		beam
		
		wallet)
# TODO: Add tests and install targets if needed.
