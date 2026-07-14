import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

type Edital = {
  id: string;
  nome: string;
  descricao: string | null;
  data_publicacao: string;
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
  return d.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "ppt":
    case "pptx":
      return "📽️";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "zip":
    case "rar":
      return "📦";
    default:
      return "📎";
  }
};

const EditalDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            className="mb-8 group" 
            onClick={() => navigate("/editais")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Voltar para editais
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {edital.nome}
              </h1>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Publicado em {formatDate(edital.data_publicacao)}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  edital.status === "Aberto" 
                    ? "bg-green-50 text-green-700 ring-green-600/20" 
                    : edital.status === "Em andamento"
                    ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                    : edital.status === "Finalizado"
                    ? "bg-gray-50 text-gray-700 ring-gray-600/20"
                    : "bg-red-50 text-red-700 ring-red-600/20"
                }`}>
                  {edital.status}
                </span>
              </div>
              {edital.descricao && (
                <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
                  {edital.descricao}
                </p>
              )}
            </div>

            <Card className="glass rounded-3xl shadow-2xl overflow-hidden border-0">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="font-heading text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Anexos do Edital
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {isErrorAnexos ? (
                  <div className="text-center text-destructive py-8">
                    <p>Erro ao carregar anexos. Tente novamente mais tarde.</p>
                  </div>
                ) : (anexos?.length ?? 0) === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">Nenhum anexo disponível</p>
                    <p>Este edital ainda não possui anexos.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {anexos!.map((anexo, index) => (
                      <motion.div
                        key={anexo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative overflow-hidden"
                      >
                        <a
                          href={anexo.arquivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <div className="flex items-center gap-4 p-4 md:p-6 bg-background/80 rounded-2xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 group-hover:bg-primary/5">
                            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                              {getFileIcon(anexo.arquivo_url)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors truncate">
                                {anexo.descricao}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Clique para abrir o arquivo
                              </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <Download className="w-5 h-5 md:w-6 md:h-6" />
                              </div>
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default EditalDetalhe;
