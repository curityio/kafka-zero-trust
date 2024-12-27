FROM node:20-alpine

# https://github.com/Blizzard/node-rdkafka/blob/master/examples/docker-alpine.md
RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python3
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

WORKDIR /usr/api
COPY package*.json /usr/api/
COPY dist/         /usr/api/dist/

RUN npm install --production

RUN addgroup -g 1001 apigroup
RUN adduser -u 1001 -G apigroup -h /home/apiuser -D apiuser
USER apiuser

CMD ["node", "dist/index.js"]