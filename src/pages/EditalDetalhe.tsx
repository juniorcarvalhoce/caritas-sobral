import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Download, ExternalLink, CalendarDays, CalendarCheck, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { tipoDoArquivo, abreNoNavegador } from "@/lib/arquivos";

type Edital = {
  id: string;
  nome: string;
  descricao: string | null;
  data_publicacao: string;
  data_finalizacao: string | null;
  status: "Aberto" | "Em andamento" | "Finalizado" | "Cancelado";
};

type EditalAnexo = {
  id: string;
  edital_id: string;
  descricao: string;
  arquivo_url: string;
  created_at: string;
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split('T')[0].split('-');
  if (!year || !month || !day) return "—";
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const corDoStatus: Record<Edital["status"], string> = {
  Aberto: "bg-green-50 text-green-700 ring-green-600/20",
  "Em andamento": "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  Finalizado: "bg-gray-50 text-gray-700 ring-gray-600/20",
  Cancelado: "bg-red-50 text-red-700 ring-red-600/20",
};

// O Supabase força o download quando a URL pública recebe o parâmetro "download"
const linkDeDownload = (url: string) => `${url}${url.includes("?") ? "&" : "?"}download=`;

const EditalDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: edital, isLoading: isLoadingEdital, isError: isErrorEdital } = useQuery({
    queryKey: ["edital-detalhe", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do edital não encontrado");
      const { data, error } = await supabase
        .from("editais")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Edital;
    },
  });

  const { data: anexos, isLoading: isLoadingAnexos, isError: isErrorAnexos } = useQuery({
    queryKey: ["edital-anexos", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("edital_anexos")
        .select("*")
        .eq("edital_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as EditalAnexo[];
    },
  });

  if (isLoadingEdital || isLoadingAnexos) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando edital...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isErrorEdital || !edital) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-2">Edital não encontrado</h1>
          <Button onClick={() => navigate("/editais")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para editais
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const informacoes = [
    { rotulo: "Publicação", valor: formatDate(edital.data_publicacao), icone: CalendarDays },
    { rotulo: "Finalização", valor: formatDate(edital.data_finalizacao), icone: CalendarCheck },
    { rotulo: "Anexos", valor: `${anexos?.length ?? 0} documento(s)`, icone: Paperclip },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 group text-muted-foreground" onClick={() => navigate("/editais")}>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar para editais
          </Button>

          {/* Cabeçalho: título e descrição à esquerda, resumo à direita */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Edital</p>
              <h1 className="font-heading text-2xl md:text-4xl font-bold leading-tight mb-4">{edital.nome}</h1>
              {edital.descricao && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{edital.descricao}</p>
              )}
            </div>

            <aside className="bg-card rounded-xl border p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Situação</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${corDoStatus[edital.status]}`}>
                  {edital.status}
                </span>
              </div>
              <dl className="space-y-3">
                {informacoes.map((info) => (
                  <div key={info.rotulo} className="flex items-start gap-3">
                    <info.icone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{info.rotulo}</dt>
                      <dd className="text-sm font-medium">{info.valor}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </aside>
          </div>

          {/* Documentos */}
          <section className="bg-card rounded-xl border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-lg">Documentos do edital</h2>
            </div>

            {isErrorAnexos ? (
              <p className="text-center text-destructive py-10 px-4">Erro ao carregar os documentos. Tente novamente mais tarde.</p>
            ) : (anexos?.length ?? 0) === 0 ? (
              <div className="text-center py-12 px-4 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Nenhum documento disponível</p>
                <p className="text-sm">Este edital ainda não possui anexos.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {anexos!.map((anexo) => {
                  const tipo = tipoDoArquivo(anexo.arquivo_url);
                  const visualizavel = abreNoNavegador(anexo.arquivo_url);
                  return (
                    <li key={anexo.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
                      <span className={`w-11 flex-shrink-0 text-center rounded-md py-1 text-[10px] font-bold ring-1 ring-inset ${tipo.classe}`}>
                        {tipo.rotulo}
                      </span>
                      <p className="flex-1 min-w-0 text-sm font-medium leading-snug">{anexo.descricao || "Documento"}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {visualizavel && (
                          <Button variant="ghost" size="sm" className="h-8" asChild>
                            <a href={anexo.arquivo_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4" />
                              <span className="hidden sm:inline">Visualizar</span>
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-8" asChild>
                          <a href={linkDeDownload(anexo.arquivo_url)} rel="noreferrer">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Baixar</span>
                          </a>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default EditalDetalhe;
