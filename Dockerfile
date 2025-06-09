# Стадия сборки
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Стадия развёртывания
FROM nginx:stable-alpine

# Копируем собранные файлы из dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx (если нужно)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]