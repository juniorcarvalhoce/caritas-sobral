import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Mobile-friendly background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/85 md:from-background/80 md:via-background/60 md:to-background/80" />
      
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

      <div className="container mx-auto px-4 py-8 md:py-0 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge with improved mobile positioning */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4 md:mb-6"
          >
            <div className="glass px-3 py-2 md:px-6 md:py-3 rounded-full inline-flex items-center gap-2 text-xs md:text-sm">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Desde 1983 transformando vidas</span>
            </div>
          </motion.div>

          {/* Main heading with better mobile typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2"
          >
            A SOLIDARIEDADE
            <br />
            <span className="text-gradient">TRANSFORMA VIDAS</span>
          </motion.h1>

          {/* Description with improved mobile spacing */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Promovendo justiça social, desenvolvimento sustentável e dignidade humana
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
              onClick={() => scrollToSection("colabore")}
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
              onClick={() => scrollToSection("colabore")}
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
              { number: "40+", label: "Anos de História" },
              { number: "8", label: "Municípios Atendidos" },
              { number: "1000+", label: "Vidas Impactadas" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="glass rounded-xl md:rounded-2xl p-4 md:p-6"
              >
                <div className="text-2xl md:text-4xl font-bold text-gradient mb-1 md:mb-2">{stat.number}</div>
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
