FROM node:20-alpine

WORKDIR /app/frontend

RUN npm install npm@latest -g

COPY package*.json ./

# install dependencies
RUN npm install --legacy-peer-deps

COPY . ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
