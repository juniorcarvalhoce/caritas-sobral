-- ============================================
-- Tabela de Notícias para Cáritas Sobral
-- ============================================
CREATE TABLE IF NOT EXISTS public.noticias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    resumo TEXT NOT NULL,
    imagem_url TEXT,
    conteudo TEXT,
    url TEXT,
    data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Comentários nas colunas
COMMENT ON TABLE public.noticias IS 'Tabela para armazenar notícias e ações da Cáritas Diocesana de Sobral';
COMMENT ON COLUMN public.noticias.titulo IS 'Título da notícia';
COMMENT ON COLUMN public.noticias.resumo IS 'Resumo breve da notícia para exibição no carrossel';
COMMENT ON COLUMN public.noticias.imagem_url IS 'URL da imagem de destaque da notícia';
COMMENT ON COLUMN public.noticias.conteudo IS 'Conteúdo completo da notícia (opcional)';
COMMENT ON COLUMN public.noticias.url IS 'URL externa da notícia completa (opcional)';
COMMENT ON COLUMN public.noticias.data_publicacao IS 'Data de publicação da notícia';
COMMENT ON COLUMN public.noticias.ativo IS 'Indica se a notícia está ativa e deve ser exibida';

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_noticias_data_publicacao ON public.noticias(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_ativo ON public.noticias(ativo) WHERE ativo = true;

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_noticias_updated_at ON public.noticias;
CREATE TRIGGER update_noticias_updated_at
    BEFORE UPDATE ON public.noticias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura pública apenas para notícias ativas
CREATE POLICY "Permitir leitura pública de notícias ativas"
    ON public.noticias
    FOR SELECT
    USING (ativo = true);

-- Política: Permitir leitura completa para usuários autenticados (para área administrativa)
CREATE POLICY "Permitir leitura completa para autenticados"
    ON public.noticias
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Permitir inserção apenas para usuários autenticados
CREATE POLICY "Permitir inserção para autenticados"
    ON public.noticias
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política: Permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização para autenticados"
    ON public.noticias
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política: Permitir deleção apenas para usuários autenticados
CREATE POLICY "Permitir deleção para autenticados"
    ON public.noticias
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- Dados de exemplo (opcional)
-- ============================================

-- Inserir algumas notícias de exemplo
INSERT INTO public.noticias (titulo, resumo, imagem_url, data_publicacao, ativo) VALUES
(
    'Cáritas promove ação solidária no semiárido',
    'Ação beneficia mais de 200 famílias com distribuição de alimentos e produtos de higiene',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
    CURRENT_DATE - INTERVAL '5 days',
    true
),
(
    'Projeto de economia solidária ganha destaque',
    'Grupos de produção artesanal recebem capacitação e apoio para comercialização',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    CURRENT_DATE - INTERVAL '10 days',
    true
),
(
    'Juventudes participam de formação em políticas públicas',
    'Workshop reúne jovens de 8 municípios para debater participação social',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    CURRENT_DATE - INTERVAL '15 days',
    true
),
(
    'Feira agroecológica movimenta comunidade',
    'Produtos da agricultura familiar são comercializados em feira mensal',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    CURRENT_DATE - INTERVAL '20 days',
    true
);

