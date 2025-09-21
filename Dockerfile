# Этап 1: Сборка frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Копируем package.json и устанавливаем зависимости
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем исходный код frontend
COPY frontend/ .

# Собираем frontend
RUN npx ng build --output-path=../backend/frontend/dist/carfax-frontend

# Этап 2: Сборка backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Копируем package.json и устанавливаем ВСЕ зависимости (включая dev)
COPY backend/package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем исходный код backend
COPY backend/ .

# Собираем backend
RUN npm run build

# Этап 3: Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем собранные файлы
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=frontend-builder /app/backend/frontend/dist ./backend/frontend/dist

# Копируем корневой package.json
COPY package*.json ./

# Устанавливаем только production зависимости для backend и корня
RUN cd backend && npm ci --only=production --no-audit --no-fund
RUN npm ci --only=production --no-audit --no-fund

# Устанавливаем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
