-- ============================================
-- Conteúdo do site editável pelo painel (ex.: textos e foto da seção "Sobre")
-- ============================================
-- Execute uma vez no Supabase: SQL Editor > New query > cole este arquivo > Run.
-- Enquanto isso não for feito, o site usa os textos e a foto padrão.
-- As fotos são enviadas para o bucket "noticias" (pasta site/), que já tem permissão de envio.

CREATE TABLE IF NOT EXISTS public.conteudo_site (
  chave text PRIMARY KEY,
  valor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conteudo_site ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conteudo: leitura pública" ON public.conteudo_site;
CREATE POLICY "Conteudo: leitura pública"
ON public.conteudo_site FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Conteudo: inclusão por autenticados" ON public.conteudo_site;
CREATE POLICY "Conteudo: inclusão por autenticados"
ON public.conteudo_site FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Conteudo: alteração por autenticados" ON public.conteudo_site;
CREATE POLICY "Conteudo: alteração por autenticados"
ON public.conteudo_site FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Conteudo: exclusão por autenticados" ON public.conteudo_site;
CREATE POLICY "Conteudo: exclusão por autenticados"
ON public.conteudo_site FOR DELETE
TO authenticated
USING (true);
