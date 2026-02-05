import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsCarousel from "@/components/NewsCarousel";
import About from "@/components/About";
import InteractiveMap from "@/components/InteractiveMap";
import Projects from "@/components/Projects";
import CearaSemFome from "@/components/CearaSemFome";
import Collaborate from "@/components/Collaborate";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Se houver um scrollTo no state, faz o scroll após a renderização
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.querySelector(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <NewsCarousel />
        <About />
        <InteractiveMap />
        <Projects />
        <CearaSemFome />
        <Collaborate />
        <Team />
        <Contact />
      </motion.main>

      <Footer />
    </div>
  );
};

export default Index;
