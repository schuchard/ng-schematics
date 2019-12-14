#!/usr/bin/env bash

echo "cleaning sandbox/"
git checkout HEAD -- ../../sandbox && git clean -f -d ../../sandbox