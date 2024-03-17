FROM node:latest

WORKDIR /app
COPY package.json . 
RUN npm install
RUN npm install axios jsonwebtoken express-session
COPY . . 	
EXPOSE 3000
CMD ["node", "wordFinder.js"]
