import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Compass, ExternalLink, Globe2, HeartHandshake, Leaf, Map as MapIcon, MapPin, Quote, Scale, Users } from "lucide-react";
import { useConteudoSobre, sobrePadrao } from "@/data/sobre";

const valores = [
  { icone: HeartHandshake, titulo: "Solidariedade", descricao: "Amor ao próximo e compromisso com os mais vulneráveis" },
  { icone: Scale, titulo: "Justiça Social", descricao: "Luta pela igualdade e pela dignidade humana" },
  { icone: Users, titulo: "Participação", descricao: "Protagonismo das comunidades em seu próprio desenvolvimento" },
  { icone: Leaf, titulo: "Sustentabilidade", descricao: "Ações duradouras que respeitam a vida e o meio ambiente" },
];

// A Cáritas Diocesana faz parte de uma rede que vai do local ao mundial
const rede = [
  {
    nivel: "Diocesano",
    nome: "Cáritas Diocesana de Sobral",
    local: "Sobral – CE",
    descricao: "Atua nas comunidades da Diocese de Sobral desde 1983.",
    icone: MapPin,
  },
  {
    nivel: "Regional",
    nome: "Cáritas Brasileira Regional Ceará",
    local: "Fortaleza – CE",
    descricao: "Articula as Cáritas diocesanas do Ceará e fortalece o trabalho em rede no estado.",
    icone: MapIcon,
    link: "https://ce.caritas.org.br/",
  },
  {
    nivel: "Nacional",
    nome: "Cáritas Brasileira",
    local: "Brasília – DF",
    descricao: "Organismo da CNBB presente em todo o país, organizado em regionais.",
    icone: Compass,
    link: "https://caritas.org.br/",
  },
  {
    nivel: "Internacional",
    nome: "Caritas Internationalis",
    local: "Rede mundial",
    descricao: "Uma das maiores redes humanitárias do mundo, presente em mais de 200 países e territórios.",
    icone: Globe2,
    link: "https://www.caritas.org/",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: conteudo = sobrePadrao } = useConteudoSobre();
  const [fotoFalhou, setFotoFalhou] = useState(false);

  const paragrafos = conteudo.historia.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const aparecer = (atraso = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay: atraso },
  });

  return (
    <section id="sobre" className="py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div {...aparecer()} className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Sobre a <span className="text-gradient">Cáritas Diocesana</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Uma história de fé, solidariedade e transformação social</p>
        </motion.div>

        {/* Foto e história */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-14 md:mb-16">
          <motion.div {...aparecer(0.1)} className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-muted">
              {conteudo.foto && !fotoFalhou ? (
                <img
                  src={conteudo.foto}
                  alt="Equipe e comunidades da Cáritas Diocesana de Sobral"
                  loading="lazy"
                  onError={() => setFotoFalhou(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />
              )}
            </div>
            <div className="absolute -bottom-5 left-5 md:left-8 bg-card rounded-2xl shadow-lg border px-5 py-3">
              <p className="text-xs text-muted-foreground">Fundada em</p>
              <p className="font-heading text-xl font-bold text-primary">1º de outubro de 1983</p>
            </div>
          </motion.div>

          <motion.div {...aparecer(0.2)} className="pt-4 lg:pt-0">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-5">Nossa história</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {paragrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="mt-8 pt-6 border-t grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground mb-1">CNPJ</dt>
                <dd className="font-semibold">10.379.758/0001-36</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Sede</dt>
                <dd className="font-semibold">Centro, Sobral – CE</dd>
              </div>
            </dl>
          </motion.div>
        </div>

        {/* Missão em destaque */}
        <motion.figure
          {...aparecer(0.1)}
          className="relative rounded-3xl bg-gradient-to-br from-primary to-[#8f1530] text-white px-6 py-10 md:px-14 md:py-14 mb-8 overflow-hidden"
        >
          <Quote className="absolute -top-2 -left-2 w-32 h-32 text-white/10" aria-hidden="true" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/75 mb-4">Nossa missão</p>
          <blockquote className="relative font-heading text-lg sm:text-xl md:text-3xl font-semibold leading-snug max-w-4xl">
            {conteudo.missao}
          </blockquote>
        </motion.figure>

        {/* Visão e valores */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mb-16 md:mb-20">
          <motion.div {...aparecer(0.15)} className="bg-card rounded-3xl border p-6 md:p-8">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3">Nossa visão</h3>
            <p className="text-muted-foreground leading-relaxed">{conteudo.visao}</p>
          </motion.div>

          <motion.div {...aparecer(0.2)} className="bg-card rounded-3xl border p-6 md:p-8">
            <h3 className="font-heading text-xl font-semibold mb-5">Nossos valores</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {valores.map((v) => (
                <div key={v.titulo} className="flex items-start gap-3 group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                    <v.icone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{v.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{v.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Rede Cáritas */}
        <motion.div {...aparecer(0.1)}>
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">Parte de uma rede mundial</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A Cáritas Diocesana de Sobral integra a rede Cáritas, que liga o trabalho nas comunidades ao Regional Ceará, à Cáritas Brasileira e a uma presença
              solidária em todo o mundo.
            </p>
          </div>
          <ol className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Linha que liga os três níveis (computador) */}
            <div className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" aria-hidden="true" />
            {rede.map((item) => (
              <li key={item.nome} className="relative bg-card rounded-2xl border p-6 text-center">
                <div className="relative mx-auto w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 ring-8 ring-background">
                  <item.icone className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">{item.nivel}</p>
                <p className="font-heading font-semibold text-lg leading-snug">{item.nome}</p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2 mt-1">
                  <MapPin className="w-3 h-3" />
                  {item.local}
                </p>
                <p className="text-sm text-muted-foreground mb-3">{item.descricao}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Conhecer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
