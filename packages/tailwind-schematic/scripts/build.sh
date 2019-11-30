#! /bin/sh

echo "removing dist folder"
rm -rf dist
mkdir -p dist/schematic/src

echo "copying collection.json to dist"
cp collection.json dist/schematic

echo "copying schema.json to dist"
cp src/schema.json dist/schematic/src

echo "copying ./files to dist"
cp -r src/files dist/schematic/src

echo "compiling typescript"
tsc -p tsconfig.json