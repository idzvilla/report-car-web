# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Устанавливаем зависимости параллельно
RUN npm install --only=production && \
    cd frontend && npm ci --only=production && \
    cd ../backend && npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
