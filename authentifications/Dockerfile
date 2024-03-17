FROM node:latest

RUN apt-get update && \
    apt-get install -y redis-server

WORKDIR /app

COPY . . 

RUN npm install
RUN npm install axios jsonwebtoken express-session

EXPOSE 3000

# CMD pour démarrer Redis Server et l'application Node.js
CMD ["sh", "-c", "redis-server & node app.js"]
