import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Droplets, Handshake, Sparkles, Scale } from "lucide-react";
import semiAridoIcon from "@/assets/semiarido-icon.jpg";
import economiaIcon from "@/assets/economia-icon.jpg";
import juventudeIcon from "@/assets/juventude-icon.jpg";
import politicasIcon from "@/assets/politicas-icon.jpg";

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const projects = [
    {
      icon: Droplets,
      image: semiAridoIcon,
      title: "Convivência com o Semiárido",
      description:
        "Ações de convivência com o semiárido através de cisternas, quintais produtivos, feiras agroecológicas e casas de sementes crioulas.",
      financiador: "MISEREOR",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Handshake,
      image: economiaIcon,
      title: "Economia Solidária",
      description:
        "Acompanhamento e fortalecimento de grupos de produção artesanal e agricultura familiar, promovendo autonomia econômica.",
      financiador: "",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Sparkles,
      image: juventudeIcon,
      title: "Juventudes",
      description:
        "Formação de jovens sobre políticas públicas, participação social e protagonismo comunitário.",
      financiador: "",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Scale,
      image: politicasIcon,
      title: "Políticas Públicas",
      description:
        "Elaboração de Planos de Desenvolvimento Local Sustentável e participação em mesas de negociação com o poder público.",
      financiador: "",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section id="projetos" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="text-gradient">Projetos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ações transformadoras em diferentes frentes de atuação social
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg`}>
                    <project.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold flex-1">
                    {project.title}
                  </h3>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {project.description}
                </p>

                {project.financiador && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-primary font-medium">
                      Financiado por {project.financiador}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
