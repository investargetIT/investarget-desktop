FROM node:11.15.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn 
COPY . .
CMD [ "yarn", "start" ]