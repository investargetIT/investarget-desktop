#!/bin/sh
npx babel ./node_modules/docx/build/index.js --out-file ./node_modules/docx/build/index.js
NODE_ENV=development yarn build
cp -r dist/* test/
cd test
git add .
git commit -m "Build for test"
git push