import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Conteúdo da seção "Sobre a Cáritas Diocesana".
// Os textos e a foto podem ser trocados no painel (Admin > Sobre a Cáritas); estes são os valores padrão.

export type ConteudoSobre = {
  historia: string;
  missao: string;
  visao: string;
  foto: string | null;
};

export const CHAVES_SOBRE = {
  historia: "sobre.historia",
  missao: "sobre.missao",
  visao: "sobre.visao",
  foto: "sobre.foto",
} as const;

export const sobrePadrao: ConteudoSobre = {
  historia: [
    "A Cáritas Diocesana de Sobral foi fundada em 1º de outubro de 1983, como um organismo da Conferência Nacional dos Bispos do Brasil (CNBB), dedicada à promoção da justiça social e ao desenvolvimento humano integral.",
    "Com mais de 40 anos de atuação, desenvolvemos projetos que fortalecem a convivência com o semiárido, promovem a economia solidária, empoderam as juventudes e incentivam a participação em políticas públicas.",
    "Atuamos na prática da Justiça Social e da Solidariedade Libertadora, por meio de ações concretas que promovem a dignidade humana, a sustentabilidade e a transformação social.",
  ].join("\n\n"),
  missao:
    "Animar, organizar e participar efetivamente da prática da Justiça Social e Solidariedade Libertadora com os excluídos da nossa sociedade, contribuindo na construção de alternativas para que todas as pessoas tenham igual direito a uma vida digna.",
  // Texto provisório: substitua pela visão oficial no painel
  visao:
    "Ser presença solidária e profética na Diocese de Sobral, reconhecida pelas comunidades como referência na defesa da vida, na convivência com o semiárido e na construção de uma sociedade justa, fraterna e sustentável.",
  // Foto provisória: Assembleia de 2024 (imagem de notícia já publicada)
  foto: supabase.storage.from("noticias").getPublicUrl("noticia-1770369014264-d2d71f9d.webp").data.publicUrl,
};

type Linha = { chave: string; valor: string | null };

// Busca os textos e a foto trocados no painel. Se a tabela ainda não existir, usa os valores padrão.
export const useConteudoSobre = () =>
  useQuery({
    queryKey: ["conteudo-sobre"],
    staleTime: 5 * 60 * 1000,
    placeholderData: sobrePadrao,
    queryFn: async (): Promise<ConteudoSobre> => {
      const { data, error } = await supabase
        .from("conteudo_site")
        .select("chave, valor")
        .in("chave", Object.values(CHAVES_SOBRE));
      const valores = new Map<string, string>(
        error ? [] : ((data ?? []) as Linha[]).filter((l) => l.valor?.trim()).map((l) => [l.chave, l.valor!.trim()])
      );
      return {
        historia: valores.get(CHAVES_SOBRE.historia) ?? sobrePadrao.historia,
        missao: valores.get(CHAVES_SOBRE.missao) ?? sobrePadrao.missao,
        visao: valores.get(CHAVES_SOBRE.visao) ?? sobrePadrao.visao,
        foto: valores.get(CHAVES_SOBRE.foto) ?? sobrePadrao.foto,
      };
    },
  });
