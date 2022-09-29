#!/bin/sh

docker exec -it -e NODE_ENV=development investarget-desktop-web yarn build
cp -r dist/* test/
cd test
git add .
git commit -m "Build for test"
git push
