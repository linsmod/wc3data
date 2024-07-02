#!/bin/bash

source /wp4/war3dev/wc3data/emsdk/emsdk_env.sh  
mkdir out
emcc datafile/objectdata.cpp -o emcc/objectdata.bc --std=c++11 -O3 -DNO_SYSTEM -DZ_SOLO -I.
emcc out/adler32 out/compress1 out/crc321 out/deflate out/infback out/inffast out/inflate out/inftrees out/trees out/uncompr out/zutil out/checksum out/common1 out/file out/path out/strlib out/hash out/game out/id out/metadata out/objectdata out/slk out/unitdata out/westrings out/wtsdata out/adpcm out/archive out/common out/compress out/huff out/locale out/crc32 out/explode out/implode out/json out/utf8 out/parse out/search out/webmain -o MapParser.js -s EXPORT_NAME="MapParser" -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_malloc', '_free']" --post-js ./module-post.js -s ALLOW_MEMORY_GROWTH=1 -s TOTAL_MEMORY=134217728 -s DISABLE_EXCEPTION_CATCHING=0 &&
