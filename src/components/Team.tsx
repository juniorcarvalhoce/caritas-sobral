import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Pessoa {
  cargo: string;
  nome: string;
  foto?: string;
}

const iniciais = (nome: string) =>
  nome
    .replace(/^(Pe\.|Dom|Irmã)\s+/, "")
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const Foto = ({ pessoa, className }: { pessoa: Pessoa; className: string }) => (
  <div
    className={`${className} rounded-full overflow-hidden mx-auto ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center`}
  >
    {pessoa.foto ? (
      <img
        src={pessoa.foto}
        alt={pessoa.nome}
        loading="lazy"
        className="w-full h-full object-cover object-top"
      />
    ) : (
      <span className="font-heading font-bold text-white text-2xl">{iniciais(pessoa.nome)}</span>
    )}
  </div>
);

const CartaoPessoa = ({ membro, delay }: { membro: Pessoa; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="glass rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <Foto pessoa={membro} className="w-28 h-28 mb-4" />
    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
      {membro.cargo}
    </p>
    <p className="font-heading font-semibold">{membro.nome}</p>
  </motion.div>
);

const Team = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const bispo: Pessoa = {
    cargo: "Bispo Diocesano",
    nome: "Dom José Luiz Gomes de Vasconcelos",
  };

  const diretoria: Pessoa[] = [
    { cargo: "Presidente", nome: "Pe. Tomé da Silva", foto: "/equipe/pe-tome.png" },
    { cargo: "Vice-Presidente", nome: "Pe. Francisco de Assis Neto", foto: "/equipe/pe-assis.png" },
    { cargo: "Tesoureiro", nome: "Pe. José Marcone Martins", foto: "/equipe/pe-marcone.png" },
    { cargo: "Secretária", nome: "Irmã Maria Elizete Sousa Carneiro", foto: "/equipe/irma-elizete.png" },
  ];

  const apoio: Pessoa[] = [
    { cargo: "Coordenação Executiva", nome: "Emanuelle Rocha dos Santos" },
    { cargo: "Diácono Voluntário", nome: "José Maria Gomes Vasconcelos" },
  ];

  const conselho = {
    titulares: ["Salvelina Mesquita Silva", "Luiz Souza do Nascimento", "Samoel Severiano"],
    suplentes: [
      "Maria Aparecida de Almeida Cândido",
      "Cleide Maria Pereira",
      "Maria de Fátima Mesquita",
    ],
  };

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Nossa <span className="text-gradient">Equipe</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pessoas dedicadas que fazem a diferença todos os dias
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="glass rounded-2xl p-8 text-center max-w-sm group hover:shadow-xl transition-all duration-300">
              <Foto pessoa={bispo} className="w-32 h-32 mb-5" />
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                {bispo.cargo}
              </p>
              <p className="font-heading font-semibold text-lg">{bispo.nome}</p>
            </div>
          </motion.div>

          <div>
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center">Diretoria</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {diretoria.map((membro, index) => (
                <CartaoPessoa key={membro.cargo} membro={membro} delay={0.1 * index} />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-6 mt-6 max-w-2xl mx-auto">
              {apoio.map((membro, index) => (
                <CartaoPessoa key={membro.cargo} membro={membro} delay={0.1 * index} />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8 max-w-3xl mx-auto"
          >
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center">
              Membros do Conselho
            </h3>
            <div className="grid md:grid-cols-2 gap-8 md:divide-x md:divide-border">
              <div className="md:pr-8">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-3">
                  Titulares
                </p>
                <ul className="space-y-2">
                  {conselho.titulares.map((nome) => (
                    <li key={nome} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      {nome}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:pl-8">
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-3">
                  Suplentes
                </p>
                <ul className="space-y-2">
                  {conselho.suplentes.map((nome) => (
                    <li key={nome} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      {nome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Team;
