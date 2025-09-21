# Multi-stage build для Railway deployment
FROM node:18-alpine AS build

# Установка рабочей директории
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
RUN npm run install:deps

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Установка рабочей директории
WORKDIR /app

# Копируем только необходимые файлы из build stage
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/public ./backend/public
COPY --from=build /app/backend/package*.json ./backend/
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Переходим в backend директорию
WORKDIR /app/backend

# Экспозиция порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "run", "start:prod"]