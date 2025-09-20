# CarFax Web - VIN Отчёты с Telegram Авторизацией

Полнофункциональный веб-сервис для получения отчётов CarFax по VIN номерам с авторизацией через Telegram.

## 🚀 Особенности

- **Angular Frontend** - современный UI с Tailwind CSS
- **NestJS Backend** - TypeScript API сервер
- **Supabase** - база данных, аутентификация и хранение файлов
- **Telegram OAuth** - авторизация через Telegram
- **PDF Генерация** - создание отчётов в PDF формате
- **Система оплаты** - single ($2) и bulk ($99) тарифы
- **Админ панель** - управление пользователями и отчётами

## 📋 Требования

- Node.js 18+
- npm или yarn
- Supabase аккаунт
- Telegram бот (для авторизации)

## 🛠️ Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/idzvilla/report-car-web.git
cd report-car-web
```

### 2. Установка зависимостей

```bash
# Установка зависимостей для всех частей проекта
npm install

# Или установка по отдельности
cd frontend && npm install
cd ../backend && npm install
cd ../worker && npm install
```

### 3. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Скопируйте `backend/env.example` в `backend/.env`
3. Заполните переменные окружения:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Добавьте токен в `backend/.env`
4. Настройте домен для Telegram Login Widget

Подробные инструкции в [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)

### 5. Применение миграций Supabase

```bash
# Установка Supabase CLI
npm install -g supabase

# Логин в Supabase
supabase login

# Применение миграций
supabase db push
```

## 🚀 Запуск

### Разработка

```bash
# Запуск всех сервисов
npm run dev

# Или по отдельности:

# Backend (порт 3000)
cd backend && npm run start:dev

# Frontend (порт 4200)
cd frontend && npm start

# Worker (опционально)
cd worker && npm run dev
```

### Продакшн

```bash
# Сборка фронтенда
cd frontend && npm run build

# Запуск бэкенда
cd backend && npm run start:prod
```

## 📁 Структура проекта

```
report-car-web/
├── frontend/          # Angular приложение
├── backend/           # NestJS API сервер
├── worker/            # PDF генератор (опционально)
├── supabase/          # Миграции и конфигурация БД
├── docs/              # Документация
└── docker-compose.yml # Docker конфигурация
```

## 🔧 API Endpoints

### Аутентификация
- `GET /api/auth/telegram` - Telegram OAuth callback

### Отчёты
- `POST /api/v1/reports/request` - Запрос отчёта
- `GET /api/v1/reports/:id` - Получить отчёт
- `GET /api/v1/reports/:id/download` - Скачать PDF

### Платежи
- `POST /api/payments/create` - Создать платеж
- `POST /api/payments/webhook` - Webhook для обработки платежей

### Пользователи
- `GET /api/users/profile` - Профиль пользователя

### Админ
- `GET /api/admin/stats` - Статистика системы

## 🎨 UI Компоненты

- **Главная страница** - ввод VIN и получение отчётов
- **Paywall модал** - выбор тарифа (single/bulk)
- **Профиль пользователя** - информация о Telegram аккаунте
- **Админ панель** - управление системой

## 🔐 Безопасность

- Row Level Security (RLS) в Supabase
- JWT токены для аутентификации
- Валидация данных на бэкенде
- Rate limiting для API

## 📊 Мониторинг

- Health check: `GET /api/health`
- Swagger документация: `http://localhost:3000/api/docs`

## 🐳 Docker

```bash
# Запуск через Docker Compose
docker-compose up -d
```

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте [Issue](https://github.com/idzvilla/report-car-web/issues) в репозитории.

---

**Сделано с ❤️ для получения отчётов CarFax по VIN**