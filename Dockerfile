# [Build image]
FROM node:11.6.0-alpine AS build

WORKDIR /app

RUN apk -U upgrade && apk add git \
  && rm -rf /var/cache/apk/*

COPY package.json package-lock.json /app/

# install lerna
ENV NODE_ENV="development"

RUN npm ci
COPY . /app/

# build client
ENV NODE_ENV="production"
RUN npx lerna bootstrap --hoist \
  && npm run build \
  && du -d0 -h \
  && npx lerna clean --yes \
  && rm -rf ./node_modules

# [Production image]
FROM node:11.6.0-alpine AS prod

WORKDIR /app

# install pkgs
RUN apk -U upgrade && apk add git ffmpeg \
  && rm -rf /var/cache/apk/*

# copy files
COPY package.json package-lock.json lerna.json /app/
COPY --from=build /app/packages /app/packages
COPY --from=build /app/resource /app/resource

# install lerna
ENV NODE_ENV="development"
RUN npm ci

# install server packages
ENV NODE_ENV="production"
RUN npx lerna bootstrap --hoist --ignore @mitei/client-* -- --production \
  && du -d0 -h

# copy client
COPY --from=build /app/packages/client-admin/packs /app/packages/server-media/packs
COPY --from=build /app/packages/client-viewer/packs /app/packages/server-media/packs
COPY --from=build /app/packages/client-admin/packs/index.html /app/packages/server-media/packs/admin.html

VOLUME [ "/app/data" ]
EXPOSE 3000 3001

CMD npx lerna run start --scope @mitei/server-media --stream
