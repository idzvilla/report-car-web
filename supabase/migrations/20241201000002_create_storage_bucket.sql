-- Создание bucket для хранения PDF отчётов

-- Создание bucket для PDF файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports-pdfs',
    'reports-pdfs',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf']
);

-- RLS политики для storage.objects
CREATE POLICY "Users can view their own report PDFs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'reports-pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Service role can upload PDFs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can update PDFs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can delete PDFs" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'reports-pdfs' AND
        auth.role() = 'service_role'
    );
