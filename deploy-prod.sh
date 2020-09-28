#!/bin/sh

sed -i '' -e 's|http://apitest|https://api|' public/pdf_viewer/annotation.js
yarn build
cp -r dist/* prod/
cd prod
git add .
git commit -m "Build for production"
git push