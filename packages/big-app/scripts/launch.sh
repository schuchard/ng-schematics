#!/usr/bin/env bash

echo "linking sandbox"
yarn link:sandbox

echo "executing schematic"
cd ../../sandbox/test-workspace &&
yarn &&
./node_modules/.bin/ng add big-app