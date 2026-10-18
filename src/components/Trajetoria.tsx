import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { History } from "lucide-react";
import { projetos, temas, anosDoProjeto, type Projeto, type Tema } from "@/data/projetos";
import { cn } from "@/lib/utils";

// Linha do tempo com todos os projetos: uma barra por projeto, do ano de início ao de fim
const Trajetoria = () => {
  const ref = useRef<HTMLDivElement>(null);
  const apareceu = useInView(ref, { once: true, margin: "-80px" });
  const [destacado, setDestacado] = useState<Projeto | null>(null);

  const { linhas, inicio, fim } = useMemo(() => {
    const comAnos = projetos.map((p) => ({ projeto: p, anos: anosDoProjeto(p) }));
    const inicio = Math.min(...comAnos.map((l) => l.anos[0]));
    const fim = Math.max(new Date().getFullYear(), ...comAnos.map((l) => l.anos[1]));
    const linhas = comAnos.sort((a, b) => a.anos[0] - b.anos[0] || a.anos[1] - b.anos[1]);
    return { linhas, inicio, fim };
  }, []);

  const totalAnos = fim - inicio + 1;
  const anos = Array.from({ length: totalAnos }, (_, i) => inicio + i);
  const temasUsados = Array.from(new Set(projetos.map((p) => p.tema))) as Tema[];

  return (
    <div ref={ref} className="mt-16 md:mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <History className="w-7 h-7 text-primary" />
            Nossa trajetória
          </h3>
          <p className="text-muted-foreground mt-1">
            {projetos.length} projetos de {inicio} até hoje. Passe o mouse ou toque em uma barra para ver o projeto.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {temasUsados.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: temas[t].cor }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-4 md:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Grade com uma coluna por ano */}
            <div className="relative">
              <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalAnos}, 1fr)` }}>
                {anos.map((ano) => (
                  <div key={ano} className={cn("border-l", ano % 5 === 0 ? "border-border" : "border-border/40")} />
                ))}
              </div>

              <ul className="relative space-y-1 py-1">
                {linhas.map(({ projeto, anos: [ini, fimProj] }, i) => {
                  const esquerda = ((ini - inicio) / totalAnos) * 100;
                  const largura = ((fimProj - ini + 1) / totalAnos) * 100;
                  const ativo = destacado?.nome === projeto.nome;
                  return (
                    <li key={projeto.nome} className="relative h-3">
                      <motion.button
                        type="button"
                        aria-label={`${projeto.nome}, ${projeto.periodo}`}
                        onMouseEnter={() => setDestacado(projeto)}
                        onFocus={() => setDestacado(projeto)}
                        onClick={() => setDestacado(projeto)}
                        initial={{ scaleX: 0 }}
                        animate={apareceu ? { scaleX: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.02 * i, ease: "easeOut" }}
                        className={cn(
                          "absolute top-0 h-3 rounded-full origin-left transition-[filter,box-shadow] focus:outline-none",
                          ativo ? "ring-2 ring-offset-1 ring-foreground/30 brightness-110" : "hover:brightness-110",
                          projeto.emAndamento && "animate-pulse motion-reduce:animate-none"
                        )}
                        style={{
                          left: `${esquerda}%`,
                          width: `calc(${largura}% - 3px)`,
                          background: temas[projeto.tema].cor,
                          opacity: destacado && !ativo ? 0.45 : 1,
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Eixo dos anos */}
            <div className="grid mt-2 text-[10px] md:text-xs text-muted-foreground tabular-nums" style={{ gridTemplateColumns: `repeat(${totalAnos}, 1fr)` }}>
              {anos.map((ano) => (
                <span key={ano} className={cn("pl-1", ano % 2 !== 0 && "max-md:invisible")}>
                  {ano}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detalhes do projeto destacado */}
        <div className="mt-4 min-h-[64px] rounded-xl bg-muted/40 px-4 py-3" aria-live="polite">
          {destacado ? (
            <div className="flex items-start gap-3">
              <span className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: temas[destacado.tema].cor }} />
              <div className="min-w-0">
                <p className="font-semibold text-sm">
                  {destacado.nome}
                  {destacado.emAndamento && (
                    <span className="ml-2 align-middle text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
                      Em andamento
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {destacado.periodo} · {destacado.financiador} · {destacado.tema}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{destacado.resumo}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma barra para ver os detalhes do projeto.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trajetoria;
