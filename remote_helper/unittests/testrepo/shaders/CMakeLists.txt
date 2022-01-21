cmake_minimum_required(VERSION 3.17)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -std=c++17 -flto -fno-rtti -Wno-inline-new-delete -fno-exceptions -Wno-macro-redefined -Wno-return-type -nostartfiles  ") #-nostdlib ")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wl,--no-entry,--allow-undefined,--export=Ctor,--export=Dtor,--export=Method_0,--export=Method_1,--export=Method_2,--strip-all") #,--strip-all")

add_executable(contract contract.cpp)
add_executable(app app.cpp)
target_link_libraries(contract PRIVATE Beam::shader-lib)
target_link_libraries(app PRIVATE Beam::shader-lib)
target_compile_features(app PUBLIC cxx_std_17)
target_compile_features(contract PUBLIC cxx_std_17)

generate_sid(contract)
