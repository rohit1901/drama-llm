FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --always-fetch
COPY . .
RUN npm run build && npm run preview
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
