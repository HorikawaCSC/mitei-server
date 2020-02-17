#!/bin/sh

perl ./tools/generate-dockerfile.pl

IMAGE_ID=`echo "docker.pkg.github.com/$REPO" | tr '[A-Z]' '[a-z]'`
VERSION=`git describe --abbrev=0`

echo Target ImageID: $IMAGE_ID

docker build . --tag $IMAGE_ID/main:$VERSION
docker build ./nginx --tag $IMAGE_ID/nginx:$VERSION

docker push $IMAGE_ID/main:$VERSION
docker push $IMAGE_ID/nginx:$VERSION
