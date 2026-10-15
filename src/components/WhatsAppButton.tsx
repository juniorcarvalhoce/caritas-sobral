import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const WHATSAPP_NUMERO = "5588994253039";
const MENSAGEM = "Olá! Vim pelo site da Cáritas Diocesana de Sobral e gostaria de mais informações.";

// Botão flutuante do WhatsApp, visível nas páginas públicas
const WhatsAppButton = () => {
  const { pathname } = useLocation();
  const [mostrarBalao, setMostrarBalao] = useState(false);

  useEffect(() => {
    const abrir = setTimeout(() => setMostrarBalao(true), 4000);
    const fechar = setTimeout(() => setMostrarBalao(false), 12000);
    return () => {
      clearTimeout(abrir);
      clearTimeout(fechar);
    };
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  const href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAGEM)}`;

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 flex items-center gap-3">
      <AnimatePresence>
        {mostrarBalao && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden sm:block glass rounded-2xl px-4 py-2 text-sm shadow-lg"
          >
            Fale com a gente pelo WhatsApp
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar com a Cáritas pelo WhatsApp"
        title="Conversar pelo WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 motion-reduce:hidden" />
        <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8 relative" fill="currentColor" aria-hidden="true">
          <path d="M16.04 3C8.86 3 3.02 8.83 3.02 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A13 13 0 0 0 16.04 29C23.2 29 29 23.17 29 16S23.2 3 16.04 3Zm0 23.8c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.97 1.04 1.06-3.86-.26-.4A10.77 10.77 0 0 1 5.2 16c0-5.97 4.86-10.82 10.84-10.82 5.97 0 10.8 4.85 10.8 10.82 0 5.97-4.83 10.8-10.8 10.8Zm5.93-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.28-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.87-1.63-1.94-1.82-2.27-.19-.33-.02-.5.14-.67.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.22 2.3 3.5 5.56 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38Z" />
        </svg>
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
