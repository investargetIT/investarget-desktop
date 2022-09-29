#!/bin/sh

sed -i '' -e 's|http://apitest|https://api|' public/pdf_viewer/annotation.js
sed -i '' -e 's|http://apitest|https://api|' public/pdf_viewer/statistic.js
docker exec -it investarget-desktop-web yarn build
cp -r dist/* prod/
cd prod
git add .
git commit -m "Build for production"
git push
