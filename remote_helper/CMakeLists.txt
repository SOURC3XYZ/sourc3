cmake_minimum_required (VERSION 3.17)

set(TARGET_NAME git-remote-sourc3)

add_executable (${TARGET_NAME} remote_helper.cpp)

add_library(helper_lib STATIC)
target_sources(helper_lib 
	PRIVATE
		git/git_utils.cpp
		git/object_collector.cpp
		utils.cpp
		wallets/beam_wallet_client.cpp
		engines/ipfs/ipfs_engine.cpp
		engines/engine_factory.cpp
        wallets/client_factory.cpp
		engines/ipfs/types.cpp
		engines/ipfs/parsing.cpp
)

target_include_directories(helper_lib PUBLIC ${LIBGIT2_INCLUDES})
target_include_directories(helper_lib PUBLIC SYSTEM ${LIBGIT2_SYSTEM_INCLUDES})
target_include_directories(helper_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

target_link_libraries(helper_lib 
	PUBLIC
		git2
		Boost::boost
		Boost::date_time
		Boost::container
		Boost::json
		Boost::regex
		Boost::coroutine
)

target_link_libraries(${TARGET_NAME} 
	PUBLIC
		helper_lib
		Boost::program_options
		Boost::filesystem 
)

if (SOURC3_TESTS_ENABLED)
	add_subdirectory(unittests)
endif()