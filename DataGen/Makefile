CC = emcc
CFLAGS = -std=c++11 -O3 -DNO_SYSTEM -DZ_SOLO $(patsubst -I%, -I$(abspath %), $(INCLUDE))
LDFLAGS =
CPP_SOURCES := $(wildcard *.cpp) $(wildcard */*.cpp)
C_SOURCES := $(wildcard */*/*.c)
CPP_OBJECTS := $(patsubst %.cpp,out/%.o,$(notdir $(CPP_SOURCES)))
C_OBJECTS := $(patsubst %.c,out/%.o,$(notdir $(C_SOURCES)))
INCLUDE = $(pwd)/utils
SUBDIRS := subdir1 subdir2

.PHONY: all clean $(SUBDIRS)

all: MapParser.js ArchiveLoader.js $(SUBDIRS)

$(CPP_OBJECTS): out/%.o: %.cpp | out
	$(CC) $< -o $@ $(CFLAGS)

$(C_OBJECTS): out/%.o: %.c | out
	$(CC) $< -o $@ $(CFLAGS)

out:
	mkdir -p out

MapParser.js: $(CPP_SOURCES:.cpp=.o) $(C_SOURCES:.c=.o)
	$(CC) $^ -o $@ $(LDFLAGS) \
	-s EXPORT_NAME="MapParser" -s WASM=1 -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_malloc', '_free']" \
	--post-js ./module-post.js -s ALLOW_MEMORY_GROWTH=1 -s TOTAL_MEMORY=134217728 -s DISABLE_EXCEPTION_CATCHING=0

ArchiveLoader.js: $(filter-out $(C_OBJECTS:.o=.c), $(CPP_SOURCES:.cpp=.o) $(C_SOURCES:.c=.o))
	$(CC) $^ -o $@ $(LDFLAGS) \
	-s EXPORT_NAME="ArchiveLoader" -s WASM=1 -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_malloc', '_free']" \
	--post-js ./module-post.js -s ALLOW_MEMORY_GROWTH=1 -s TOTAL_MEMORY=33554432

clean:
	rm -rf out *.js

$(SUBDIRS):
	$(MAKE) -C $@ $(MAKECMDGOALS)