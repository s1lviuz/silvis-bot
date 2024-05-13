FROM node:alpine as builder

RUN apk add --no-cache python3 py3-pip python3-dev py3-pillow
RUN apk add --no-cache build-base cmake git
RUN apk add --no-cache libsodium libtool autoconf automake
RUN apk add --no-cache ffmpeg

RUN pip install spotdl --break-system-packages

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npx prisma generate

ENV NODE_PATH=./dist

RUN npm run build

CMD [ "npm", "start" ]