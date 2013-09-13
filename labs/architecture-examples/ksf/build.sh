# compile
bower_components/util/buildscripts/build.sh --require require-config.js -p build

# compress
node ../../node_modules/uglify-js/bin/uglifyjs build/dojo/dojo.js.uncompressed.js -o build/dojo/dojo.js