# 🚀 Развертывание CarFax Web на Railway

## 📋 Переменные окружения для Railway

Создайте следующие переменные окружения в настройках Railway:

### 🔧 Обязательные переменные:

```bash
# Supabase Configuration
SUPABASE_URL=https://rwqdneuhexxsvtxyacym.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWRuZXVoZXh4c3Z0eHlhY3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTg5MzcsImV4cCI6MjA3Mzg5NDkzN30.o9JFBoObzBURc9QTkGBwqbcMimR_dzf_ksgeHgNr2x8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWRuZXVoZXh4c3Z0eHlhY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMxODkzNywiZXhwIjoyMDczODk0OTM3fQ.auI0FYeTBmkAhshsWkq_KLbFMSbPtGYYOAyMOHSQpis

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRES_IN=7d

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7427373200:AAFzwSoAMMhy0DO5pzaqLS8_8c6Nyxi2zkU

# Server Configuration
PORT=3000
NODE_ENV=production

# Stripe Configuration (замените на ваши ключи)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# PDF Generation
PDF_STORAGE_BUCKET=reports-pdfs
PDF_TEMPLATE_PATH=./templates

# CORS (замените на ваш Railway URL)
CORS_ORIGIN=https://your-app-name.railway.app
```

## 🚀 Шаги развертывания:

1. **Подключите GitHub репозиторий к Railway:**
   - Зайдите на [railway.app](https://railway.app)
   - Войдите через GitHub
   - Нажмите "New Project" → "Deploy from GitHub repo"
   - Выберите репозиторий `idzvilla/report-car-web`

2. **Настройте переменные окружения:**
   - В настройках проекта Railway перейдите в "Variables"
   - Добавьте все переменные из списка выше
   - **ВАЖНО:** Замените `CORS_ORIGIN` на ваш Railway URL после деплоя

3. **Настройте домен (опционально):**
   - В настройках проекта перейдите в "Settings" → "Domains"
   - Добавьте ваш кастомный домен

4. **Мониторинг:**
   - Railway автоматически перезапустит приложение при изменениях в коде
   - Логи доступны в разделе "Deployments"

## 🔍 Проверка работоспособности:

После деплоя проверьте:
- ✅ API доступно: `https://your-app.railway.app/api/health`
- ✅ Swagger документация: `https://your-app.railway.app/api/docs`
- ✅ Фронтенд: `https://your-app.railway.app` (если настроен статический сервер)

## 📝 Примечания:

- Railway автоматически определит Node.js проект
- Приложение будет доступно по HTTPS
- Все переменные окружения зашифрованы
- Автоматические деплои при push в main ветку