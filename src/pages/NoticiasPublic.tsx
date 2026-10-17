import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoticiaCard, { type Noticia } from "@/components/NoticiaCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Newspaper, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const POR_PAGINA = 9;

// Ignora acentos e maiúsculas na busca ("acao" encontra "Ação")
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const NoticiasPublic = () => {
  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState<string>("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: noticias, isLoading, isError } = useQuery({
    queryKey: ["noticias-todas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, resumo, imagem_url, data_publicacao")
        .eq("ativo", true)
        .order("data_publicacao", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Noticia[];
    },
  });

  const anos = useMemo(
    () => Array.from(new Set((noticias ?? []).map((n) => n.data_publicacao?.slice(0, 4)).filter(Boolean))) as string[],
    [noticias]
  );

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return (noticias ?? []).filter((n) => {
      const casaAno = ano === "todos" || n.data_publicacao?.startsWith(ano);
      const casaBusca = !termo || normalizar(`${n.titulo} ${n.resumo ?? ""}`).includes(termo);
      return casaAno && casaBusca;
    });
  }, [noticias, busca, ano]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const irParaPagina = (p: number) => {
    setPagina(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <div className="max-w-3xl mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Cáritas Diocesana de Sobral</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Notícias</span> e Ações
          </h1>
          <p className="text-muted-foreground">
            Acompanhe as atividades, os projetos e as ações da Cáritas nas comunidades da Diocese de Sobral.
          </p>
        </div>

        {/* Busca e filtro por ano */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar notícias..."
              className="pl-9 bg-card"
              aria-label="Buscar notícias"
            />
          </div>
          {anos.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por ano">
              {["todos", ...anos].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setAno(a);
                    setPagina(1);
                  }}
                  aria-pressed={ano === a}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    ano === a ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary"
                  )}
                >
                  {a === "todos" ? "Todos os anos" : a}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[380px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {isError && <p className="text-center text-destructive py-16">Erro ao carregar as notícias. Tente novamente mais tarde.</p>}

        {noticias && filtradas.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium">Nenhuma notícia encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Tente outra busca ou escolha outro ano.</p>
          </div>
        )}

        {visiveis.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtradas.length} {filtradas.length === 1 ? "notícia" : "notícias"}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiveis.map((noticia) => (
                <NoticiaCard key={noticia.id} noticia={noticia} />
              ))}
            </div>
          </>
        )}

        {totalPaginas > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginação">
            <Button
              variant="outline"
              size="icon"
              onClick={() => irParaPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <Button
                key={i}
                variant={paginaAtual === i + 1 ? "default" : "outline"}
                size="icon"
                onClick={() => irParaPagina(i + 1)}
                aria-current={paginaAtual === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => irParaPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NoticiasPublic;
