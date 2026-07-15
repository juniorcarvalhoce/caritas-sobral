import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Search, Eye, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Edital = {
  id: string;
  nome: string;
  descricao: string | null;
  data_publicacao: string;
  status: "Aberto" | "Em andamento" | "Finalizado" | "Cancelado";
  data_finalizacao: string | null;
};

const statusOptions = ["Aberto", "Em andamento", "Finalizado", "Cancelado"] as const;
const PAGE_SIZE = 9;

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Aberto":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "Em andamento":
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case "Finalizado":
      return <FileText className="w-5 h-5 text-gray-600" />;
    case "Cancelado":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto":
      return "bg-green-50 text-green-700 ring-green-600/20";
    case "Em andamento":
      return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
    case "Finalizado":
      return "bg-gray-50 text-gray-700 ring-gray-600/20";
    case "Cancelado":
      return "bg-red-50 text-red-700 ring-red-600/20";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-600/20";
  }
};

const EditaisPublic = () => {
  const navigate = useNavigate();
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
        .select("*", { count: "exact" })
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

      <motion.main 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-b from-background via-primary/5 to-background"
      >
        <section className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Editais
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Consulte os editais disponíveis e acessar os anexos.
            </p>
          </div>

          <Card className="glass rounded-3xl border-2 border-primary/20 shadow-lg mb-12">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading text-foreground">Filtrar Editais</CardTitle>
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

          <div>
            {/* Indicador de resultados */}
            {!isLoading && data && (
              <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-muted-foreground">
                  {data.count > 0 ? (
                    <span>
                      <span className="font-semibold text-foreground">{data.count}</span> edital{data.count !== 1 ? "ais" : ""} encontrado{data.count !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span>Nenhum edital encontrado</span>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="rounded-2xl border-primary/20 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {isError && (
              <Card className="rounded-2xl border-red-200 bg-red-50">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-destructive text-lg font-medium">Erro ao carregar os editais</p>
                  <p className="text-muted-foreground mt-2">Tente novamente mais tarde.</p>
                </CardContent>
              </Card>
            )}
            {!isLoading && (data?.items?.length ?? 0) === 0 && (
              <Card className="rounded-2xl border-gray-200">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {search || statusFilter ? "Nenhum edital encontrado com os filtros aplicados" : "Nenhum edital encontrado"}
                  </h3>
                  <p className="text-muted-foreground">
                    {search || statusFilter ? "Tente remover alguns filtros para encontrar o edital que procura." : "Em breve teremos editais disponíveis."}
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((edital, index) => (
                  <motion.div
                    key={edital.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card 
                      className="rounded-2xl border-primary/20 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                    >
                      <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(edital.status)}
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusColor(edital.status)}`}>
                              {edital.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(edital.data_publicacao)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        <CardTitle className="text-xl font-semibold mb-2">
                          {edital.nome}
                        </CardTitle>
                        {edital.descricao ? (
                          <p className="text-muted-foreground mt-2 text-sm flex-1">
                            {edital.descricao}
                          </p>
                        ) : (
                          <div className="flex-1" />
                        )}
                        {edital.data_finalizacao && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Limite para inscrição: {formatDate(edital.data_finalizacao)}</span>
                          </div>
                        )}
                        <div className="mt-auto pt-6">
                          <Button 
                            className="w-full group" 
                            onClick={() => navigate(`/edital/${edital.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                            Ver anexos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {data && (data.count ?? 0) > PAGE_SIZE && (
              <div className="mt-12">
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
                    <div className="px-3 text-sm text-muted-foreground">Página {page} de {totalPages}</div>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
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
