cmake_minimum_required(VERSION 3.19)
project(AnnotationPlatform VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(deps/OpenRV-annotation)
add_subdirectory(bindings/wasm)
