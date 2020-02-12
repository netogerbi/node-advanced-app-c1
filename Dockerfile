FROM node:8

RUN mkdir -p /usr/src/got/

WORKDIR /usr/src/got/

COPY . /usr/src/got/

RUN npm i

RUN npm i -g --save-dev nodemon

EXPOSE 5000

CMD [ "node", "app.js" ]