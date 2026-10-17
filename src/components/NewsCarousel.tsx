import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import NoticiaCard, { type Noticia } from "@/components/NoticiaCard";
import { cn } from "@/lib/utils";

// Tempo que cada notícia fica na tela antes de o carrossel avançar sozinho
const INTERVALO_MS = 6500;

const NewsCarousel = () => {
  const ref = useRef<HTMLElement>(null);
  const apareceu = useInView(ref, { once: true, margin: "-100px" });
  const visivel = useInView(ref, { amount: 0.3 });
  const reduzirMovimento = useReducedMotion();

  const [api, setApi] = useState<CarouselApi>();
  const [atual, setAtual] = useState(0);
  const [total, setTotal] = useState(0);
  const [mouseEmCima, setMouseEmCima] = useState(false);
  const [focado, setFocado] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [pausadoPeloUsuario, setPausadoPeloUsuario] = useState(false);
  const [abaOculta, setAbaOculta] = useState(false);

  const { data: noticias, isLoading, isError } = useQuery({
    queryKey: ["noticias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, resumo, imagem_url, data_publicacao")
        .eq("ativo", true)
        .order("data_publicacao", { ascending: false })
        .limit(10); // As 10 mais recentes; as demais ficam na página "Todas as notícias"

      if (error) throw error;
      return (data ?? []) as Noticia[];
    },
  });

  const destaque = noticias?.[0];
  const outras = noticias?.slice(1) ?? [];

  // Acompanha o carrossel: notícia atual, quantidade e arraste
  useEffect(() => {
    if (!api) return;
    const atualizar = () => {
      setTotal(api.scrollSnapList().length);
      setAtual(api.selectedScrollSnap());
    };
    const inicioArraste = () => setArrastando(true);
    const fimArraste = () => setArrastando(false);
    atualizar();
    api.on("select", atualizar);
    api.on("reInit", atualizar);
    api.on("pointerDown", inicioArraste);
    api.on("pointerUp", fimArraste);
    return () => {
      api.off("select", atualizar);
      api.off("reInit", atualizar);
      api.off("pointerDown", inicioArraste);
      api.off("pointerUp", fimArraste);
    };
  }, [api]);

  useEffect(() => {
    const aoMudar = () => setAbaOculta(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);

  const avancar = useCallback(() => {
    if (!api) return;
    if (api.canScrollNext()) api.scrollNext();
    else api.scrollTo(0);
  }, [api]);

  const voltar = useCallback(() => {
    if (!api) return;
    if (api.canScrollPrev()) api.scrollPrev();
    else api.scrollTo(api.scrollSnapList().length - 1);
  }, [api]);

  const autoplayDisponivel = !reduzirMovimento && total > 1;
  const pausado = pausadoPeloUsuario || mouseEmCima || focado || arrastando || !visivel || abaOculta;

  return (
    <section
      id="noticias-e-acoes"
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background"
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={apareceu ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10"
        >
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gradient">Notícias</span> e Ações
            </h2>
            <p className="text-muted-foreground">Acompanhe nossas atividades e projetos em andamento</p>
          </div>
          <Button variant="outline" asChild className="w-fit">
            <Link to="/noticias">
              Ver todas as notícias
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={apareceu ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isLoading && (
            <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6" aria-label="Carregando notícias">
              <div className="h-[380px] lg:h-[460px] rounded-2xl bg-muted animate-pulse" />
              <div className="hidden sm:grid grid-cols-2 gap-6">
                <div className="h-[460px] rounded-2xl bg-muted animate-pulse" />
                <div className="h-[460px] rounded-2xl bg-muted animate-pulse" />
              </div>
            </div>
          )}

          {isError && <div className="text-center text-destructive py-10">Erro ao carregar as notícias</div>}

          {!isLoading && !isError && !destaque && (
            <div className="text-center text-muted-foreground py-10">Nenhuma notícia disponível no momento</div>
          )}

          {destaque && (
            <div className={cn("grid gap-6", outras.length > 0 && "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
              <NoticiaCard noticia={destaque} destaque className="min-h-[380px] lg:min-h-[460px] h-full" />

              {outras.length > 0 && (
                <div
                  className="flex flex-col min-w-0"
                  role="region"
                  aria-roledescription="carrossel"
                  aria-label="Outras notícias"
                  onMouseEnter={() => setMouseEmCima(true)}
                  onMouseLeave={() => setMouseEmCima(false)}
                  onFocusCapture={() => setFocado(true)}
                  onBlurCapture={() => setFocado(false)}
                >
                  <Carousel setApi={setApi} opts={{ align: "start", loop: outras.length > 2 }} className="flex-1">
                    <CarouselContent className="-ml-4 h-full">
                      {outras.map((noticia, index) => (
                        <CarouselItem
                          key={noticia.id}
                          className="pl-4 basis-full sm:basis-1/2"
                          aria-roledescription="slide"
                          aria-label={`${index + 1} de ${outras.length}`}
                        >
                          <NoticiaCard noticia={noticia} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>

                  {total > 1 && (
                    <div className="mt-5 space-y-4">
                      {/* Barra de progresso: quando enche, o carrossel avança */}
                      {autoplayDisponivel && (
                        <div className="h-1 rounded-full bg-border overflow-hidden" aria-hidden="true">
                          <div
                            key={atual}
                            className="h-full bg-primary origin-left"
                            style={{
                              animation: `noticia-progresso ${INTERVALO_MS}ms linear forwards`,
                              animationPlayState: pausado ? "paused" : "running",
                            }}
                            onAnimationEnd={avancar}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Array.from({ length: total }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => api?.scrollTo(i)}
                              aria-label={`Ir para a notícia ${i + 1}`}
                              aria-current={i === atual}
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                i === atual ? "w-6 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50"
                              )}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {autoplayDisponivel && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full"
                              onClick={() => setPausadoPeloUsuario((p) => !p)}
                              aria-label={pausadoPeloUsuario ? "Retomar passagem automática" : "Pausar passagem automática"}
                              title={pausadoPeloUsuario ? "Retomar" : "Pausar"}
                            >
                              {pausadoPeloUsuario ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={voltar}
                            aria-label="Notícia anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={avancar}
                            aria-label="Próxima notícia"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsCarousel;
