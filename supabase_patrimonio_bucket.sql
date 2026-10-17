-- ============================================
-- Permissões do bucket de fotos do Patrimônio
-- ============================================
-- Execute uma vez no Supabase: SQL Editor > New query > cole este arquivo > Run.
-- É seguro rodar mais de uma vez: as políticas antigas com o mesmo nome são recriadas.

-- Garante que o bucket exista e seja público para leitura das fotos (limite de 5 MB por arquivo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patrimonio',
  'patrimonio',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- O bucket é público: as fotos abrem pelo link sem precisar de política de leitura.
-- Uma política SELECT ampla permitiria listar todos os arquivos, então ela é removida.
DROP POLICY IF EXISTS "Patrimonio: leitura pública das fotos" ON storage.objects;

DROP POLICY IF EXISTS "Patrimonio: upload por usuários autenticados" ON storage.objects;
CREATE POLICY "Patrimonio: upload por usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patrimonio');

DROP POLICY IF EXISTS "Patrimonio: atualização por usuários autenticados" ON storage.objects;
CREATE POLICY "Patrimonio: atualização por usuários autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patrimonio');

DROP POLICY IF EXISTS "Patrimonio: exclusão por usuários autenticados" ON storage.objects;
CREATE POLICY "Patrimonio: exclusão por usuários autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patrimonio');
