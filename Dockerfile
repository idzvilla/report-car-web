# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
RUN npm install --omit=dev
RUN cd frontend && npm install
RUN cd backend && npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
