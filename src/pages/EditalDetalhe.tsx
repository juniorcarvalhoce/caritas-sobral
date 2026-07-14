import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, ArrowLeft } from "lucide-react";

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
  return d.toLocaleDateString("pt-BR");
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
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">Carregando...</div>
        <Footer />
      </div>
    );
  }

  if (isErrorEdital || !edital) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">Edital não encontrado</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/editais")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para editais
        </Button>

        <Card className="glass rounded-3xl shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">{edital.nome}</CardTitle>
            <div className="text-sm text-muted-foreground mt-2">
              Publicado em: {formatDate(edital.data_publicacao)} | Status: {edital.status}
            </div>
          </CardHeader>
          {edital.descricao && (
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{edital.descricao}</p>
            </CardContent>
          )}
        </Card>

        <Card className="glass rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            {isErrorAnexos ? (
              <div className="text-center text-destructive">Erro ao carregar anexos</div>
            ) : (anexos?.length ?? 0) === 0 ? (
              <div className="text-center text-muted-foreground">Nenhum anexo disponível</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anexos!.map((anexo) => (
                  <Card key={anexo.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{anexo.descricao}</h3>
                      <Button asChild className="w-full">
                        <a href={anexo.arquivo_url} target="_blank" rel="noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          Abrir arquivo
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditalDetalhe;
