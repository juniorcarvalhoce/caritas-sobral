import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown, Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Edital = {
  id: string;
  nome: string;
  descricao: string | null;
  data_publicacao: string; // YYYY-MM-DD
  status: "Aberto" | "Em andamento" | "Finalizado" | "Cancelado";
  data_finalizacao: string | null;
  documento_url: string | null;
};

const statusOptions = ["Aberto", "Em andamento", "Finalizado", "Cancelado"] as const;
const PAGE_SIZE = 9;

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  // Trata a data como local (YYYY-MM-DD) para evitar problemas de timezone
  const [year, month, day] = dateStr.split('T')[0].split('-');
  if (!year || !month || !day) return "—";
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
};

// Função para calcular o status dinâmico baseado na data de finalização
const getStatusDinamico = (edital: Edital): Edital["status"] => {
  // Se o status for "Cancelado", mantém como está
  if (edital.status === "Cancelado") {
    return "Cancelado";
  }

  // Se não houver data de finalização, retorna o status original
  if (!edital.data_finalizacao) {
    return edital.status;
  }

  // Obtém a data de hoje no timezone do Brasil (America/Sao_Paulo)
  const hojeBrasil = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  // Trata a data de finalização como local (YYYY-MM-DD)
  const [year, month, day] = edital.data_finalizacao.split('T')[0].split('-');
  if (!year || !month || !day) return edital.status;
  
  // Compara apenas as datas (sem horas)
  const hojeSemHora = new Date(hojeBrasil.getFullYear(), hojeBrasil.getMonth(), hojeBrasil.getDate());
  const finalizacaoSemHora = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Se hoje for maior que a data de finalização (limite para inscrição)
  if (hojeSemHora > finalizacaoSemHora) {
    // Se o usuário definiu manualmente como "Em andamento", mantém
    if (edital.status === "Em andamento") {
      return "Em andamento";
    }
    // Caso contrário, muda automaticamente para "Finalizado"
    return "Finalizado";
  }

  // Se hoje for menor ou igual à data de finalização, mantém o status original
  return edital.status;
};

const EditaisPublic = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const queryKey = useMemo(() => ["public-editais", { search, statusFilter, page }], [search, statusFilter, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      // Busca todos os editais (sem filtrar por status no banco, pois precisamos calcular o status dinâmico)
      let q = supabase
        .from("editais")
        .select("id,nome,descricao,data_publicacao,status,data_finalizacao,documento_url", { count: "exact" })
        .order("data_publicacao", { ascending: false });

      if (search) q = q.ilike("nome", `%${search}%`);

      const { data, error, count } = await q;
      if (error) throw error;
      
      // Aplica o status dinâmico baseado na data de finalização
      let itemsComStatus = (data ?? []).map((item: Edital) => ({
        ...item,
        status: getStatusDinamico(item),
      }));
      
      // Aplica o filtro de status após calcular o status dinâmico
      if (statusFilter) {
        itemsComStatus = itemsComStatus.filter((item) => item.status === statusFilter);
      }
      
      // Aplica paginação após filtrar
      const totalFiltrado = itemsComStatus.length;
      const itemsPaginados = itemsComStatus.slice(
        (page - 1) * PAGE_SIZE,
        (page - 1) * PAGE_SIZE + PAGE_SIZE
      );
      
      return { items: itemsPaginados as Edital[], count: totalFiltrado };
    },
  });

  const totalPages = useMemo(() => {
    const count = data?.count ?? 0;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [data?.count]);

  return (
    <div className="min-h-screen">
      <Header />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <section className="container mx-auto px-4 pt-28 pb-12">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Editais</h1>
            <p className="text-muted-foreground mt-2">Consulte os editais disponíveis e filtre por status ou nome.</p>
          </div>

          <Card className="glass rounded-3xl border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading text-foreground">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    Buscar por nome
                  </label>
                  <Input
                    placeholder="Digite o nome do edital..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 bg-background/80 border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Filtrar por status
                  </label>
                  <Select
                    value={statusFilter ?? "all"}
                    onValueChange={(v) => {
                      setStatusFilter(v === "all" ? undefined : v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 bg-background/80 border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            {/* Indicador de resultados */}
            {!isLoading && data && (
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-muted-foreground">
                  {data.count > 0 ? (
                    <span>
                      <span className="font-semibold text-foreground">{data.count}</span> edital(is) encontrado(s)
                    </span>
                  ) : (
                    <span>Nenhum resultado encontrado</span>
                  )}
                </div>
                {(search || statusFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter(undefined);
                      setPage(1);
                    }}
                    className="text-xs"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="text-center text-muted-foreground py-10">Carregando editais...</div>
            )}
            {isError && (
              <div className="text-center text-destructive py-10">Erro ao carregar os editais</div>
            )}
            {!isLoading && (data?.items?.length ?? 0) === 0 && (
              <div className="text-center text-muted-foreground py-10">
                {search || statusFilter ? "Nenhum edital encontrado com os filtros aplicados" : "Nenhum edital encontrado"}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.items ?? []).map((edital) => (
                <Card key={edital.id} className="rounded-2xl border-primary/20">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">{edital.nome}</h2>
                    {edital.descricao && (
                      <p className="text-muted-foreground mt-2 line-clamp-3">{edital.descricao}</p>
                    )}
                    <div className="mt-4 space-y-1 text-sm">
                      <div><span className="font-semibold">Publicação:</span> {formatDate(edital.data_publicacao)}</div>
                      <div><span className="font-semibold">Status:</span> {edital.status}</div>
                      <div><span className="font-semibold">Limite para Inscrição:</span> {formatDate(edital.data_finalizacao)}</div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        className="gap-2"
                        asChild
                        disabled={!edital.documento_url}
                        title={edital.documento_url ? "Baixar edital" : "Documento não disponível"}
                      >
                        <a href={edital.documento_url ?? undefined} target="_blank" rel="noreferrer">
                          <FileDown className="w-5 h-5" />
                          <span className="sr-only">Baixar</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {data && (data.count ?? 0) > PAGE_SIZE && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>
                    <div className="px-3 text-sm text-muted-foreground">Página {page} de {Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE))}</div>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE)), p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </section>
      </motion.main>

      <Footer />
    </div>
  );
};

export default EditaisPublic;