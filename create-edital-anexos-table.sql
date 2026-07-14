-- Cria a tabela de anexos de editais
CREATE TABLE IF NOT EXISTS public.edital_anexos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  edital_id UUID NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security (se não estiver habilitado)
ALTER TABLE public.edital_anexos ENABLE ROW LEVEL SECURITY;

-- Cria política de leitura pública (para o site)
CREATE POLICY "Permite leitura pública de anexos de editais"
  ON public.edital_anexos
  FOR SELECT
  USING (true);

-- Cria política para usuários autenticados (admins)
CREATE POLICY "Permite todas as operações para usuários autenticados"
  ON public.edital_anexos
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
