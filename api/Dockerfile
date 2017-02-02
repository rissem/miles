FROM node:6.9.5

RUN npm install -g yarn
ADD package.json /app/package.json
WORKDIR /app
RUN yarn
ADD src /app/src
RUN npm install -g nodemon
ADD public /app/public
CMD nodemon /app/src/index.js
