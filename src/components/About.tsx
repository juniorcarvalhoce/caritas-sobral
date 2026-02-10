import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Target, Users, Award } from "lucide-react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Heart,
      title: "Solidariedade",
      description: "Amor ao próximo e compromisso com os mais vulneráveis",
    },
    {
      icon: Target,
      title: "Justiça Social",
      description: "Luta pela igualdade e dignidade humana",
    },
    {
      icon: Users,
      title: "Participação",
      description: "Protagonismo das comunidades em seu desenvolvimento",
    },
    {
      icon: Award,
      title: "Sustentabilidade",
      description: "Ações duradouras que respeitam o meio ambiente",
    },
  ];

  return (
    <section id="sobre" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Sobre a <span className="text-gradient">Cáritas Diocesana</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma história de fé, solidariedade e transformação social
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            <h3 className="font-heading text-2xl font-semibold mb-6">Nossa História</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A <strong className="text-foreground">Cáritas Diocesana de Sobral</strong> foi fundada em{" "}
                <strong className="text-foreground">1 de outubro de 1983</strong>, como um organismo da
                Conferência Nacional dos Bispos do Brasil (CNBB), dedicada à promoção da justiça social
                e ao desenvolvimento humano integral.
              </p>
              <p>
                Com mais de 40 anos de atuação, desenvolvemos projetos que fortalecem a convivência
                com o semiárido, promovem a economia solidária, empoderam as juventudes e incentivam
                a participação em políticas públicas.
              </p>
              <p>
                Nossa missão é <strong className="text-foreground">testemunhar a solidariedade cristã</strong>{" "}
                através de ações concretas que promovam a dignidade humana, a sustentabilidade e a
                transformação social.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                  <p className="font-semibold">10.379.758/0001-36</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fundação</p>
                  <p className="font-semibold">01/10/1983</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-lg mb-1">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass rounded-3xl p-8 md:p-12 text-center"
        >
          <h3 className="font-heading text-2xl font-semibold mb-4">Nossa Missão</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Testemunhar e anunciar o Evangelho de Jesus Cristo, defendendo e promovendo toda forma de vida e participando da construção solidária da sociedade do Bem Viver, sinal do Reino de Deus, junto com as pessoas em situação de vulnerabilidade e exclusão social é a missão da Cáritas Diocesana de Sobral.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
