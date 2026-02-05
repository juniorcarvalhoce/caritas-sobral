import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Users, Building2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Collaborate = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <section id="colabore" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Colabore Conosco</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sua solidariedade também pode transformar vidas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="font-heading text-2xl font-semibold mb-4">Seja Voluntário</h3>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Junte-se a nós e contribua com seu tempo, talento e dedicação para transformar
              a realidade de comunidades vulneráveis. Cada gesto de solidariedade faz a diferença!
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Participe de ações comunitárias</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Contribua com suas habilidades</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Ajude a construir um futuro melhor</span>
              </li>
            </ul>

            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                const element = document.getElementById("contato");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Users className="w-5 h-5" />
              Entre em Contato
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-3xl p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="font-heading text-2xl font-semibold mb-4">Faça uma Doação</h3>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Sua contribuição financeira nos ajuda a manter e expandir nossos projetos sociais,
              alcançando cada vez mais pessoas que precisam.
            </p>

            <div className="glass-dark rounded-2xl p-6 mb-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Banco</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Bradesco (237)</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("237", "Código do banco")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Agência</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">0702</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("0702", "Agência")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conta</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">15631-0</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("15631-0", "Conta")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">10.379.758/0001-36</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("10.379.758/0001-36", "CNPJ")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">PIX (E-mail)</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">caritassobral@hotmail.com</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard("caritassobral@hotmail.com", "Chave PIX")
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-xl p-4 text-center">
              <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Cáritas Diocesana de Sobral
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Collaborate;
