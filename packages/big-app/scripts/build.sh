#!/usr/bin/env bash

echo "removing dist folder"
rm -rf dist

echo "compiling typescript"
tsc -p tsconfig.json


echo "copying schema.json to dist"
cp src/schema.json dist

echo "copying ./files to dist"
# cp -r src/files dist
