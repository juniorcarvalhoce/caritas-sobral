// Projetos executados pela Cáritas Diocesana de Sobral.
// Fonte: Currículo Institucional atualizado em outubro de 2026.
// Para incluir um projeto novo, adicione um item em `projetos`; o mapa e os números do topo se atualizam sozinhos.

export type Tema =
  | "Segurança alimentar"
  | "Agroecologia e sementes"
  | "Água e semiárido"
  | "Economia solidária"
  | "Juventude e cultura"
  | "Direitos e meio ambiente";

export const temas: Record<Tema, { cor: string }> = {
  "Segurança alimentar": { cor: "#C22443" },
  "Agroecologia e sementes": { cor: "#4E8B3A" },
  "Água e semiárido": { cor: "#2B7BB9" },
  "Economia solidária": { cor: "#D98A1F" },
  "Juventude e cultura": { cor: "#8A4FB5" },
  "Direitos e meio ambiente": { cor: "#5C6B73" },
};

// Coordenadas da sede de cada município
export const municipios: Record<string, [number, number]> = {
  Sobral: [-3.6886, -40.3486],
  Forquilha: [-3.7994, -40.2634],
  Groaíras: [-3.9158, -40.3855],
  Meruoca: [-3.539, -40.4546],
  Alcântaras: [-3.5862, -40.5458],
  Massapê: [-3.5239, -40.3423],
  "Santana do Acaraú": [-3.4612, -40.2117],
  "Senador Sá": [-3.3528, -40.4644],
  Acaraú: [-2.887, -40.1195],
  Morrinhos: [-3.2339, -40.1236],
  "Bela Cruz": [-3.0529, -40.1676],
  Marco: [-3.1228, -40.1472],
  Pacujá: [-3.9802, -40.6986],
  Hidrolândia: [-4.4083, -40.4381],
  "Santa Quitéria": [-4.3322, -40.1567],
  Frecheirinha: [-3.7611, -40.8172],
  Itapipoca: [-3.4944, -39.5786],
  Trairi: [-3.2777, -39.2681],
  Tururu: [-3.5985, -39.4358],
  Irauçuba: [-3.7467, -39.7841],
  Aracati: [-4.5583, -37.7679],
  "Viçosa do Ceará": [-3.5622, -41.0919],
  "Limoeiro do Norte": [-5.1456, -38.0985],
};

export type Municipio = keyof typeof municipios;

export type Projeto = {
  nome: string;
  financiador: string;
  periodo: string;
  tema: Tema;
  resumo: string;
  municipios: Municipio[];
  emAndamento?: boolean; // mostra a etiqueta "Em andamento"
  noticiaId?: string; // notícia do site que fala do projeto
};

const redeMiserior11: Municipio[] = [
  "Sobral", "Forquilha", "Massapê", "Morrinhos", "Pacujá", "Meruoca",
  "Alcântaras", "Marco", "Frecheirinha", "Santana do Acaraú", "Bela Cruz",
];
const rede7: Municipio[] = ["Sobral", "Forquilha", "Massapê", "Morrinhos", "Pacujá", "Meruoca", "Bela Cruz"];

