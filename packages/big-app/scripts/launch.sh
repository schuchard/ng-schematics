#!/usr/bin/env bash

echo "linking sandbox"
yarn link:sandbox

echo "executing schematic"
cd ../../sandbox && ng add big-app