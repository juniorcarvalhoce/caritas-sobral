import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users } from "lucide-react";
import mandala from "@/assets/mandala-caritas.svg";
import AnimatedCounter from "@/components/AnimatedCounter";
import logoCaritas from "@/assets/logo-caritas.png";

// Fundada em 1º de outubro de 1983: os anos se atualizam sozinhos
const calcularAnosDeHistoria = () => {
  const hoje = new Date();
  const jaFezAniversario = hoje.getMonth() > 9 || (hoje.getMonth() === 9 && hoje.getDate() >= 1);
  return hoje.getFullYear() - 1983 - (jaFezAniversario ? 0 : 1);
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const anosDeHistoria = calcularAnosDeHistoria();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Mandala da Cáritas como marca d'água (gira bem devagar) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <motion.img
          src={mandala}
          alt=""
          className="w-[140vw] max-w-none sm:w-[110vw] md:w-[85vw] lg:w-[70vw] xl:w-[60vw] opacity-[0.14] select-none"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--background)/0.55)_0%,_transparent_70%)]" />
      
      {/* Animated background elements - hidden on mobile for performance */}
      <div className="absolute inset-0 hidden md:block">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${i * 30}%`,
              top: `${i * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-28 pb-12 md:py-0 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo da Cáritas em destaque */}
          <motion.img
            src={logoCaritas}
            alt="Logo da Cáritas"
            width={112}
            height={112}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-6 drop-shadow-lg"
          />

          {/* Nome da instituição como título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading font-bold leading-none mb-5 md:mb-7 px-2"
          >
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-foreground">
              Cáritas
            </span>
            <span className="block mt-2 md:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gradient">
              Diocesana de Sobral
            </span>
          </motion.h1>

          {/* Lema, agora como frase de apoio */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4 md:mb-6 px-2"
          >
            <span className="hidden sm:block h-px w-10 md:w-16 bg-primary/40" />
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
            <span className="font-heading font-semibold uppercase tracking-[0.06em] sm:tracking-[0.15em] text-xs sm:text-base md:text-lg whitespace-nowrap">
              A solidariedade transforma vidas
            </span>
            <span className="hidden sm:block h-px w-10 md:w-16 bg-primary/40" />
          </motion.p>

          {/* Description with improved mobile spacing */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Desde 1983 promovendo justiça social, desenvolvimento sustentável e dignidade humana
            em todo o território da Diocese de Sobral
          </motion.p>

          {/* Buttons with improved mobile layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
          >
            <Button
              variant="hero"
              onClick={() => scrollToSection("voluntario")}
              className="group w-full sm:w-auto"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Seja Voluntário
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => scrollToSection("doacao")}
              className="w-full sm:w-auto"
            >
              <Heart className="w-5 h-5" />
              Faça uma Doação
            </Button>
          </motion.div>

          {/* Stats grid with improved mobile layout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 px-4"
          >
            {[
              { value: anosDeHistoria, suffix: "", label: "Anos de História" },
              { value: 8, suffix: "", label: "Municípios Atendidos" },
              { value: 1000, suffix: "+", label: "Vidas Impactadas" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="glass rounded-xl md:rounded-2xl p-4 md:p-6"
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  delay={1.2 + index * 0.1}
                  className="block text-2xl md:text-4xl font-bold text-gradient mb-1 md:mb-2"
                />
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
