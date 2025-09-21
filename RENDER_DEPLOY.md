# Деплой на Render.com

## Шаги для деплоя:

1. **Зарегистрируйтесь на Render.com**
   - Перейдите на https://render.com
   - Войдите через GitHub

2. **Подключите репозиторий**
   - Нажмите "New +"
   - Выберите "Web Service"
   - Подключите ваш GitHub репозиторий
   - Выберите ветку `main`

3. **Render автоматически определит настройки из render.yaml**

4. **Настройте переменные окружения:**

```
NODE_ENV=production
PORT=10000

# Supabase (если используете)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS
CORS_ORIGIN=https://your-app-name.onrender.com

# Telegram Bot (если используете)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Stripe (если используете)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

5. **Нажмите Deploy**

## Преимущества Render:

- ✅ Бесплатный план
- ✅ Автоматические деплои из GitHub
- ✅ SSL сертификаты
- ✅ Простая настройка
- ✅ Хорошая производительность

## После деплоя:

- Ваше приложение будет доступно по адресу: `https://your-app-name.onrender.com`
- API: `https://your-app-name.onrender.com/api`
- Swagger: `https://your-app-name.onrender.com/api/docs`
