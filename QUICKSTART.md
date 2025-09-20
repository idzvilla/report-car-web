# 🚀 Быстрый старт CarFax Web

## Предварительные требования

- Node.js 18+
- npm или yarn
- Supabase CLI
- Git

## Установка

### 1. Клонирование и установка зависимостей

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd carfax-web

# Установите зависимости для всех проектов
npm run install:all
```

### 2. Настройка Supabase

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в аккаунт Supabase
supabase login

# Инициализируйте проект
supabase init

# Запустите локальную базу данных
supabase start
```

### 3. Настройка переменных окружения

#### Backend
```bash
# Скопируйте пример файла
cp backend/env.example backend/.env

# Отредактируйте .env файл с вашими настройками
# Получите ключи из: supabase status
```

#### Frontend
```bash
# Создайте .env файл в frontend директории
echo "VITE_SUPABASE_URL=http://localhost:54321" > frontend/.env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key_here" >> frontend/.env
echo "VITE_API_URL=http://localhost:3000/api/v1" >> frontend/.env
```

### 4. Применение миграций

```bash
# Примените миграции базы данных
supabase db push
```

## Запуск проекта

### Вариант 1: Локальная разработка

```bash
# Запустите все сервисы одновременно
npm run dev

# Или запустите отдельно:
# Backend (порт 3000)
npm run dev:backend

# Frontend (порт 4200)
npm run dev:frontend
```

### Вариант 2: Docker

```bash
# Запустите все сервисы в Docker
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Вариант 3: PDF Worker

```bash
# Запустите worker для генерации PDF
cd worker
npm install
npm run dev
```

## Доступ к приложению

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API документация**: http://localhost:3000/api
- **Supabase Dashboard**: http://localhost:54323

## Тестирование

```bash
# Запустите все тесты
npm run test

# Тесты backend
npm run test:backend

# Тесты frontend
npm run test:frontend
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
supabase stop                # Остановка БД
```

## Структура проекта

```
carfax-web/
├── frontend/                 # Angular приложение
│   ├── src/app/
│   │   ├── components/       # UI компоненты
│   │   ├── pages/           # Страницы
│   │   ├── services/        # API сервисы
│   │   └── guards/          # Route guards
│   └── package.json
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── modules/         # Модули приложения
│   │   ├── common/          # Общие компоненты
│   │   └── main.ts
│   └── package.json
├── worker/                   # PDF Worker
│   ├── src/
│   │   ├── pdf-generator.ts
│   │   └── index.ts
│   └── package.json
├── supabase/                 # Supabase конфигурация
│   ├── migrations/          # SQL миграции
│   └── config.toml
└── docs/                    # Документация
    ├── ARCHITECTURE.md
    ├── API_SPEC.md
    └── DEPLOY.md
```

## Первые шаги

1. **Запустите проект** согласно инструкциям выше
2. **Откройте** http://localhost:4200 в браузере
3. **Зарегистрируйтесь** или войдите в систему
4. **Введите VIN** автомобиля для получения отчёта
5. **Оплатите** отчёт или используйте bulk пакет

## Troubleshooting

### Проблемы с Supabase

```bash
# Проверьте статус
supabase status

# Перезапустите
supabase stop && supabase start

# Сбросьте БД
supabase db reset
```

### Проблемы с зависимостями

```bash
# Очистите кэш
npm cache clean --force

# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с портами

```bash
# Проверьте, какие порты заняты
lsof -i :3000
lsof -i :4200
lsof -i :54321

# Убейте процессы
kill -9 <PID>
```

## Получение помощи

- 📚 **Документация**: См. папку `docs/`
- 🐛 **Проблемы**: Создайте issue в репозитории
- 💬 **Поддержка**: Обратитесь к команде разработки

## Следующие шаги

После успешного запуска проекта:

1. Изучите [архитектуру системы](docs/ARCHITECTURE.md)
2. Ознакомьтесь с [API документацией](docs/API_SPEC.md)
3. Настройте [развёртывание](docs/DEPLOY.md)
4. Посмотрите [список задач](docs/TODO.md)

Удачной разработки! 🎉
