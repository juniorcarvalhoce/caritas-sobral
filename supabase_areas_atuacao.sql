-- ============================================
-- Áreas de atuação: fotos e textos editáveis pelo painel
-- ============================================
-- Execute uma vez no Supabase: SQL Editor > New query > cole este arquivo > Run.
-- Enquanto isso não for feito, o site usa as fotos e os textos padrão.
-- As fotos são enviadas para o bucket "noticias" (pasta areas/), que já tem permissão de envio.

CREATE TABLE IF NOT EXISTS public.areas_atuacao (
  slug text PRIMARY KEY,
  descricao text,
  foto_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.areas_atuacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Areas: leitura pública" ON public.areas_atuacao;
CREATE POLICY "Areas: leitura pública"
ON public.areas_atuacao FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Areas: inclusão por autenticados" ON public.areas_atuacao;
CREATE POLICY "Areas: inclusão por autenticados"
ON public.areas_atuacao FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Areas: alteração por autenticados" ON public.areas_atuacao;
CREATE POLICY "Areas: alteração por autenticados"
ON public.areas_atuacao FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Areas: exclusão por autenticados" ON public.areas_atuacao;
CREATE POLICY "Areas: exclusão por autenticados"
ON public.areas_atuacao FOR DELETE
TO authenticated
USING (true);
