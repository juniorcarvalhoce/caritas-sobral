import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Newspaper } from "lucide-react";

type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  data_publicacao: string; // YYYY-MM-DD
  conteudo: string | null;
  url: string | null;
  ativo: boolean;
};

// Função para formatar data
const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  // Trata a data como local (YYYY-MM-DD) para evitar problemas de timezone
  const [year, month, day] = dateStr.split('T')[0].split('-');
  if (!year || !month || !day) return "—";
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
};

// Função para normalizar URL (adiciona protocolo se não tiver)
const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Remove espaços
  url = url.trim();
  
  // Se já começa com http:// ou https://, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se começa com //, adiciona https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // Caso contrário, adiciona https://
  return `https://${url}`;
};

const NewsCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Buscar notícias do Supabase
  const { data: noticias, isLoading, isError } = useQuery({
    queryKey: ["noticias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, resumo, imagem_url, data_publicacao, conteudo, url, ativo")
        .eq("ativo", true)
        .order("data_publicacao", { ascending: false })
        .limit(10); // Limitar a 10 notícias mais recentes

      if (error) throw error;
      return (data ?? []) as Noticia[];
    },
  });

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">Notícias</span> e Ações
          </h2>
          <p className="text-muted-foreground">Acompanhe nossas atividades e projetos em andamento</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isLoading && (
            <div className="text-center text-muted-foreground py-10">
              Carregando notícias...
            </div>
          )}

          {isError && (
            <div className="text-center text-destructive py-10">
              Erro ao carregar as notícias
            </div>
          )}

          {!isLoading && !isError && (!noticias || noticias.length === 0) && (
            <div className="text-center text-muted-foreground py-10">
              Nenhuma notícia disponível no momento
            </div>
          )}

          {!isLoading && !isError && noticias && noticias.length > 0 && (
            <Carousel
              opts={{
                align: "start",
                loop: noticias.length > 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {noticias.map((noticia, index) => (
                  <CarouselItem key={noticia.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="relative overflow-hidden">
                          {noticia.imagem_url ? (
                            <img
                              src={noticia.imagem_url}
                              alt={noticia.titulo}
                              className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                // Fallback para imagem padrão se houver erro
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x600?text=Notícia";
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 md:h-56 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Newspaper className="w-16 h-16 text-primary/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-2 text-white/90 text-xs mb-2">
                              <Newspaper className="w-4 h-4" />
                              <span>{formatDate(noticia.data_publicacao)}</span>
                            </div>
                            <h3 className="font-heading text-lg md:text-xl font-semibold text-white line-clamp-2">
                              {noticia.titulo}
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-4 md:p-6 flex-1 flex flex-col">
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                            {noticia.resumo}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center gap-2 group/btn"
                            asChild
                          >
                            {noticia.url ? (
                              <a
                                href={normalizeUrl(noticia.url) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ler mais (Externo)
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            ) : (
                              <Link to={`/noticia/${noticia.id}`}>
                                Ler mais
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {noticias.length > 1 && (
                <>
                  <CarouselPrevious className="hidden md:flex -left-12 bg-background/80 border-primary/30 hover:border-primary" />
                  <CarouselNext className="hidden md:flex -right-12 bg-background/80 border-primary/30 hover:border-primary" />
                </>
              )}
            </Carousel>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsCarousel;

