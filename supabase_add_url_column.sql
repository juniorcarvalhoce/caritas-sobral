-- ============================================
-- Adicionar coluna URL na tabela de Notícias
-- ============================================

-- Adicionar coluna url na tabela noticias
ALTER TABLE public.noticias 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.noticias.url IS 'URL externa da notícia completa (opcional)';

