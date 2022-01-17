cmake_minimum_required (VERSION 3.17)

set(TARGET_NAME git-remote-pit)

add_executable (${TARGET_NAME} remote_helper.cpp)

add_library(helper_lib STATIC)
target_sources(helper_lib 
	PRIVATE
		git_utils.cpp
		object_collector.cpp
		utils.cpp
		wallet_client.cpp
)

target_include_directories(helper_lib PUBLIC ${LIBGIT2_INCLUDES})
target_include_directories(helper_lib PUBLIC SYSTEM ${LIBGIT2_SYSTEM_INCLUDES})

target_link_libraries(helper_lib 
	PUBLIC
		git2
		Boost::boost
		Boost::date_time
		Boost::container
)

target_link_libraries(${TARGET_NAME} 
	PUBLIC
		helper_lib
		Boost::program_options
		Boost::filesystem 
)

if (PIT_ENABLE_TESTS)
	add_subdirectory(unittests)
endif()