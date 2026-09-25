FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV API_URL=http://0.0.0.0:5000
EXPOSE 8080
CMD ["npm", "run", "preview"]