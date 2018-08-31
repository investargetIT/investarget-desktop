#!/bin/sh

yarn build
cp -r dist/* prod/
cd prod
git add .
git commit -m "Build for production"
git push