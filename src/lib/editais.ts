// Ordem das listas de editais: Abertos, depois Em andamento, depois Finalizados e, por último, Cancelados.
// Dentro de cada grupo, do mais recente para o mais antigo pela data de publicação.
const PRIORIDADE_STATUS: Record<string, number> = {
  Aberto: 0,
  "Em andamento": 1,
  Finalizado: 2,
  Cancelado: 3,
};

type EditalOrdenavel = { status: string; data_publicacao?: string | null; created_at?: string | null };

export const ordenarEditais = <T extends EditalOrdenavel>(editais: T[]): T[] =>
  [...editais].sort((a, b) => {
    const porStatus = (PRIORIDADE_STATUS[a.status] ?? 9) - (PRIORIDADE_STATUS[b.status] ?? 9);
    if (porStatus !== 0) return porStatus;
    const porData = (b.data_publicacao ?? "").localeCompare(a.data_publicacao ?? "");
    if (porData !== 0) return porData;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
