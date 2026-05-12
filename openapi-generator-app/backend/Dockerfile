FROM node:20-alpine AS base
WORKDIR /app

# openapi-generator-cli ejecuta el generador Java (jar)
RUN apk add --no-cache openjdk17-jre-headless

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
