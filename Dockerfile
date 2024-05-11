FROM node:alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npx prisma generate

ENV NODE_PATH=./dist

RUN npm run build

CMD [ "npm", "start" ]