# compile
bower_components/util/buildscripts/build.sh --require js/run.js -p build

# compress
node ../../node_modules/uglify-js/bin/uglifyjs build/dojo/dojo.js.uncompressed.js -o build/dojo/dojo.js