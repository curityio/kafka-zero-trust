FROM node:16-alpine

WORKDIR /usr/api
COPY package*.json /usr/api/
COPY dist/*.js     /usr/api/dist/

RUN npm install --production

RUN addgroup -g 1001 apigroup
RUN adduser -u 1001 -G apigroup -h /home/apiuser -D apiuser
USER apiuser

CMD ["node", "dist/index.js"]