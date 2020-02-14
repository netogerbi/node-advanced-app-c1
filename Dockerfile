FROM node:latest

RUN mkdir -p /usr/src/app/

WORKDIR /usr/src/app/

COPY . /usr/src/app/

RUN npm i 

RUN cd client && npm i && cd ..

RUN npm i -g --save-dev nodemon

EXPOSE 5000

CMD [ "node", "app.js" ]