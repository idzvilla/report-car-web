#!/bin/bash

echo "🚀 Начинаем сборку CarFax Web..."

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install --only=production
cd frontend && npm install
cd ../backend && npm install
cd ..

# Собираем приложение
echo "🔨 Собираем приложение..."
npm run build

echo "✅ Сборка завершена!"
