# Развёртывание CarFax Web

## Обзор

Данный документ описывает процесс развёртывания приложения CarFax Web в различных средах.

## Предварительные требования

### Инструменты
- Node.js 18+
- npm или yarn
- Supabase CLI
- Git
- Docker (опционально)

### Сервисы
- Supabase проект
- Stripe аккаунт
- Хостинг для frontend (Vercel, Netlify)
- Хостинг для backend (Railway, Heroku, DigitalOcean)

## Переменные окружения

### Backend (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# PDF Generation
PDF_STORAGE_BUCKET=reports-pdfs
PDF_TEMPLATE_PATH=./templates

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## Развёртывание Supabase

### 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запишите Project URL и API ключи

### 2. Применение миграций

```bash
# Свяжите проект
supabase link --project-ref your-project-ref

# Примените миграции
supabase db push --linked

# Проверьте статус
supabase migration list --linked
```

### 3. Настройка Storage

```sql
-- Создайте bucket для PDF файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports-pdfs',
    'reports-pdfs',
    false,
    52428800,
    ARRAY['application/pdf']
);
```

### 4. Настройка RLS политик

Убедитесь, что все RLS политики применены согласно `SUPABASE_SETUP.md`.

## Развёртывание Backend

### Вариант 1: Railway

1. **Подготовка проекта**
   ```bash
   # В директории backend
   npm run build
   ```

2. **Создание railway.json**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start:prod",
       "healthcheckPath": "/api/health"
     }
   }
   ```

3. **Развёртывание**
   - Подключите GitHub репозиторий
   - Настройте переменные окружения
   - Деплой автоматически запустится

### Вариант 2: Heroku

1. **Подготовка**
   ```bash
   # Установите Heroku CLI
   npm install -g heroku
   
   # Логин
   heroku login
   
   # Создайте приложение
   heroku create carfax-backend
   ```

2. **Настройка**
   ```bash
   # Добавьте переменные окружения
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   # ... остальные переменные
   ```

3. **Деплой**
   ```bash
   # Добавьте remote
   heroku git:remote -a carfax-backend
   
   # Деплой
   git push heroku main
   ```

### Вариант 3: DigitalOcean App Platform

1. **Создание приложения**
   - Перейдите в DigitalOcean App Platform
   - Создайте новое приложение из GitHub
   - Выберите backend директорию

2. **Настройка**
   - Укажите команду запуска: `npm run start:prod`
   - Добавьте переменные окружения
   - Настройте health check

### Вариант 4: Docker

1. **Создание Dockerfile**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "run", "start:prod"]
   ```

2. **Создание docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - SUPABASE_URL=${SUPABASE_URL}
         - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
         - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
         - JWT_SECRET=${JWT_SECRET}
         - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
   ```

3. **Запуск**
   ```bash
   docker-compose up -d
   ```

## Развёртывание Frontend

### Вариант 1: Vercel

1. **Подготовка**
   ```bash
   # В директории frontend
   npm run build
   ```

2. **Настройка vercel.json**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/carfax-frontend",
     "framework": "angular",
     "env": {
       "VITE_SUPABASE_URL": "@supabase_url",
       "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
       "VITE_API_URL": "@api_url"
     }
   }
   ```

3. **Деплой**
   - Подключите GitHub репозиторий
   - Настройте переменные окружения
   - Деплой автоматически запустится

### Вариант 2: Netlify

1. **Настройка netlify.toml**
   ```toml
   [build]
     base = "frontend"
     publish = "dist/carfax-frontend"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Деплой**
   - Подключите GitHub репозиторий
   - Настройте переменные окружения
   - Деплой автоматически запустится

### Вариант 3: GitHub Pages

1. **Настройка angular.json**
   ```json
   {
     "projects": {
       "carfax-frontend": {
         "architect": {
           "build": {
             "options": {
               "baseHref": "/carfax-web/",
               "deployUrl": "/carfax-web/"
             }
           }
         }
       }
     }
   }
   ```

2. **GitHub Actions**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: |
             cd frontend
             npm ci
             npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./frontend/dist/carfax-frontend
   ```

## Настройка Stripe

### 1. Создание продуктов

```bash
# Создайте продукты в Stripe Dashboard
# Single Report - $2.00
# Bulk Package - $99.00
```

### 2. Настройка Webhook

1. Перейдите в Stripe Dashboard > Webhooks
2. Добавьте endpoint: `https://your-backend-domain.com/api/v1/payments/webhook`
3. Выберите события:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Скопируйте webhook secret

### 3. Тестирование

```bash
# Установите Stripe CLI
stripe listen --forward-to localhost:3000/api/v1/payments/webhook

# Тестируйте платежи
stripe trigger payment_intent.succeeded
```

## Мониторинг и логирование

### 1. Health Checks

```typescript
// backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
```

### 2. Логирование

```typescript
// backend/src/common/logger/logger.service.ts
@Injectable()
export class LoggerService {
  private logger = new Logger();

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }
}
```

### 3. Мониторинг ошибок

```typescript
// Добавьте Sentry или аналогичный сервис
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Безопасность

### 1. HTTPS

Убедитесь, что все соединения используют HTTPS в продакшн.

### 2. CORS

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

### 3. Rate Limiting

```typescript
// backend/src/app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
    limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
  },
]),
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          npm ci
          npm run test:backend
          npm run test:frontend

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          # Deploy to production environment
```

## Troubleshooting

### Частые проблемы

1. **CORS ошибки**
   - Проверьте настройки CORS_ORIGIN
   - Убедитесь, что frontend и backend используют правильные домены

2. **Supabase подключение**
   - Проверьте URL и ключи
   - Убедитесь, что RLS политики настроены

3. **Stripe webhook**
   - Проверьте URL webhook
   - Убедитесь, что подпись проверяется

4. **PDF генерация**
   - Проверьте права доступа к storage
   - Убедитесь, что bucket создан

### Полезные команды

```bash
# Проверить статус Supabase
supabase status

# Просмотр логов
supabase logs

# Проверить миграции
supabase migration list --linked

# Тестирование API
curl -X GET https://your-backend-domain.com/api/health
```

## Масштабирование

### 1. Горизонтальное масштабирование

- Используйте load balancer
- Настройте несколько инстансов backend
- Используйте CDN для frontend

### 2. Вертикальное масштабирование

- Увеличьте ресурсы сервера
- Оптимизируйте запросы к БД
- Используйте кэширование

### 3. Мониторинг производительности

- Настройте APM (Application Performance Monitoring)
- Мониторьте метрики БД
- Настройте алерты