export const projetos: Projeto[] = [
  // Projetos recentes, ainda não incluídos no currículo
  {
    nome: "Cisternas com o Comitê Betinho",
    financiador: "Comitê Betinho",
    periodo: "2026",
    tema: "Água e semiárido",
    resumo: "Construção de 27 cisternas de placas de 16 mil litros nas comunidades São Joaquim, Santa Luzia, Desterro e Cedro.",
    municipios: ["Sobral"],
    emAndamento: true,
    noticiaId: "e062b1d9-744e-4404-846e-5e80d6168a1f",
  },
  {
    nome: "Campanha Tenho Sede",
    financiador: "ASA – Articulação Semiárido Brasileiro",
    periodo: "2026",
    tema: "Água e semiárido",
    resumo: "Construção de 5 cisternas de 16 mil litros para captação da água da chuva no distrito de Aracatiaçu, com curso de Gestão de Recursos Hídricos para as famílias.",
    municipios: ["Sobral"],
    emAndamento: true,
    noticiaId: "177cbaea-6871-4aee-95d0-c1468916acb8",
  },
  // Projetos do Currículo Institucional
  {
    nome: "Programa Ceará Sem Fome (Lotes 22 e 37)",
    financiador: "SDA / Governo do Estado do Ceará",
    periodo: "2023 – 2025",
    tema: "Segurança alimentar",
    resumo: "Gestão de Unidades Produtoras de Refeição, com quentinhas diárias para pessoas em vulnerabilidade e capacitação de cozinheiras.",
    municipios: ["Sobral", "Forquilha", "Groaíras", "Meruoca", "Alcântaras", "Massapê", "Santana do Acaraú", "Senador Sá", "Acaraú", "Morrinhos", "Bela Cruz"],
  },
  {
    nome: "Tecendo Redes de Solidariedade III",
    financiador: "MISEREOR",
    periodo: "2022 – 2025",
    tema: "Agroecologia e sementes",
    resumo: "Fortalecimento das redes de sementes e de catadores, acesso à água e produção agroecológica e solidária.",
    municipios: ["Sobral", "Massapê", "Forquilha", "Santana do Acaraú", "Morrinhos", "Bela Cruz", "Marco", "Meruoca", "Pacujá"],
  },
  {
    nome: "Ações Emergenciais COVID-19 (Lote 1)",
    financiador: "Fundação Banco do Brasil",
    periodo: "2021",
    tema: "Segurança alimentar",
    resumo: "Distribuição de cestas básicas e kits de higiene para famílias afetadas pela pandemia.",
    municipios: ["Sobral", "Hidrolândia", "Forquilha", "Massapê", "Santana do Acaraú", "Morrinhos", "Pacujá", "Meruoca"],
  },
  {
    nome: "Ações Emergenciais COVID-19 (Lote 2)",
    financiador: "Fundação Banco do Brasil",
    periodo: "2021",
    tema: "Segurança alimentar",
    resumo: "Distribuição de cestas básicas para famílias em vulnerabilidade durante a quarentena.",
    municipios: ["Forquilha", "Santa Quitéria"],
  },
  {
    nome: "Combate à Fome na Pandemia",
    financiador: "CESE",
    periodo: "2021",
    tema: "Segurança alimentar",
    resumo: "Entrega de 150 cestas básicas a famílias em vulnerabilidade na pandemia.",
    municipios: rede7,
  },
  {
    nome: "Redes de Comunidades e Cáritas",
    financiador: "MISEREOR",
    periodo: "2019 – 2021",
    tema: "Água e semiárido",
    resumo: "Incidência em políticas públicas, gestão democrática da água e produção agroecológica.",
    municipios: ["Pacujá", "Santa Quitéria", "Meruoca", "Santana do Acaraú", "Sobral", "Forquilha", "Massapê", "Morrinhos", "Marco", "Frecheirinha", "Bela Cruz"],
  },
  {
    nome: "Fomento à Rede Bodegas",
    financiador: "Ministério do Trabalho / SENAES",
    periodo: "2018 – 2022",
    tema: "Economia solidária",
    resumo: "Assessoria a 56 grupos de economia solidária em 17 municípios, com formações em PAA e PNAE e feiras.",
    municipios: ["Sobral", "Aracati", "Viçosa do Ceará"],
  },
  {
    nome: "Segurança Hídrica em Olheiros",
    financiador: "Fundação Banco do Brasil",
    periodo: "2016 – 2017",
    tema: "Água e semiárido",
    resumo: "Construção de cisternas de placas e formação em gestão de recursos hídricos na comunidade de Olheiros.",
    municipios: ["Morrinhos"],
  },
  {
    nome: "Redes ECOFORTE",
    financiador: "Fundação Banco do Brasil",
    periodo: "2015 – 2017",
    tema: "Agroecologia e sementes",
    resumo: "61 unidades de referência: 20 casas de sementes, cisternas de produção, roçados agroecológicos e criação de galinhas pelas mulheres.",
    municipios: ["Sobral", "Forquilha", "Massapê", "Santana do Acaraú", "Morrinhos", "Bela Cruz", "Marco", "Frecheirinha", "Itapipoca", "Trairi", "Tururu", "Irauçuba"],
  },
  {
    nome: "Tecendo Redes de Solidariedade I",
    financiador: "MISEREOR",
    periodo: "2016 – 2018",
    tema: "Direitos e meio ambiente",
    resumo: "Controle social de políticas públicas e defesa de direitos de comunidades atingidas por megaprojetos.",
    municipios: ["Sobral", "Forquilha", "Massapê", "Morrinhos", "Pacujá", "Meruoca", "Alcântaras", "Marco", "Santa Quitéria", "Frecheirinha", "Santana do Acaraú", "Bela Cruz"],
  },
  {
    nome: "Promoção de Estruturas Socioeconômicas",
    financiador: "MISEREOR",
    periodo: "2013 – 2015",
    tema: "Água e semiárido",
    resumo: "Convivência com o semiárido em 10 comunidades (300 famílias), feiras agroecológicas e criação de cooperativa.",
    municipios: redeMiserior11,
  },
  {
    nome: "Cultura e Cidadania Juvenil",
    financiador: "Instituto Votorantim",
    periodo: "2013 – 2014",
    tema: "Juventude e cultura",
    resumo: "Iniciação artística de 240 adolescentes e jovens em 4 territórios de Sobral.",
    municipios: ["Sobral"],
  },
  {
    nome: "Arte, Cultura e Cidadania – Vida nas Teias da Cultura",
    financiador: "Instituto Votorantim",
    periodo: "2012 – 2013",
    tema: "Juventude e cultura",
    resumo: "Aulas de teatro, dança, música e artes plásticas para fortalecer 4 grupos culturais de jovens.",
    municipios: ["Sobral"],
  },
  {
    nome: "Desenvolvimento Sustentável Solidário",
    financiador: "MISEREOR",
    periodo: "2011 – 2013",
    tema: "Agroecologia e sementes",
    resumo: "Assessoria e formação em agroecologia, produção orgânica e economia solidária para 2.032 pessoas.",
    municipios: redeMiserior11,
  },
  {
    nome: "Comércio Justo e Certificação",
    financiador: "Fundo Nacional de Solidariedade (CNBB)",
    periodo: "2011 – 2012",
    tema: "Economia solidária",
    resumo: "Oficinas de comércio justo e certificação participativa de produtos da agricultura familiar com 100 pessoas.",
    municipios: rede7,
  },
  {
    nome: "Justiça Socioambiental e Clima",
    financiador: "Fundo Nacional de Solidariedade (CNBB)",
    periodo: "2011 – 2012",
    tema: "Direitos e meio ambiente",
    resumo: "Formação sobre os impactos da mineração de urânio e fosfato de Itataia e as mudanças climáticas.",
    municipios: ["Sobral"],
  },
  {
    nome: "Sementes Crioulas e Manejo Agroecológico",
    financiador: "Fundo Nacional de Solidariedade (CNBB)",
    periodo: "2011 – 2012",
    tema: "Agroecologia e sementes",
    resumo: "Resgate e preservação das sementes crioulas junto a agricultores e agricultoras familiares.",
    municipios: ["Sobral"],
  },
  {
    nome: "Bodega Arcos – Artesanato das Comunidades Solidárias",
    financiador: "Fundo Ecumênico de Solidariedade",
    periodo: "2010 – 2011",
    tema: "Economia solidária",
    resumo: "Estruturação da Bodega Arcos e fomento à comercialização dos grupos de economia solidária.",
    municipios: rede7,
  },
  {
    nome: "Bodega dos Arcos – Artesanato das Comunidades Solidárias",
    financiador: "Fundo Nacional de Solidariedade (CNBB)",
    periodo: "2009 – 2010",
    tema: "Economia solidária",
    resumo: "Apoio à produção artesanal e à comercialização solidária dos grupos produtivos.",
    municipios: ["Sobral"],
  },
  {
    nome: "Aprendizes em Serviços Bancários",
    financiador: "Banco do Brasil",
    periodo: "2008 – 2013",
    tema: "Juventude e cultura",
    resumo: "Formação cidadã e acompanhamento escolar e profissional de jovens aprendizes.",
    municipios: ["Sobral"],
  },
  {
    nome: "Manejo Sustentável da Caatinga",
    financiador: "Banco do Nordeste",
    periodo: "2005 – 2006",
    tema: "Água e semiárido",
    resumo: "Manejo agrossilvopastoril da caatinga para fortalecer a agricultura familiar e a segurança alimentar.",
    municipios: ["Sobral", "Limoeiro do Norte"],
  },
  {
    nome: "Oficina Escola",
    financiador: "W. K. Kellogg Foundation",
    periodo: "2004 – 2005",
    tema: "Juventude e cultura",
    resumo: "Oficinas de carpintaria, restauração de arte sacra e artes cênicas, com bolsas para jovens.",
    municipios: ["Sobral"],
  },
];

// Municípios que aparecem em pelo menos um projeto
export const municipiosAtendidos = Array.from(new Set(projetos.flatMap((p) => p.municipios)));

// Soma conservadora das pessoas citadas no currículo (2.032 + 240 + 100 pessoas, 300 + 150 famílias
// contadas como 1 pessoa cada, e 100 quentinhas diárias) mais as 32 famílias das cisternas de 2026.
// O número real é maior.
export const VIDAS_IMPACTADAS = 2900;

// Ano de início e de fim de um projeto a partir do período ("2013 – 2015" ou "2021")
export const anosDoProjeto = (p: Projeto): [number, number] => {
  const anos = p.periodo.match(/\d{4}/g)?.map(Number) ?? [];
  return [anos[0], anos[anos.length - 1]];
};

// Parceiros e financiadores, na ordem em que aparecem (projetos mais recentes primeiro)
export const parceiros = Array.from(new Set(projetos.map((p) => p.financiador)));
