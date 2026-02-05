import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { User } from "lucide-react";

const Team = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const diretoria = [
    { cargo: "Presidente", nome: "Pe. Tomé da Silva" },
    { cargo: "Vice-Presidente", nome: "Pe. Francisco de Assis Neto" },
    { cargo: "Tesoureiro", nome: "Pe. José Marcone Martins" },
    { cargo: "Secretária", nome: "Irmã Maria Elizete Sousa Carneiro" },
  ];

  const coordenacao = { cargo: "Coordenação Executiva", nome: "José Maria Gomes Vasconcelos" };

  const membros = [
    { tipo: "titular", nome: "Francisco Mendes Silva" },
    { tipo: "titular", nome: "Maria Luciana Torres Ribeiro" },
    { tipo: "titular", nome: "Antônio Elizeu Gomes da Silva" },
    { tipo: "suplente", nome: "Aline Patrícia Nobre Pereira" },
    { tipo: "suplente", nome: "Francisca Edileusa de Oliveira" },
    { tipo: "suplente", nome: "Francisca Lucivânia Rodrigues de Sousa" },
  ];

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

        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center">Diretoria</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {diretoria.map((membro, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="glass rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                    {membro.cargo}
                  </p>
                  <p className="font-heading font-semibold">{membro.nome}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center"
          >
            <div className="glass rounded-2xl p-8 text-center max-w-md group hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">
                {coordenacao.cargo}
              </p>
              <p className="font-heading font-semibold text-lg">{coordenacao.nome}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center">
              Membros do Conselho
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membros.map((membro, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
                  className="glass rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div
                    className={`w-14 h-14 rounded-full ${
                      membro.tipo === "titular"
                        ? "bg-gradient-to-br from-green-500 to-emerald-500"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    } flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                      membro.tipo === "titular" ? "text-green-600" : "text-purple-600"
                    }`}
                  >
                    {membro.tipo}
                  </p>
                  <p className="font-heading font-semibold text-sm">{membro.nome}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Team;
