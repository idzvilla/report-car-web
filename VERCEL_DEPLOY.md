# Деплой на Vercel - CarFax Web

## 🚀 Быстрый старт

### 1. Подготовка
```bash
# Убедитесь, что код загружен в GitHub
git add .
git commit -m "feat: добавлена конфигурация для Vercel"
git push origin main
```

### 2. Создание проекта на Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий `report-car-web`
5. Нажмите "Import"

### 3. Настройка переменных окружения
В настройках проекта добавьте:

#### Supabase
- `SUPABASE_URL` - ваш Supabase URL
- `SUPABASE_ANON_KEY` - ваш Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - ваш Supabase service role key

#### JWT
- `JWT_SECRET` - секретный ключ для JWT
- `JWT_EXPIRES_IN` - время жизни токена (например, `7d`)

#### Telegram Bot
- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота

#### Stripe
- `STRIPE_SECRET_KEY` - ваш Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - ваш Stripe webhook secret

#### Другие
- `NODE_ENV` - `production`
- `CORS_ORIGIN` - URL вашего Vercel приложения (будет автоматически)

### 4. Настройка сборки
- **Framework Preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `frontend/dist/carfax-frontend`
- **Install Command**: `npm install`

### 5. Деплой
Нажмите "Deploy" и ждите завершения сборки.

## 📝 Структура проекта для Vercel

```
/
├── vercel.json          # Конфигурация Vercel
├── package.json         # Корневой package.json
├── frontend/            # Angular приложение
│   ├── dist/carfax-frontend/  # Собранный фронтенд
│   └── package.json
├── backend/             # NestJS API
│   ├── dist/            # Собранный бэкенд
│   └── package.json
└── README.md
```

## 🔧 Особенности Vercel

- **API Routes**: `/api/*` автоматически направляются на NestJS
- **Static Files**: Все остальные запросы обслуживают статические файлы Angular
- **Environment Variables**: Настраиваются в панели Vercel
- **Automatic Deployments**: При каждом push в main ветку

## 🚨 Важные моменты

1. **CORS**: Обновите `CORS_ORIGIN` после деплоя на URL Vercel
2. **Webhooks**: Настройте Stripe webhooks на `https://your-app.vercel.app/api/payments/webhook`
3. **Telegram Bot**: Обновите webhook URL в настройках бота

## 📊 Мониторинг

- **Logs**: Доступны в панели Vercel
- **Analytics**: Встроенная аналитика
- **Performance**: Мониторинг производительности

## 🆘 Решение проблем

### Ошибка сборки
- Проверьте, что все зависимости установлены
- Убедитесь, что Angular CLI доступен

### Ошибка CORS
- Обновите `CORS_ORIGIN` на правильный URL

### Ошибка авторизации
- Проверьте правильность Supabase ключей
- Убедитесь, что JWT_SECRET установлен
