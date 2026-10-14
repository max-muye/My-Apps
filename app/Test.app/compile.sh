#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Compiling Test.app..."

swiftc main.swift -o Contents/MacOS/Test

echo "Compilation successful!"

open .