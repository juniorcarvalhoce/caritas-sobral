import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Phone, Mail, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappMessage = `*Contato via Site*%0A%0A*Nome:* ${formData.name}%0A*Email:* ${formData.email}%0A*Telefone:* ${formData.phone}%0A*Mensagem:* ${formData.message}`;
    const whatsappUrl = `https://wa.me/5588994253039?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Redirecionando para o WhatsApp...");
    
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: "Praça Quirino Rodrigues, 76 - Sala 04",
      subtitle: "Centro - Sobral/CE - CEP 62011-260",
    },
    {
      icon: Phone,
      title: "Telefones",
      content: "(88) 9.9425-3039",
      subtitle: "(88) 9.9961-9348",
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "caritassobral@hotmail.com",
      subtitle: "",
    },
    {
      icon: Instagram,
      title: "Instagram",
      content: "@caritassobral",
      subtitle: "",
    },
  ];

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
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8 h-[400px]">
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

            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="glass rounded-2xl p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{info.title}</h3>
                  <p className="text-sm text-foreground font-medium">{info.content}</p>
                  {info.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{info.subtitle}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="glass-dark"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="glass-dark"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(88) 9 9999-9999"
                  className="glass-dark"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Como podemos ajudar?"
                  rows={5}
                  className="glass-dark resize-none"
                />
              </div>

              <Button type="submit" variant="default" className="w-full group" size="lg">
                <Send className="w-5 h-5" />
                Enviar Mensagem
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao enviar, você será redirecionado para o WhatsApp
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
