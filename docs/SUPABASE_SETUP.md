# Настройка Supabase для CarFax Web

## Обзор

Данный документ описывает настройку Supabase для проекта CarFax Web, включая создание таблиц, RLS политик, storage bucket и настройку аутентификации.

## Предварительные требования

1. Установленный Supabase CLI
2. Аккаунт Supabase
3. Локальная среда разработки

## Установка Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
winget install Supabase.CLI

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

## Инициализация проекта

```bash
# В корневой директории проекта
supabase init

# Войдите в аккаунт Supabase
supabase login

# Свяжите проект с удалённым проектом
supabase link --project-ref <your-project-ref>
```

## Локальная разработка

```bash
# Запуск локального Supabase
supabase start

# Остановка
supabase stop

# Сброс локальной БД
supabase db reset
```

## Структура базы данных

### Таблицы

#### 1. reports
Хранит информацию об отчётах по VIN.

```sql
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'error')),
    price DECIMAL(10,2) NOT NULL DEFAULT 2.00,
    pdf_file_name VARCHAR(255),
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. payments
История платежей пользователей.

```sql
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('single', 'bulk')),
    amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. user_credits
Баланс credits пользователей.

```sql
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    credits_total INTEGER NOT NULL DEFAULT 0,
    credits_remaining INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. profiles
Расширенная информация о пользователях.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Индексы

```sql
-- Индексы для оптимизации запросов
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_vin ON public.reports(vin);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
```

## Row Level Security (RLS)

### Включение RLS

```sql
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Политики безопасности

#### Таблица reports

```sql
-- Пользователи могут видеть только свои отчёты
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои отчёты
CREATE POLICY "Users can create their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои отчёты
CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);
```

#### Таблица payments

```sql
-- Пользователи могут видеть только свои платежи
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои платежи
CREATE POLICY "Users can create their own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Таблица user_credits

```sql
-- Пользователи могут видеть только свои credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои credits
CREATE POLICY "Users can create their own credits" ON public.user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои credits
CREATE POLICY "Users can update their own credits" ON public.user_credits
    FOR UPDATE USING (auth.uid() = user_id);
```

#### Таблица profiles

```sql
-- Профили видны всем
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Пользователи могут создавать свой профиль
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

## Storage Bucket

### Создание bucket

```sql
-- Создание bucket для PDF файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports-pdfs',
    'reports-pdfs',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf']
);
```

### RLS политики для Storage

```sql
-- Пользователи могут скачивать PDF своих отчётов
CREATE POLICY "Users can view their own report PDFs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reports-pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Service role может загружать PDF
CREATE POLICY "Service role can upload PDFs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );

-- Service role может обновлять PDF
CREATE POLICY "Service role can update PDFs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );

-- Service role может удалять PDF
CREATE POLICY "Service role can delete PDFs" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );
```

## Функции и триггеры

### Автоматическое создание профиля

```sql
-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Обновление updated_at

```sql
-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## Применение миграций

### Локальная разработка

```bash
# Применить все миграции
supabase db push

# Применить конкретную миграцию
supabase migration up

# Откатить миграцию
supabase migration down
```

### Продакшн

```bash
# Применить миграции в продакшн
supabase db push --linked

# Проверить статус миграций
supabase migration list --linked
```

## Настройка переменных окружения

### Backend (.env)

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3000/api/v1
```

## Получение ключей

### Локальная разработка

```bash
# Получить ключи для локальной разработки
supabase status

# Вывод будет содержать:
# API URL: http://localhost:54321
# anon key: eyJ...
# service_role key: eyJ...
```

### Продакшн

1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings > API
4. Скопируйте:
   - Project URL
   - anon public key
   - service_role secret key

## Тестирование RLS

### Создание тестового пользователя

```sql
-- В SQL Editor Supabase Dashboard
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);
```

### Проверка RLS

```sql
-- Войти как пользователь
SET LOCAL "request.jwt.claims" TO '{"sub": "user_id_here"}';

-- Проверить доступ к данным
SELECT * FROM public.reports;
SELECT * FROM public.payments;
SELECT * FROM public.user_credits;
```

## Мониторинг и отладка

### Логи

```bash
# Просмотр логов Supabase
supabase logs

# Логи конкретного сервиса
supabase logs --service api
supabase logs --service db
supabase logs --service auth
```

### Отладка RLS

```sql
-- Включить отладку RLS
SET row_security = on;

-- Проверить политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Резервное копирование

### Создание бэкапа

```bash
# Создать дамп базы данных
supabase db dump > backup.sql

# Создать дамп с данными
supabase db dump --data-only > data_backup.sql
```

### Восстановление

```bash
# Восстановить из дампа
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

## Безопасность

### Рекомендации

1. **Никогда не используйте service_role ключ в frontend**
2. **Регулярно ротируйте ключи**
3. **Мониторьте использование API**
4. **Настройте алерты на подозрительную активность**
5. **Используйте HTTPS в продакшн**

### Аудит

```sql
-- Включить аудит для критических таблиц
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Настроить аудит для таблицы payments
ALTER TABLE public.payments SET (pgaudit.log = 'write');
```

## Troubleshooting

### Частые проблемы

1. **RLS блокирует запросы**
   - Проверьте, что пользователь аутентифицирован
   - Убедитесь, что политики правильно настроены

2. **Storage недоступен**
   - Проверьте настройки bucket
   - Убедитесь, что RLS политики для storage настроены

3. **Миграции не применяются**
   - Проверьте синтаксис SQL
   - Убедитесь, что нет конфликтов с существующими объектами

### Полезные команды

```bash
# Проверить статус Supabase
supabase status

# Перезапустить Supabase
supabase stop && supabase start

# Очистить кэш
supabase db reset
```
