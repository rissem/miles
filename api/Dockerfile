FROM node:6.9.5
RUN npm install -g yarn
RUN npm install -g nodemon
ADD package.json /app/package.json
WORKDIR /app
RUN yarn
ADD src /app/src

ADD public /app/public
# -L legacy watching required on Mac
# http://fostertheweb.com/2016/02/nodemon-inside-docker-container/
CMD nodemon -L /app/src/index.js
