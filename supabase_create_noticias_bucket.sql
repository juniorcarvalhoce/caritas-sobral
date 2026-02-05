-- ============================================
-- Criar bucket para imagens de notícias
-- ============================================

-- Criar o bucket 'noticias' se não existir
-- Nota: A criação de buckets via SQL requer permissões de superuser
-- Se não funcionar, crie manualmente no Dashboard do Supabase:
-- Storage > New bucket > Nome: "noticias" > Public: true

-- Verificar se o bucket já existe e criar se não existir
DO $$
BEGIN
  -- Tentar criar o bucket (pode falhar se já existir, mas não é problema)
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'noticias',
    'noticias',
    true,
    5242880, -- 5MB limite
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Política RLS para permitir leitura pública
CREATE POLICY "Permitir leitura pública de imagens de notícias"
ON storage.objects FOR SELECT
USING (bucket_id = 'noticias');

-- Política RLS para permitir upload apenas para usuários autenticados
CREATE POLICY "Permitir upload de imagens para autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'noticias');

-- Política RLS para permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização de imagens para autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'noticias');

-- Política RLS para permitir deleção apenas para usuários autenticados
CREATE POLICY "Permitir deleção de imagens para autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'noticias');

