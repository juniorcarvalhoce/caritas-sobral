import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Utensils, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const CearaSemFome = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="glass px-6 py-3 rounded-full inline-flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Programa Estadual</span>
              </div>
            </motion.div>

            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Ceará Sem Fome</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combate à fome e à insegurança alimentar no estado do Ceará
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-3xl p-8 md:p-12 mb-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                A Cáritas Diocesana de Sobral é <strong className="text-foreground">gestora local</strong> do{" "}
                <strong className="text-foreground">Programa Ceará Sem Fome</strong>, uma iniciativa do
                Governo do Estado do Ceará que visa erradicar a fome e promover a segurança alimentar
                e nutricional.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="glass-dark rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Unidades Sociais Produtoras
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Apoio a instituições que produzem e distribuem refeições para populações vulneráveis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-dark rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Rede de Voluntários
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Mobilização de instituições e voluntários para ampliar o alcance das ações
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                O programa atua em parceria com organizações da sociedade civil, fortalecendo a rede
                de proteção social e garantindo o acesso a alimentação de qualidade para milhares
                de famílias cearenses.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="default"
                size="lg"
                className="group"
                onClick={() => window.open("https://www.cearasemfome.ce.gov.br/", "_blank")}
              >
                Saiba Mais sobre o Programa
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CearaSemFome;
