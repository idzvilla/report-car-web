-- Добавляем политику для создания пользователей
-- Позволяет аутентифицированным пользователям создавать свои записи в таблице users
CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Также добавляем политику для сервисной роли (для backend)
-- Это позволит backend создавать записи пользователей через service role
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Добавляем политику для админов на создание кредитных транзакций
CREATE POLICY "Admins can create credit transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Добавляем политику для сервисной роли на кредитные транзакции
CREATE POLICY "Service role can insert credit transactions" ON public.credit_transactions
    FOR INSERT TO service_role
    WITH CHECK (true);
