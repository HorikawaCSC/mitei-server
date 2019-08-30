FROM node:11.6.0-alpine AS build

#Build
WORKDIR /app

RUN apk -U upgrade && apk add \
  git ffmpeg \
  && rm -rf /var/cache/apk/*

COPY package.json package-lock.json /app/

ENV NODE_ENV="development"

RUN npm ci && du -d0 -h
COPY . /app/

ENV NODE_ENV="production"
RUN npx lerna bootstrap --hoist \
  && npm run build \
  && npm run test \
  && du -d0 -h \
  && mkdir ./packages/server-media/packs \
  && cp -r ./packages/client-admin/packs/* ./packages/server-media/packs \
  && cp -r ./packages/client-viewer/packs/* ./packages/server-media/packs \
  && cp ./packages/client-admin/packs/index.html ./packages/server-media/packs/admin.html

VOLUME [ "/app/data" ]
EXPOSE 3000 3001

CMD npx lerna run start --scope @mitei/server-media --stream
