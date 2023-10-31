FROM node:18.12.1-slim
WORKDIR /usr/src/lira
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["npm", "run", "deploy"]