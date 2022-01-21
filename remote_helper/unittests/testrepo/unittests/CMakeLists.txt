cmake_minimum_required(VERSION 3.17)

add_test_snippet(shader_test Beam::bvm Beam::beam)
target_include_directories(shader_test PUBLIC ${PROJECT_SOURCE_DIR}/shaders)


build_target(contract)
generate_sid_for_file(contract ${PROJECT_BINARY_DIR}/shaders/shaders ${PROJECT_SOURCE_DIR}/shaders)
build_target(app)


add_dependencies(shader_test contract_header)
add_dependencies(app_build contract_header)
