#!/bin/bash

echo "🚀 Начинаем сборку CarFax Web..."

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install --omit=dev
cd frontend && npm install --include=dev
cd ../backend && npm install --include=dev
cd ..

# Собираем приложение
echo "🔨 Собираем приложение..."
npm run build

echo "✅ Сборка завершена!"
