#!/bin/bash
docker run -it --rm \
  --name investarget-desktop-web \
  -p 8000:8000 \
  -v .:/usr/src/app \
  -v /usr/src/app/node_modules \
  investarget-desktop-frontend
  