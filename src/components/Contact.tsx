import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL =
  "https://wa.me/5588994253039?text=" +
  encodeURIComponent("Olá! Gostaria de falar com a Cáritas Diocesana de Sobral.");

interface Linha {
  texto: string;
  href: string;
  externo?: boolean;
  secundaria?: boolean;
}

interface Info {
  icon: typeof MapPin;
  title: string;
  linhas: Linha[];
}

const contactInfo: Info[] = [
  {
    icon: MapPin,
    title: "Endereço",
    linhas: [
      {
        texto: "Praça Quirino Rodrigues, 76 - Sala 04",
        href: "https://www.google.com/maps/search/?api=1&query=-3.6850177,-40.3452534",
        externo: true,
      },
      {
        texto: "Centro - Sobral/CE - CEP 62011-260",
        href: "https://www.google.com/maps/search/?api=1&query=-3.6850177,-40.3452534",
        externo: true,
        secundaria: true,
      },
    ],
  },
  {
    icon: Phone,
    title: "Telefones",
    linhas: [
      { texto: "(88) 9.9425-3039", href: "tel:+5588994253039" },
      { texto: "(88) 9.9961-9348", href: "tel:+5588999619348", secundaria: true },
    ],
  },
  {
    icon: Mail,
    title: "E-mail",
    linhas: [{ texto: "caritassobral@hotmail.com", href: "mailto:caritassobral@hotmail.com" }],
  },
  {
    icon: Instagram,
    title: "Instagram",
    linhas: [
      { texto: "@caritassobral", href: "https://www.instagram.com/caritassobral/", externo: true },
    ],
  },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contato" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Entre em <span className="text-gradient">Contato</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos prontos para ouvir você
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-8 h-[400px] lg:h-full lg:min-h-[400px]">
              <iframe
                src="https://maps.google.com/maps?q=-3.6850177,-40.3452534&z=18&hl=pt-BR&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "1rem" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Cáritas Sobral"
              />
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="glass rounded-2xl p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{info.title}</h3>
                  {info.linhas.map((linha) => (
                    <a
                      key={linha.texto}
                      href={linha.href}
                      {...(linha.externo ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={`block break-words hover:text-primary hover:underline transition-colors ${
                        linha.secundaria
                          ? "text-xs text-muted-foreground mt-1"
                          : "text-sm text-foreground font-medium"
                      }`}
                    >
                      {linha.texto}
                    </a>
                  ))}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 sm:justify-between lg:mt-auto"
            >
              <div className="text-center sm:text-left">
                <p className="font-heading font-semibold">Prefere conversar agora?</p>
                <p className="text-sm text-muted-foreground">Fale com a gente pelo WhatsApp</p>
              </div>
              <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1ebe5a] text-white">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
