#!/bin/sh
sed -i '' -e 's|http://apitest|https://api|' public/pdf_viewer/annotation.js
sed -i '' -e 's|http://apitest|https://api|' public/pdf_viewer/statistic.js
npx babel ./node_modules/docx/build/index.js --out-file ./node_modules/docx/build/index.js
yarn build
cp -r dist/* prod/
cd prod
git add .
git commit -m "Build for production"
git push