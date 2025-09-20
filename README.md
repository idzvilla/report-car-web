# CarFax Web - Веб-сервис отчётов по VIN

Веб-сервис для получения отчётов по VIN-номерам автомобилей с системой оплаты и управления пользователями.

## Функционал

- 🔍 **Поиск по VIN**: Пользователь вводит VIN → получает отчёт
- 💳 **Система оплаты**: Single report ($2) или Bulk (100 reports за $99)
- 📄 **PDF отчёты**: Генерация и скачивание отчётов в PDF формате
- 👤 **Управление пользователями**: Регистрация, профиль, баланс credits
- 🔐 **Безопасность**: RLS политики, JWT аутентификация, rate limiting
- 👨‍💼 **Админ панель**: Управление отчётами и пользователями

## Технологический стек

### Frontend
- **Angular** (LTS) - основной фреймворк
- **shadcn/ui** - UI компоненты
- **TypeScript** - типизация

### Backend
- **NestJS** - Node.js фреймворк
- **TypeScript** - типизация
- **Jest** - тестирование

### База данных и инфраструктура
- **Supabase** - PostgreSQL + Auth + Storage
- **RLS** - Row Level Security политики
- **Storage** - хранение PDF файлов

### Дополнительно
- **PDFKit/Puppeteer** - генерация PDF
- **OpenAPI/Swagger** - документация API
- **Rate Limiting** - защита от злоупотреблений

## Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Supabase CLI

### Установка

1. **Клонируйте репозиторий и установите зависимости:**
```bash
git clone <repository-url>
cd carfax-web
npm run install:all
```

2. **Настройте Supabase:**
```bash
# Установите Supabase CLI
npm install -g supabase

# Инициализируйте проект
supabase init

# Запустите локальную базу данных
supabase start
```

3. **Настройте переменные окружения:**
```bash
# Backend
cp backend/.env.example backend/.env
# Отредактируйте backend/.env с вашими настройками

# Frontend  
cp frontend/.env.example frontend/.env
# Отредактируйте frontend/.env с вашими настройками
```

4. **Примените миграции базы данных:**
```bash
supabase db push
```

5. **Запустите проект:**
```bash
# Разработка (оба сервиса одновременно)
npm run dev

# Или отдельно:
npm run dev:frontend  # Angular на порту 4200
npm run dev:backend   # NestJS на порту 3000
```

### Доступ к приложению

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API документация**: http://localhost:3000/api
- **Supabase Dashboard**: http://localhost:54323

## Структура проекта

```
carfax-web/
├── frontend/                 # Angular приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI компоненты
│   │   │   ├── pages/        # Страницы приложения
│   │   │   ├── services/     # Сервисы для API
│   │   │   └── guards/       # Route guards
│   │   └── assets/
│   └── package.json
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── modules/          # Модули приложения
│   │   ├── common/           # Общие компоненты
│   │   └── main.ts
│   └── package.json
├── supabase/                 # Supabase конфигурация
│   ├── migrations/           # SQL миграции
│   ├── schemas/              # Схемы базы данных
│   └── config.toml
└── docs/                     # Документация
    ├── ARCHITECTURE.md
    ├── API_SPEC.md
    ├── SUPABASE_SETUP.md
    └── DEPLOY.md
```

## Основные команды

```bash
# Разработка
npm run dev                  # Запуск всех сервисов
npm run dev:frontend         # Только frontend
npm run dev:backend          # Только backend

# Сборка
npm run build                # Сборка всех сервисов
npm run build:frontend       # Сборка frontend
npm run build:backend        # Сборка backend

# Тестирование
npm run test                 # Все тесты
npm run test:frontend        # Frontend тесты
npm run test:backend         # Backend тесты

# База данных
supabase start               # Запуск локальной БД
supabase db push             # Применить миграции
supabase db reset            # Сброс БД
```

## Документация

- [Архитектура системы](docs/ARCHITECTURE.md)
- [API спецификация](docs/API_SPEC.md)
- [Настройка Supabase](docs/SUPABASE_SETUP.md)
- [Миграции базы данных](docs/MIGRATIONS.md)
- [Развёртывание](docs/DEPLOY.md)
- [TODO и планы](docs/TODO.md)

## Лицензия

MIT License
