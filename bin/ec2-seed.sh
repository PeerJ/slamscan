#!/usr/bin/env bash

set -e

mkdir -p ./build/defs
LD_LIBRARY_PATH=$(pwd)/build/lib/ ./build/bin/freshclam \
    --config-file=./build/etc/freshclam.conf \
    --user="$(whoami)" \
    --datadir=./build/defs
