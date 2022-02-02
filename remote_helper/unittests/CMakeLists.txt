cmake_minimum_required (VERSION 3.17)

add_test_snippet(helper_tests helper_lib git2)
target_compile_definitions(helper_tests PRIVATE PIT_TESTS_ROOT="${CMAKE_CURRENT_SOURCE_DIR}")

add_custom_target(helper_tests_prepare ALL
    COMMAND ${CMAKE_COMMAND} -E remove_directory $<TARGET_FILE_DIR:helper_tests>/temp/testrepo
	COMMAND ${CMAKE_COMMAND} -E copy_directory ${CMAKE_CURRENT_SOURCE_DIR}/testrepo $<TARGET_FILE_DIR:helper_tests>/temp/testrepo

)
