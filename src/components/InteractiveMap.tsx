import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { MapPin, FolderOpen, CalendarRange } from "lucide-react";
import { projetos, municipios, municipiosAtendidos, temas, type Tema, type Projeto } from "@/data/projetos";

const COR_PADRAO = "#C22443";

const listaTemas = Object.keys(temas) as Tema[];

// Conteúdo do popup de um município
const popupHtml = (nome: string, lista: Projeto[]) => `
  <div class="font-sans">
    <p class="font-heading font-bold text-base text-foreground mb-0.5">${nome}</p>
    <p class="text-xs text-muted-foreground mb-3">${lista.length} ${lista.length === 1 ? "projeto realizado" : "projetos realizados"}</p>
    <ul class="space-y-3">
      ${lista
        .map(
          (p) => `
        <li class="border-l-4 pl-3" style="border-color:${temas[p.tema].cor}">
          <p class="font-semibold text-sm leading-snug text-foreground">${p.nome}</p>
          <p class="text-[11px] text-muted-foreground">${p.periodo} · ${p.financiador}</p>
          <p class="text-xs text-muted-foreground mt-1 leading-snug">${p.resumo}</p>
          <span class="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style="background:${temas[p.tema].cor}">${p.tema}</span>
        </li>`
        )
        .join("")}
    </ul>
  </div>`;

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [temaAtivo, setTemaAtivo] = useState<Tema | null>(null);

  const anoMaisAntigo = useMemo(
    () => Math.min(...projetos.map((p) => parseInt(p.periodo.slice(0, 4), 10))),
    []
  );

  // Cria o mapa uma única vez
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([-3.6, -40.35], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Desenha (ou redesenha) os municípios conforme o tema escolhido
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const filtrados = temaAtivo ? projetos.filter((p) => p.tema === temaAtivo) : projetos;
    const cor = temaAtivo ? temas[temaAtivo].cor : COR_PADRAO;
    const pontos: L.LatLngExpression[] = [];
    // No celular o popup não pode passar da largura do mapa
    const larguraPopup = Math.min(320, map.getSize().x - 80);

    Object.entries(municipios).forEach(([nome, coords]) => {
      const lista = filtrados.filter((p) => p.municipios.includes(nome));
      if (lista.length === 0) return;

      pontos.push(coords);
      L.circleMarker(coords, {
        radius: Math.min(6 + lista.length * 0.6, 16),
        color: "#ffffff",
        weight: 2,
        fillColor: cor,
        fillOpacity: 0.85,
      })
        .bindTooltip(`${nome} · ${lista.length}`, { direction: "top", offset: [0, -6] })
        .bindPopup(popupHtml(nome, lista), { maxWidth: larguraPopup, minWidth: Math.min(240, larguraPopup), maxHeight: 320, autoPanPadding: [16, 16] })
        .addTo(layer);
    });

    if (pontos.length > 0) {
      map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 10 });
    }
  }, [temaAtivo]);

  return (
    <section id="onde-atuamos" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Onde <span className="text-gradient">Atuamos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Clique em um município para conhecer os projetos realizados ali
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <strong>{municipiosAtendidos.length}</strong> municípios
            </span>
            <span className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <strong>{projetos.length}</strong> projetos
            </span>
            <span className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-primary" />
              desde <strong>{anoMaisAntigo}</strong>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-4 md:p-8"
        >
          {/* Filtro por tema */}
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar projetos por tema">
            <button
              type="button"
              onClick={() => setTemaAtivo(null)}
              aria-pressed={temaAtivo === null}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-colors ${
                temaAtivo === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/70 border-border hover:border-primary"
              }`}
            >
              Todos os temas
            </button>
            {listaTemas.map((tema) => {
              const ativo = temaAtivo === tema;
              return (
                <button
                  key={tema}
                  type="button"
                  onClick={() => setTemaAtivo(ativo ? null : tema)}
                  aria-pressed={ativo}
                  className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-colors inline-flex items-center gap-2"
                  style={
                    ativo
                      ? { background: temas[tema].cor, borderColor: temas[tema].cor, color: "#fff" }
                      : { borderColor: "hsl(var(--border))" }
                  }
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: ativo ? "#fff" : temas[tema].cor }}
                  />
                  {tema}
                </button>
              );
            })}
          </div>

          <div
            ref={mapRef}
            className="w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden shadow-xl relative z-0"
          />
          <p className="text-xs text-muted-foreground mt-3">
            O tamanho do círculo indica a quantidade de projetos no município. Fonte: Currículo Institucional
            da Cáritas Diocesana de Sobral (outubro/2026).
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveMap;
