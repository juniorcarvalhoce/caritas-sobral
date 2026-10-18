import { useQuery } from "@tanstack/react-query";
import { Droplets, Handshake, Scale, Sparkles, Sprout, Utensils, type LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tema } from "@/data/projetos";

// Áreas de atuação da Cáritas Diocesana de Sobral (os mesmos temas do mapa).
// A foto e o texto podem ser trocados no painel (Admin > Áreas de atuação); estes são os valores padrão.

export type AreaAtuacao = {
  slug: string;
  tema: Tema;
  icone: LucideIcon;
  descricao: string;
  foto: string | null;
};

// Fotos provisórias: imagens das notícias já publicadas pela Cáritas (bucket "noticias")
const fotoDasNoticias = (arquivo: string) => supabase.storage.from("noticias").getPublicUrl(arquivo).data.publicUrl;

export const areasPadrao: AreaAtuacao[] = [
  {
    slug: "seguranca-alimentar",
    tema: "Segurança alimentar",
    icone: Utensils,
    descricao:
      "Combate à fome e à insegurança alimentar, com refeições diárias para quem mais precisa, distribuição de alimentos em emergências e fortalecimento da produção local.",
    foto: fotoDasNoticias("noticia-1770368124946-4a84c6b0.jpg"),
  },
  {
    slug: "agroecologia-e-sementes",
    tema: "Agroecologia e sementes",
    icone: Sprout,
    descricao:
      "Casas de sementes crioulas, roçados agroecológicos e formação de agricultoras e agricultores familiares para produzir, consumir e comercializar com base na agroecologia.",
    foto: fotoDasNoticias("noticia-1775004039574-c7d4a592.png"),
  },
  {
    slug: "agua-e-semiarido",
    tema: "Água e semiárido",
    icone: Droplets,
    descricao:
      "Convivência com o semiárido: cisternas de placas, gestão comunitária dos recursos hídricos e defesa da água como direito humano e bem comum.",
    foto: fotoDasNoticias("noticia-1770490653692-262f1323.jpeg"),
  },
  {
    slug: "economia-solidaria",
    tema: "Economia solidária",
    icone: Handshake,
    descricao:
      "Apoio a grupos de produção artesanal e da agricultura familiar, feiras, comércio justo e a Rede Bodega, gerando renda e autonomia nas comunidades.",
    foto: fotoDasNoticias("noticia-1778785662646-d7c6bc6f.jpeg"),
  },
  {
    slug: "juventude-e-cultura",
    tema: "Juventude e cultura",
    icone: Sparkles,
    descricao:
      "Formação cidadã, arte e cultura para adolescentes e jovens, incentivando o protagonismo e a participação nas comunidades.",
    foto: fotoDasNoticias("noticia-1778711271424-10ca6080.jpeg"),
  },
  {
    slug: "direitos-e-meio-ambiente",
    tema: "Direitos e meio ambiente",
    icone: Scale,
    descricao:
      "Controle social de políticas públicas, defesa de direitos de comunidades atingidas por grandes empreendimentos e cuidado com a casa comum.",
    foto: fotoDasNoticias("noticia-1775699546213-178d6969.jpeg"),
  },
];

type AreaPersonalizada = { slug: string; descricao: string | null; foto_url: string | null };

// Busca as fotos e textos trocados no painel. Se a tabela ainda não existir, usa os valores padrão.
export const useAreasAtuacao = () =>
  useQuery({
    queryKey: ["areas-atuacao"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AreaAtuacao[]> => {
      const { data, error } = await supabase.from("areas_atuacao").select("slug, descricao, foto_url");
      const personalizadas = new Map<string, AreaPersonalizada>(
        error ? [] : (data ?? []).map((a: AreaPersonalizada) => [a.slug, a])
      );
      return areasPadrao.map((area) => {
        const p = personalizadas.get(area.slug);
        return {
          ...area,
          descricao: p?.descricao?.trim() || area.descricao,
          foto: p?.foto_url || area.foto,
        };
      });
    },
    placeholderData: areasPadrao,
  });
