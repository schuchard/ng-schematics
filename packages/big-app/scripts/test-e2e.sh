#!/usr/bin/env bash
yarn build && yarn clean

echo "linking sandbox"
yarn link:sandbox

echo "executing schematic"
cd ../../sandbox && ng new --collection=big-app