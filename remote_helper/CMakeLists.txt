cmake_minimum_required (VERSION 3.17)

set(TARGET_NAME git-remote-pit)

add_executable (${TARGET_NAME} remote_helper.cpp)

target_include_directories(${TARGET_NAME} PUBLIC ${LIBGIT2_INCLUDES})
target_include_directories(${TARGET_NAME} PUBLIC SYSTEM ${LIBGIT2_SYSTEM_INCLUDES})

target_link_libraries(${TARGET_NAME} 
	PUBLIC
		beam
		bvm
		git2
		wallet
		cli
)

