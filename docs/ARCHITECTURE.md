# Архитектура системы CarFax Web

## Обзор системы

CarFax Web - это веб-сервис для получения отчётов по VIN-номерам автомобилей с системой оплаты и управления пользователями.

## Диаграмма архитектуры

```mermaid
graph TB
    subgraph "Frontend (Angular)"
        A[Angular App] --> B[Auth Service]
        A --> C[Reports Service]
        A --> D[Payments Service]
        B --> E[Auth Guard]
        C --> F[VIN Input Component]
        C --> G[Report Card Component]
        D --> H[Paywall Modal]
    end

    subgraph "Backend (NestJS)"
        I[API Gateway] --> J[Auth Module]
        I --> K[Reports Module]
        I --> L[Payments Module]
        I --> M[Users Module]
        I --> N[Admin Module]
        J --> O[JWT Strategy]
        K --> P[PDF Service]
        L --> Q[Stripe Integration]
    end

    subgraph "Database (Supabase)"
        R[PostgreSQL] --> S[Reports Table]
        R --> T[Payments Table]
        R --> U[User Credits Table]
        R --> V[Profiles Table]
        R --> W[RLS Policies]
    end

    subgraph "Storage (Supabase)"
        X[Storage Bucket] --> Y[PDF Reports]
        X --> Z[Signed URLs]
    end

    subgraph "External Services"
        AA[Stripe API] --> L
        BB[PDF Generation] --> P
    end

    A --> I
    I --> R
    P --> X
    Q --> AA
```

## Компоненты системы

### Frontend (Angular)

**Технологии:**
- Angular 17 (LTS)
- TypeScript
- Tailwind CSS
- RxJS

**Основные модули:**
- `AuthModule` - аутентификация и авторизация
- `ReportsModule` - работа с отчётами
- `PaymentsModule` - обработка платежей
- `AdminModule` - административная панель

**Сервисы:**
- `AuthService` - управление пользователями
- `ReportsService` - API для отчётов
- `PaymentsService` - интеграция с Stripe

### Backend (NestJS)

**Технологии:**
- NestJS (Node.js фреймворк)
- TypeScript
- JWT аутентификация
- Swagger документация

**Модули:**
- `AuthModule` - аутентификация (JWT, Supabase Auth)
- `ReportsModule` - управление отчётами
- `PaymentsModule` - обработка платежей (Stripe)
- `UsersModule` - управление пользователями
- `AdminModule` - административные функции
- `PdfModule` - генерация PDF отчётов

**Middleware:**
- Rate limiting (защита от злоупотреблений)
- CORS настройки
- Валидация данных (class-validator)

### База данных (Supabase)

**PostgreSQL таблицы:**
- `reports` - отчёты по VIN
- `payments` - история платежей
- `user_credits` - баланс credits пользователей
- `profiles` - профили пользователей

**Безопасность:**
- Row Level Security (RLS) политики
- JWT токены для аутентификации
- Service role для административных операций

**Storage:**
- Bucket `reports-pdfs` для хранения PDF файлов
- Signed URLs для безопасного доступа

### Внешние сервисы

**Stripe:**
- Обработка платежей
- Webhook для подтверждения оплаты
- Поддержка single и bulk платежей

**PDF Generation:**
- PDFKit для создания PDF отчётов
- Puppeteer для сложной генерации (если нужно)

## Потоки данных

### 1. Запрос отчёта по VIN

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant S as Storage

    U->>F: Вводит VIN
    F->>B: POST /api/v1/reports/request
    B->>D: Проверяет существующий отчёт
    alt Отчёт существует
        D-->>B: Возвращает отчёт
        B-->>F: Статус: available/payment_required
    else Отчёт не существует
        B->>D: Создаёт новый отчёт
        B->>B: Генерирует PDF
        B->>S: Сохраняет PDF
        B-->>F: Статус: generating
    end
```

### 2. Процесс оплаты

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Stripe
    participant D as Database

    U->>F: Выбирает тип оплаты
    F->>B: POST /api/v1/payments/create
    B->>S: Создаёт Payment Intent
    S-->>B: Возвращает client_secret
    B->>D: Сохраняет информацию о платеже
    B-->>F: Возвращает client_secret
    F->>S: Обрабатывает платеж
    S->>B: Webhook: payment_intent.succeeded
    B->>D: Обновляет статус платежа
    B->>D: Обновляет credits пользователя
```

### 3. Генерация PDF

```mermaid
sequenceDiagram
    participant B as Backend
    participant P as PDF Service
    participant S as Storage
    participant D as Database

    B->>P: Генерирует отчёт
    P->>P: Создаёт PDF с данными
    P->>S: Загружает PDF в bucket
    S-->>P: Возвращает имя файла
    P-->>B: Возвращает имя файла
    B->>D: Обновляет отчёт с именем файла
```

## Безопасность

### Аутентификация
- JWT токены через Supabase Auth
- Refresh token для обновления сессий
- Автоматическое создание профилей при регистрации

### Авторизация
- RLS политики в PostgreSQL
- Guards в Angular для защиты роутов
- Проверка прав доступа на уровне API

### Защита данных
- Валидация всех входных данных
- Rate limiting для предотвращения злоупотреблений
- Шифрование чувствительных данных

## Масштабируемость

### Горизонтальное масштабирование
- Stateless backend (можно запускать несколько инстансов)
- CDN для статических файлов
- Load balancer для распределения нагрузки

### Вертикальное масштабирование
- Оптимизация запросов к базе данных
- Кэширование часто запрашиваемых данных
- Асинхронная обработка PDF генерации

## Мониторинг и логирование

### Логирование
- Структурированные логи в JSON формате
- Различные уровни логирования (error, warn, info, debug)
- Централизованный сбор логов

### Мониторинг
- Health checks для всех сервисов
- Метрики производительности
- Алерты при критических ошибках

## Развёртывание

### Локальная разработка
- Docker Compose для локального окружения
- Hot reload для frontend и backend
- Автоматические миграции базы данных

### Продакшн
- CI/CD pipeline с автоматическим тестированием
- Blue-green deployment для zero-downtime
- Автоматическое масштабирование на основе нагрузки
