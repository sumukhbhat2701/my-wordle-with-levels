FROM node
RUN mkdir /app
ADD . /app
WORKDIR /app
RUN npm i
CMD node index.js --bind 0.0.0.0:$PORT