FROM node:6.9.5
RUN npm install -g yarn
ADD package.json /app/package.json
WORKDIR /app
RUN yarn
ADD public /app/public
ADD src /app/src

CMD yarn start
