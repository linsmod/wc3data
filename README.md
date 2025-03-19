这个项目是生成用于浏览器可检索的游戏和地图数据的工程

另外，生成的数据使用另一个Java写的http服务器项目wc3Host托管
在我改编的另一个flowtshog_mdx-m3-viewer项目中，在上述元数据的加持下，可以加载dota地图。
mdx-m3-viewer的地图渲染使用webgl，开发语言使用js或者ts
以上主要是在2023年底到2024年上半年基于相关的开源项目改造所得。
当初有计划实现整个游戏引擎，后面发现工作量过大，且自身关于游戏引擎的框架套路和游戏机制底层缺乏经验，于是搁置。
其中自我感觉很棒的工作，当属可以将jass转为js运行起来。
————linsmod（联系我:wx@LK616157,qq@625761566）

Source code for [WC3 Data](https://wc3.rivsoft.net)

DataGen project is used to generate static data and build WASM scripts for map parsing in browser.

main.cpp can be configured to generate various data files, using the three define's just before the main function.
USE_CDN=1 and GENERATE_META=1 to generate data for the latest version. Then set GENERATE_META=0 and uncomment various build hashes to generate data for other versions. Then USE_CDN=0 for local old MPQ builds if you have any. TEST_MAP=1 can be used to generate prebuilt data archives for maps.

/public/api folder (for development) should have the following files:

* versions.json - slightly different format than what DataGen creates, correct format is like http://wc3.rivsoft.net/api/versions.json
* \<version\>.json - JSON data for every listed game version
* icons\<number\>.png - collections of small (16x16) icons
* images.dat - hashes of all icons in the collections
* images/\<id\>.png - original size images (can be served from images.gzx archive instead)
* meta.gzx - data used for map parsing
  
In src/maps the jscc/wasm files are built by DataGen project using configure.js/build.bat scripts (requires [emscripten](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)). jscc extension is used because we need a different loader for these.
