# Миграции базы данных CarFax Web

## Обзор

Данный документ описывает работу с миграциями базы данных в проекте CarFax Web, использующем Supabase.

## Структура миграций

```
supabase/
├── migrations/
│   ├── 20241201000001_initial_schema.sql
│   ├── 20241201000002_create_storage_bucket.sql
│   └── ...
└── config.toml
```

## Основные команды

### Локальная разработка

```bash
# Запуск локального Supabase
supabase start

# Остановка
supabase stop

# Сброс базы данных
supabase db reset

# Применить все миграции
supabase db push

# Применить конкретную миграцию
supabase migration up

# Откатить миграцию
supabase migration down

# Создать новую миграцию
supabase migration new migration_name

# Просмотр статуса миграций
supabase migration list
```

### Продакшн

```bash
# Применить миграции в продакшн
supabase db push --linked

# Проверить статус миграций
supabase migration list --linked

# Создать дамп базы данных
supabase db dump --linked > backup.sql
```

## Создание миграций

### 1. Создание новой миграции

```bash
# Создать миграцию с описанием
supabase migration new add_user_preferences_table

# Это создаст файл: supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences_table.sql
```

### 2. Написание миграции

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences_table.sql

-- Создание таблицы
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(5) DEFAULT 'ru',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Включение RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS политики
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Триггер для updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3. Применение миграции

```bash
# Применить миграцию локально
supabase migration up

# Или применить все миграции
supabase db push
```

## Типы миграций

### 1. Создание таблиц

```sql
-- Пример создания таблицы
CREATE TABLE public.example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Изменение таблиц

```sql
-- Добавление колонки
ALTER TABLE public.example_table 
ADD COLUMN new_field VARCHAR(50);

-- Изменение типа колонки
ALTER TABLE public.example_table 
ALTER COLUMN name TYPE VARCHAR(200);

-- Добавление ограничения
ALTER TABLE public.example_table 
ADD CONSTRAINT check_name_length CHECK (length(name) >= 3);

-- Удаление колонки
ALTER TABLE public.example_table 
DROP COLUMN old_field;
```

### 3. Создание индексов

```sql
-- Простой индекс
CREATE INDEX idx_example_name ON public.example_table(name);

-- Составной индекс
CREATE INDEX idx_example_name_active ON public.example_table(name, is_active);

-- Уникальный индекс
CREATE UNIQUE INDEX idx_example_unique_field ON public.example_table(unique_field);

-- Частичный индекс
CREATE INDEX idx_example_active_only ON public.example_table(name) 
WHERE is_active = true;
```

### 4. RLS политики

```sql
-- Включение RLS
ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

-- Политика для SELECT
CREATE POLICY "Users can view their own records" ON public.example_table
    FOR SELECT USING (auth.uid() = user_id);

-- Политика для INSERT
CREATE POLICY "Users can create their own records" ON public.example_table
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для UPDATE
CREATE POLICY "Users can update their own records" ON public.example_table
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Политика для DELETE
CREATE POLICY "Users can delete their own records" ON public.example_table
    FOR DELETE USING (auth.uid() = user_id);

-- Публичная политика (все могут читать)
CREATE POLICY "Public read access" ON public.example_table
    FOR SELECT USING (true);
```

### 5. Функции и триггеры

```sql
-- Создание функции
CREATE OR REPLACE FUNCTION public.example_function(param1 TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'Hello ' || param1;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера
CREATE TRIGGER example_trigger
    BEFORE INSERT OR UPDATE ON public.example_table
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 6. Storage bucket

```sql
-- Создание bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'example-bucket',
    'example-bucket',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- RLS политики для storage
CREATE POLICY "Users can upload to their folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'example-bucket' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'example-bucket' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Откат миграций

### 1. Создание down миграции

```sql
-- В том же файле миграции добавить комментарий с down миграцией
-- DOWN MIGRATION:
-- DROP TABLE public.example_table;
-- DROP FUNCTION public.example_function(TEXT);
```

### 2. Откат вручную

```sql
-- Выполнить SQL для отката изменений
DROP TABLE public.example_table;
DROP FUNCTION public.example_function(TEXT);
```

## Тестирование миграций

### 1. Локальное тестирование

```bash
# Сбросить БД и применить все миграции
supabase db reset

# Проверить, что все таблицы созданы
supabase db diff

# Проверить RLS политики
psql -h localhost -p 54322 -U postgres -d postgres -c "
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
"
```

### 2. Проверка целостности

```sql
-- Проверить внешние ключи
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- Проверить индексы
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Безопасность миграций

### 1. Проверка перед применением

```bash
# Проверить синтаксис SQL
psql -h localhost -p 54322 -U postgres -d postgres -c "
\i supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
"

# Проверить, что миграция не сломает существующие данные
supabase db diff --schema public
```

### 2. Резервное копирование

```bash
# Создать бэкап перед применением миграции
supabase db dump --linked > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа при необходимости
psql -h localhost -p 54322 -U postgres -d postgres < backup_20241201_120000.sql
```

## Мониторинг миграций

### 1. Логи миграций

```bash
# Просмотр логов
supabase logs --service db

# Фильтрация по миграциям
supabase logs --service db | grep migration
```

### 2. Статус миграций

```sql
-- Проверить применённые миграции
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- Проверить версию схемы
SELECT current_setting('server_version');
```

## Troubleshooting

### Частые проблемы

1. **Миграция не применяется**
   ```bash
   # Проверить синтаксис
   supabase migration list
   
   # Принудительно применить
   supabase db push --force
   ```

2. **Конфликт миграций**
   ```bash
   # Сбросить и применить заново
   supabase db reset
   ```

3. **RLS блокирует операции**
   ```sql
   -- Временно отключить RLS для отладки
   ALTER TABLE public.example_table DISABLE ROW LEVEL SECURITY;
   
   -- Выполнить операцию
   -- Включить RLS обратно
   ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;
   ```

### Полезные команды

```bash
# Показать различия между локальной и удалённой БД
supabase db diff --linked

# Синхронизировать схему
supabase db pull --linked

# Проверить статус Supabase
supabase status

# Перезапустить Supabase
supabase stop && supabase start
```

## Best Practices

1. **Всегда тестируйте миграции локально**
2. **Создавайте бэкапы перед применением в продакшн**
3. **Используйте транзакции для сложных миграций**
4. **Документируйте изменения в комментариях**
5. **Не удаляйте колонки сразу, сначала помечайте как deprecated**
6. **Используйте IF EXISTS/IF NOT EXISTS для безопасности**
7. **Проверяйте RLS политики после изменений**
