FROM node:10.12.0-alpine AS build
# ARG SENTRY_CLIENT_DSN
# ARG SENTRY_AUTH_TOKEN
# ARG SENTRY_ORG
# ARG SENTRY_CLIENT_PROJECT
# ARG CI_COMMIT_SHA
# ARG GTM_ID

# ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
# ENV SENTRY_ORG=${SENTRY_ORG}
# ENV SENTRY_PROJECT=${SENTRY_CLIENT_PROJECT}
# ENV SENTRY_CLIENT_DSN=${SENTRY_CLIENT_DSN}
# ENV CI_COMMIT_SHA=${CI_COMMIT_SHA}
# ENV GTM_ID=${GTM_ID}

#Build client
WORKDIR /app

RUN apk -U upgrade && apk add \
    git \
    yarn \
 && rm -rf /var/cache/apk/*

COPY package.json yarn.lock /app/

ENV NODE_ENV="development"

RUN yarn --pure-lockfile && du -d0 -h
COPY . /app/

ENV NODE_ENV="production"
RUN yarn run test \
  && yarn run build \
  && rm -rf node_modules/ packs/*.map \
  && yarn --pure-lockfile \
  && yarn cache clean \
  && du -d0 -h

# Packaging
FROM node:10.12.0-alpine AS production
LABEL maintainer="f0reachARR" description="Dedicated application for broadcasting movies of 未定ちゃん"
ARG NODE_ENV="production"
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/packs /app/packs
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

VOLUME [ "/app/data" ]
EXPOSE 3000 3001
CMD yarn start
