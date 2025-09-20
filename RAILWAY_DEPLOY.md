# 🚀 Деплой на Railway

## 📋 Подготовка проекта

Проект уже очищен и готов к деплою. Удалены:
- ❌ Worker (PDF генератор)
- ❌ Supabase миграции
- ❌ Docker файлы
- ❌ Документация
- ❌ Тестовые файлы

## 🔧 Настройка Railway

### 1. Создание аккаунта
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Подключите ваш репозиторий

### 2. Создание проекта
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите репозиторий `idzvilla/report-car-web`
4. Нажмите "Deploy Now"

### 3. Настройка переменных окружения

В настройках проекта добавьте переменные:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-app-name.railway.app

# Stripe Configuration (опционально)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# PDF Generation
PDF_STORAGE_BUCKET=reports-pdfs
PDF_TEMPLATE_PATH=./templates
```

### 4. Настройка домена

1. В настройках проекта перейдите в "Domains"
2. Добавьте кастомный домен или используйте Railway домен
3. Обновите `CORS_ORIGIN` с новым доменом

### 5. Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/setdomain`
3. Выберите вашего бота
4. Введите домен: `your-app-name.railway.app` (без https://)

## 🚀 Деплой

### Автоматический деплой
Railway автоматически деплоит при каждом push в main ветку.

### Ручной деплой
1. В панели Railway нажмите "Deploy"
2. Дождитесь завершения сборки
3. Проверьте логи на ошибки

## 🔍 Проверка деплоя

### 1. Health Check
```
GET https://your-app-name.railway.app/api/health
```

### 2. API Documentation
```
https://your-app-name.railway.app/api/docs
```

### 3. Frontend
```
https://your-app-name.railway.app
```

## 📊 Мониторинг

### Логи
- Перейдите в "Deployments"
- Выберите последний деплой
- Просмотрите логи

### Метрики
- CPU использование
- Память
- Сетевой трафик

## 🔧 Troubleshooting

### Ошибки сборки
1. Проверьте логи сборки
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения

### Ошибки runtime
1. Проверьте логи приложения
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к Supabase

### CORS ошибки
1. Обновите `CORS_ORIGIN` с правильным доменом
2. Перезапустите приложение

## 💰 Стоимость

Railway предлагает:
- **Free tier**: $5 кредитов в месяц
- **Pro**: $20/месяц за неограниченное использование

## 📱 Настройка фронтенда

После деплоя обновите URL в фронтенде:

```typescript
// В frontend/src/app/services/auth.service.ts
private apiUrl = 'https://your-app-name.railway.app/api/v1';
```

## 🎉 Готово!

Ваш проект теперь доступен по адресу:
`https://your-app-name.railway.app`

---

**Примечание**: Не забудьте настроить Supabase и Telegram бота перед использованием!
