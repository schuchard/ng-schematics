#!/usr/bin/env bash
yarn build && yarn clean

echo "linking sandbox"
yarn link:sandbox

echo "executing schematic"
cd ../../sandbox

mkdir big-app
cd big-app

ng new --collection=big-app --modules 3 --components 3