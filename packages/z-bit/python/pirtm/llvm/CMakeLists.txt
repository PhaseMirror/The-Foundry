cmake_minimum_required(VERSION 3.20)
project(pirtm_hooks C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fPIC -O3")

# For position-independent code (shared library)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Build activation hooks as shared library
add_library(pirtm_hooks SHARED
    activation_hooks.cpp
)

# Handle different linking options
target_link_libraries(pirtm_hooks
    PUBLIC
    m  # libm for math functions
)

# Set output directory
set_target_properties(pirtm_hooks PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    SOVERSION 1
    VERSION 1.0.0
)

# Installation targets
install(TARGETS pirtm_hooks
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

# Optional: Build test executable
option(BUILD_TESTS "Build test executables" ON)

if(BUILD_TESTS)
    # Simple validation test
    add_executable(test_hooks_validation
        test_hooks_compilation.cpp
        activation_hooks.cpp
    )
    
    target_link_libraries(test_hooks_validation
        PRIVATE m
    )
    
    set_target_properties(test_hooks_compilation PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
    )
endif()
