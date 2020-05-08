FROM node:12-slim
WORKDIR /app
COPY package.json /app
RUN npm install
COPY tsconfig.json /app
COPY /src /app/src
CMD npm start
