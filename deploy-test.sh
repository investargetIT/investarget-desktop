#!/bin/sh

NODE_ENV=development yarn build
cp -r dist/* test/
cd test
git add .
git commit -m "Build for test"
git push