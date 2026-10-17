import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  data_publicacao: string; // YYYY-MM-DD
};

export const formatarDataNoticia = (dateStr?: string | null) => {
  if (!dateStr) return "";
  // Trata a data como local (YYYY-MM-DD) para evitar problemas de fuso horário
  const [year, month, day] = dateStr.split("T")[0].split("-");
  if (!year || !month || !day) return "";
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const Imagem = ({ noticia, className }: { noticia: Noticia; className: string }) => {
  const [falhou, setFalhou] = useState(false);

  if (!noticia.imagem_url || falhou) {
    return (
      <div className={cn("bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center", className)}>
        <Newspaper className="w-14 h-14 text-primary/40" />
      </div>
    );
  }
  return (
    <img
      src={noticia.imagem_url}
      alt=""
      loading="lazy"
      onError={() => setFalhou(true)}
      className={cn("object-cover transition-transform duration-700 group-hover:scale-105", className)}
    />
  );
};

type NoticiaCardProps = {
  noticia: Noticia;
  destaque?: boolean;
  className?: string;
};

// Card de notícia; o card inteiro é clicável e leva à página da notícia
const NoticiaCard = ({ noticia, destaque = false, className }: NoticiaCardProps) => {
  const data = formatarDataNoticia(noticia.data_publicacao);

  if (destaque) {
    return (
      <Link
        to={`/noticia/${noticia.id}`}
        className={cn(
          "group relative block overflow-hidden rounded-2xl bg-card shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40",
          className
        )}
      >
        <Imagem noticia={noticia} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8 text-white">
          <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold mb-3">
            Mais recente
          </span>
          {data && (
            <p className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <CalendarDays className="w-4 h-4" />
              {data}
            </p>
          )}
          <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight mb-3 line-clamp-3">{noticia.titulo}</h3>
          {noticia.resumo && <p className="text-white/85 text-sm md:text-base line-clamp-3 mb-5 max-w-xl">{noticia.resumo}</p>}
          <span className="inline-flex items-center gap-2 font-semibold text-sm">
            Ler notícia completa
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/noticia/${noticia.id}`}
      className={cn(
        "group flex flex-col h-full overflow-hidden rounded-2xl bg-card border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40",
        className
      )}
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <Imagem noticia={noticia} className="w-full h-full" />
      </div>
      <div className="flex-1 flex flex-col p-5">
        {data && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            {data}
          </p>
        )}
        <h3 className="font-heading text-lg font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {noticia.titulo}
        </h3>
        {noticia.resumo && <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{noticia.resumo}</p>}
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-4">
          Ler mais
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default NoticiaCard;
