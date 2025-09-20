-- Создание таблицы пользователей
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Telegram поля
    telegram_id TEXT UNIQUE,
    telegram_username TEXT,
    telegram_first_name TEXT,
    telegram_last_name TEXT,
    telegram_photo_url TEXT,
    auth_provider TEXT DEFAULT 'email' CHECK (auth_provider IN ('email', 'telegram')),
    
    -- Кредиты
    credits_total INTEGER DEFAULT 0,
    credits_remaining INTEGER DEFAULT 0,
    
    -- Роли
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Создание таблицы отчётов
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    vin TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Данные отчёта (JSON)
    report_data JSONB,
    
    -- Метаданные
    file_size INTEGER,
    processing_time INTEGER -- в секундах
);

-- Создание таблицы платежей
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    
    -- Платежная информация
    amount INTEGER NOT NULL, -- в копейках
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL, -- 'stripe', 'paypal', etc.
    payment_intent_id TEXT UNIQUE,
    
    -- Статус
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Дополнительные данные
    metadata JSONB,
    failure_reason TEXT
);

-- Создание таблицы кредитов (история операций)
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    
    -- Тип операции
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'admin_adjustment')),
    
    -- Количество кредитов
    credits_amount INTEGER NOT NULL, -- положительное для пополнения, отрицательное для списания
    
    -- Описание
    description TEXT,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Индексы для производительности
CREATE INDEX idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_vin ON public.reports(vin);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- RLS политики
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Политики для отчётов
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own reports" ON public.reports
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Политики для платежей
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для кредитов
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Админские политики (только для админов)
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
