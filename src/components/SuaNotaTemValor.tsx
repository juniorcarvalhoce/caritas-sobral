import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Receipt,
  UserPlus,
  HandHeart,
  Coins,
  Trophy,
  Landmark,
  Sparkles,
  Heart,
  ExternalLink,
  Copy,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SITE_PROGRAMA = "https://suanotatemvalor.sefaz.ce.gov.br/";
const NOME_INSTITUICAO = "Cáritas Diocesana de Sobral";

const comoFunciona = [
  {
    icon: UserPlus,
    title: "Cadastro",
    text: "Cadastre-se gratuitamente no site oficial ou no aplicativo Sua Nota Tem Valor (Android e iOS).",
  },
  {
    icon: HandHeart,
    title: "Indicação de instituição",
    text: "No cadastro, escolha uma instituição sem fins lucrativos — é aqui que você seleciona a Cáritas!",
  },
  {
    icon: Coins,
    title: "Acúmulo de pontos",
    text: "Informe o CPF na nota fiscal (NF-e, NFC-e ou CF-e). Cada R$ 50,00 em compras gera um bilhete.",
  },
  {
    icon: Trophy,
    title: "Sorteios e rateios",
    text: "Sorteios mensais em dinheiro para pessoas e instituições, além de rateio entre as mais engajadas.",
  },
];

const porQueParticipar = [
  {
    icon: Landmark,
    title: "Fortalece a cidadania fiscal",
    text: "Exigir nota com CPF contribui para uma arrecadação mais justa e transparente, fortalecendo políticas públicas.",
  },
  {
    icon: Sparkles,
    title: "Gera solidariedade",
    text: "Cada nota com seu CPF dá a você chances de ganhar prêmios e soma pontos para a instituição que você apoia.",
  },
  {
    icon: Heart,
    title: "Beneficia a Cáritas",
    text: "Escolhendo a Cáritas, cada compra fortalece diretamente nosso trabalho social e nossos projetos comunitários.",
  },
];

const passoAPasso = [
  <>
    Acesse o site do programa:{" "}
    <a
      href={SITE_PROGRAMA}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium underline underline-offset-4 break-all"
    >
      suanotatemvalor.sefaz.ce.gov.br
    </a>
  </>,
  <>Clique em “Cadastre-se” ou baixe o aplicativo “Sua Nota Tem Valor”.</>,
  <>
    Preencha seus dados e, ao escolher a instituição, selecione{" "}
    <strong className="text-foreground">“{NOME_INSTITUICAO}”</strong>.
  </>,
  <>Em todas as compras, exija a nota fiscal e informe seu CPF para acumular pontos.</>,
];

export const SuaNotaTemValor = () => {
  const ref = useRef(null);
  // amount pequeno: a seção é alta, então a animação dispara assim que ela começa a entrar na tela
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.4, delay },
  });

  const copiarNome = () => {
    navigator.clipboard.writeText(NOME_INSTITUICAO);
    toast.success("Nome da instituição copiado!");
  };

  return (
    <section id="sua-nota-tem-valor" className="py-20 md:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <div className="glass px-5 py-2 rounded-full inline-flex items-center gap-2 mb-6">
            <Receipt className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Campanha SEFAZ-CE</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Sua Nota Tem Valor</span>
          </h2>
          <p className="text-lg md:text-xl font-medium mb-3">Transformando cidadania em solidariedade</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Além das formas de colaboração citadas, você também pode nos apoiar transformando suas notas
            fiscais em apoio direto aos projetos da Cáritas Diocesana de Sobral.
          </p>
        </motion.div>

        {/* O que é */}
        <motion.div {...fadeUp(0.1)} className="glass rounded-3xl p-6 md:p-10 mb-12">
          <h3 className="font-heading text-xl md:text-2xl font-semibold mb-3">
            O que é o programa “Sua Nota Tem Valor”?
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            É uma iniciativa da Secretaria da Fazenda do Estado do Ceará (SEFAZ-CE) que estimula a cidadania
            fiscal e a participação popular no controle e na aplicação dos recursos públicos. Ao cadastrar o
            CPF no momento da compra e escolher uma instituição sem fins lucrativos para apoiar, o cidadão
            concorre a prêmios mensais em dinheiro, enquanto a instituição escolhida também concorre a
            premiações e recebe apoio por meio do rateio de pontos gerados pelas notas fiscais.
          </p>
        </motion.div>

        {/* Como funciona */}
        <motion.h3 {...fadeUp(0.15)} className="font-heading text-2xl md:text-3xl font-semibold text-center mb-8">
          Como funciona
        </motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-14">
          {comoFunciona.map((item, i) => (
            <motion.div
              key={item.title}
              {...fadeUp(0.2 + i * 0.05)}
              className="glass rounded-2xl p-6 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute top-4 right-5 font-heading text-4xl font-bold text-primary/10">
                {i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Por que participar */}
        <motion.h3 {...fadeUp(0.25)} className="font-heading text-2xl md:text-3xl font-semibold text-center mb-8">
          Por que participar?
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-14">
          {porQueParticipar.map((item, i) => (
            <motion.div
              key={item.title}
              {...fadeUp(0.3 + i * 0.05)}
              className="glass-dark rounded-2xl p-6 flex gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-heading font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Passo a passo + chamada */}
        <motion.div
          {...fadeUp(0.35)}
          className="rounded-3xl p-6 md:p-10 bg-gradient-to-br from-primary/10 via-background to-secondary/40 border border-primary/20 shadow-lg"
        >
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-6">
                Como se cadastrar e apoiar a Cáritas
              </h3>
              <ol className="space-y-4">
                {passoAPasso.map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center flex-shrink-0 text-sm">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed pt-1">{passo}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Button size="lg" className="w-full group" asChild>
                <a href={SITE_PROGRAMA} target="_blank" rel="noopener noreferrer">
                  Cadastre-se e apoie a Cáritas
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={copiarNome}>
                <Copy className="w-4 h-4" />
                Copiar nome da instituição
              </Button>
              <div className="glass rounded-2xl p-4 flex gap-3 text-sm">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Dica:</strong> compartilhe com amigos e familiares — quanto
                  mais pessoas escolherem a Cáritas, mais recursos para nossos projetos de impacto social.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SuaNotaTemValor;
