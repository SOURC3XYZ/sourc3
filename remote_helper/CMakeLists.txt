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
		wallet_ipfs
		Boost::date_time
)

if (WIN32)
    add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
                       COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:ipfs-bindings> $<TARGET_FILE_DIR:${TARGET_NAME}>)
endif()

#build_target(contract)
#generate_sid_for_file(contract ${PROJECT_BINARY_DIR}/shaders/shaders ${PROJECT_SOURCE_DIR}/shaders)
#build_target(app)
#
#
#add_dependencies(${TARGET_NAME} contract_header)
#add_dependencies(${TARGET_NAME} app_build)
#add_dependencies(app_build contract_header) 
