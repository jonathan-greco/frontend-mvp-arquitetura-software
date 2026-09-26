FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Endereço da API usado pelo navegador (fica gravado no JavaScript durante o build).
ARG VITE_API_URL=http://127.0.0.1:5000/api/v1

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "preview"]