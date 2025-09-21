# Используем готовый образ с Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только package.json файлы
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Устанавливаем зависимости с кэшированием
RUN npm install --only=production --no-audit --no-fund
RUN cd frontend && npm install --no-audit --no-fund
RUN cd backend && npm install --no-audit --no-fund

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
