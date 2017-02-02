FROM node:6.9.5

ADD package.json /app/package.json
WORKDIR /app
RUN npm install
ADD public /app/public
ADD src /app/src

CMD npm start
