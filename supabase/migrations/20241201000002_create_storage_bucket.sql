-- Создание bucket для PDF отчётов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports-pdfs',
    'reports-pdfs',
    false, -- приватный bucket
    10485760, -- 10MB лимит
    ARRAY['application/pdf']
);

-- RLS политики для storage
CREATE POLICY "Users can upload own reports" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'reports-pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own reports" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reports-pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own reports" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'reports-pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Админы могут видеть все файлы
CREATE POLICY "Admins can view all reports" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reports-pdfs' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );
