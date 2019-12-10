#!/usr/bin/env bash
yarn build && yarn clean

echo "linking sandbox"
yarn link:sandbox

echo "executing schematic"
cd ../../sandbox/test-workspace &&

yarn &&

./node_modules/.bin/ng g @schuchard/tailwind-schematic:__test