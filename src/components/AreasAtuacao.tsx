import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, MapPin, Newspaper, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/AnimatedCounter";
import Trajetoria from "@/components/Trajetoria";
import FaixaParceiros from "@/components/FaixaParceiros";
import { useAreasAtuacao, areasPadrao } from "@/data/areas";
import { projetos, temas, anosDoProjeto, type Projeto } from "@/data/projetos";
import { cn } from "@/lib/utils";

const PROJETOS_VISIVEIS = 4;

const ordenarPorAno = (lista: Projeto[]) => [...lista].sort((a, b) => anosDoProjeto(b)[0] - anosDoProjeto(a)[0]);

const FotoArea = ({ src, cor, icone: Icone }: { src: string | null; cor: string; icone: typeof Utensils }) => {
  const [falhou, setFalhou] = useState(false);
  return (
    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
      {src && !falhou ? (
        <img src={src} alt="" loading="lazy" onError={() => setFalhou(true)} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: `${cor}1A` }}>
          <Icone className="w-16 h-16" style={{ color: cor }} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: cor }} />
    </div>
  );
};

const AreasAtuacao = () => {
  const ref = useRef<HTMLElement>(null);
  const apareceu = useInView(ref, { once: true, margin: "-100px" });
  const { data: areas = areasPadrao } = useAreasAtuacao();
  const [selecionada, setSelecionada] = useState("agua-e-semiarido");
  const [verTodos, setVerTodos] = useState(false);
  const abasRef = useRef<(HTMLButtonElement | null)[]>([]);

  const area = areas.find((a) => a.slug === selecionada) ?? areas[0];
  const cor = temas[area.tema].cor;

  const resumoPorTema = useMemo(
    () =>
      Object.fromEntries(
        areas.map((a) => {
          const lista = projetos.filter((p) => p.tema === a.tema);
          return [
            a.slug,
            {
              lista,
              municipios: new Set(lista.flatMap((p) => p.municipios)).size,
              desde: Math.min(...lista.map((p) => anosDoProjeto(p)[0])),
            },
          ];
        })
      ),
    [areas]
  );

  const { lista, municipios, desde } = resumoPorTema[area.slug];
  const emAndamento = lista.filter((p) => p.emAndamento);
  const anteriores = ordenarPorAno(lista.filter((p) => !p.emAndamento));
  const visiveis = verTodos ? anteriores : anteriores.slice(0, PROJETOS_VISIVEIS);

  const escolher = (slug: string) => {
    setSelecionada(slug);
    setVerTodos(false);
  };

  // Setas do teclado navegam entre as abas
  const aoTeclar = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key as string];
    if (!delta) return;
    e.preventDefault();
    const proximo = (indice + delta + areas.length) % areas.length;
    escolher(areas[proximo].slug);
    abasRef.current[proximo]?.focus();
  };

  const verNoMapa = () => {
    window.dispatchEvent(new CustomEvent("filtrar-mapa", { detail: area.tema }));
    document.getElementById("onde-atuamos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="projetos" ref={ref} className="py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={apareceu ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Nossas <span className="text-gradient">Áreas de Atuação</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {projetos.length} projetos realizados em diferentes frentes, sempre junto às comunidades da Diocese de Sobral
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={apareceu ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8"
        >
          {/* Abas: coluna no computador, faixa deslizante no celular */}
          <div
            role="tablist"
            aria-label="Áreas de atuação"
            aria-orientation="vertical"
            className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {areas.map((a, i) => {
              const ativa = a.slug === area.slug;
              const corTema = temas[a.tema].cor;
              const temAndamento = resumoPorTema[a.slug].lista.some((p) => p.emAndamento);
              return (
                <button
                  key={a.slug}
                  ref={(el) => (abasRef.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`aba-${a.slug}`}
                  aria-selected={ativa}
                  aria-controls="painel-area"
                  tabIndex={ativa ? 0 : -1}
                  onClick={() => escolher(a.slug)}
                  onKeyDown={(e) => aoTeclar(e, i)}
                  className={cn(
                    "snap-start flex-shrink-0 flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    ativa ? "bg-card shadow-md" : "bg-card/60 border-transparent hover:bg-card hover:border-border"
                  )}
                  style={ativa ? { borderColor: corTema } : undefined}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: ativa ? corTema : `${corTema}1A`, color: ativa ? "#fff" : corTema }}
                  >
                    <a.icone className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold whitespace-nowrap">{a.tema}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      {resumoPorTema[a.slug].lista.length} projetos
                      {temAndamento && (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          · <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ativo
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Painel da área escolhida */}
          <div id="painel-area" role="tabpanel" aria-labelledby={`aba-${area.slug}`} className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={area.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-card rounded-3xl border shadow-sm p-5 md:p-7"
              >
                <div className="grid xl:grid-cols-[1.1fr_1fr] gap-6 xl:gap-8">
                  <div className="space-y-5">
                    <FotoArea src={area.foto} cor={cor} icone={area.icone} />
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { valor: lista.length, rotulo: lista.length === 1 ? "projeto" : "projetos" },
                        { valor: municipios, rotulo: municipios === 1 ? "município" : "municípios" },
                        { valor: desde, rotulo: "início da atuação", ano: true },
                      ].map((n) => (
                        <div key={n.rotulo} className="rounded-xl bg-muted/50 p-3 text-center">
                          {n.ano ? (
                            <span className="block font-heading text-2xl md:text-3xl font-bold" style={{ color: cor }}>
                              {n.valor}
                            </span>
                          ) : (
                            <AnimatedCounter
                              value={n.valor}
                              duration={1}
                              imediato
                              className="block font-heading text-2xl md:text-3xl font-bold"
                            />
                          )}
                          <span className="text-[11px] md:text-xs text-muted-foreground">{n.rotulo}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: cor }}>
                        <area.icone className="w-5 h-5" />
                      </span>
                      <h3 className="font-heading text-2xl font-bold">{area.tema}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-5">{area.descricao}</p>

                    {emAndamento.length > 0 && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 mb-5">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-3">
                          <span className="relative flex w-2 h-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:hidden" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                          </span>
                          Em andamento
                        </p>
                        <ul className="space-y-3">
                          {emAndamento.map((p) => (
                            <li key={p.nome}>
                              <p className="font-semibold text-sm">{p.nome}</p>
                              <p className="text-xs text-muted-foreground mb-1">
                                {p.financiador} · {p.municipios.join(", ")}
                              </p>
                              <p className="text-sm text-muted-foreground leading-snug">{p.resumo}</p>
                              {p.noticiaId && (
                                <Link
                                  to={`/noticia/${p.noticiaId}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline mt-1"
                                >
                                  <Newspaper className="w-3.5 h-3.5" /> Ler a notícia
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {area.tema === "Segurança alimentar" && (
                      <div className="rounded-2xl p-4 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${cor}, #8f1530)` }}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Programa estadual</p>
                        <p className="font-heading font-semibold text-lg leading-snug mb-1">Ceará Sem Fome</p>
                        <p className="text-sm text-white/85 mb-3">
                          A Cáritas Diocesana de Sobral é gestora local do programa, com Unidades Sociais Produtoras de refeições
                          em 11 municípios.
                        </p>
                        <button
                          type="button"
                          onClick={() => document.getElementById("ceara-sem-fome")?.scrollIntoView({ behavior: "smooth" })}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 transition-colors"
                        >
                          Conhecer o programa <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {anteriores.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Projetos realizados
                        </p>
                        <ul className="divide-y">
                          {visiveis.map((p) => (
                            <li key={p.nome} className="py-2.5 flex gap-3">
                              <span className="text-xs font-semibold tabular-nums w-[74px] flex-shrink-0 pt-0.5" style={{ color: cor }}>
                                {p.periodo}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium leading-snug">{p.nome}</span>
                                <span className="block text-xs text-muted-foreground">{p.financiador}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                        {anteriores.length > PROJETOS_VISIVEIS && (
                          <button
                            type="button"
                            onClick={() => setVerTodos((v) => !v)}
                            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                          >
                            {verTodos ? "Mostrar menos" : `Ver todos os ${anteriores.length} projetos`}
                            <ChevronDown className={cn("w-4 h-4 transition-transform", verTodos && "rotate-180")} />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-1">
                      <Button variant="outline" onClick={verNoMapa} className="gap-2">
                        <MapPin className="w-4 h-4" style={{ color: cor }} />
                        Ver no mapa onde atuamos
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <Trajetoria />
        <FaixaParceiros />
      </div>
    </section>
  );
};

export default AreasAtuacao;
