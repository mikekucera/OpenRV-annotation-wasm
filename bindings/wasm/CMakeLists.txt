add_executable(annotation_platform StrokeBuilder.cpp)

target_link_libraries(annotation_platform PRIVATE TwkPaint)

if(EMSCRIPTEN)
    set_target_properties(annotation_platform PROPERTIES SUFFIX ".js")
    target_compile_options(annotation_platform PRIVATE -Os)
    target_link_options(annotation_platform PRIVATE
        -Os
        -lembind
        -sMODULARIZE=1
        -sEXPORT_NAME=AnnotationPlatform
        -sSINGLE_FILE=1
        -sALLOW_MEMORY_GROWTH=1
        -sENVIRONMENT=web
    )
endif()
