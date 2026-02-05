import { useState, useEffect } from "react";
import { Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoCaritas from "@/assets/logo-caritas.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Projetos", href: "#projetos" },
    { label: "Colabore", href: "#colabore" },
    { label: "Contato", href: "#contato" },
    { label: "Editais", href: "/editais" },
  ];

  const scrollToSection = (href: string) => {
    // Navega para rota se não for âncora
    if (href.startsWith("/")) {
      navigate(href);
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Se for âncora e não estiver na página inicial, navega primeiro para a página inicial
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: href } });
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Se já estiver na página inicial, apenas faz o scroll
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src={logoCaritas} alt="Cáritas Diocesana de Sobral" className="w-12 h-12" />
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg leading-tight">Cáritas</span>
              <span className="text-xs text-muted-foreground">Diocesana de Sobral</span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium hover:text-primary transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="hidden md:block"
            >
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/login')}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                Área Administrativa
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 glass rounded-lg overflow-hidden"
            >
              <div className="flex flex-col gap-2 p-4">
                {menuItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="text-left py-2 px-4 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-white/20 mt-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Área Administrativa
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
