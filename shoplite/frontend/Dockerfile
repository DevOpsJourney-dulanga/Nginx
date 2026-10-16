# Stage 1: React app එක build කරනවා
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # /app/dist එකට output එක

# Stage 2: Nginx build එක serve කරලා /api proxy කරනවා
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx.conf එක docker-compose එකෙන් mount කරන නිසා live edit කරන්න පුළුවන්
EXPOSE 80