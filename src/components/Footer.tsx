import { Heart } from "lucide-react";
import logoCaritas from "@/assets/logo-caritas.png";

const fotosRodape = [
  { src: "/rodape/arco-nossa-senhora.webp", alt: "Arco de Nossa Senhora de Fátima iluminado, em Sobral" },
  { src: "/rodape/catedral.webp", alt: "Catedral de Sobral vista do alto, à noite" },
  { src: "/rodape/ponte.webp", alt: "Ponte Othon de Alencar sobre o Rio Acaraú, à noite" },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden py-16 bg-neutral-950 text-white">
      <div className="absolute inset-0 flex" aria-hidden="true">
        {fotosRodape.map((foto) => (
          <img
            key={foto.src}
            src={foto.src}
            alt=""
            loading="lazy"
            className="h-full flex-1 min-w-0 object-cover opacity-55"
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/45 to-neutral-950/80" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logoCaritas} alt="Cáritas Diocesana de Sobral" className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="font-heading font-semibold leading-tight">Cáritas</span>
              <span className="text-xs text-white/70">Diocesana de Sobral</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/80">
            <Heart className="w-4 h-4 text-primary" />
            <p>A Solidariedade que Transforma</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-white/80 mb-2">
              Praça Quirino Rodrigues, 76 - Sala 04 - Centro - Sobral/CE
            </p>
            <p className="text-sm text-white/80">
              CNPJ: 10.379.758/0001-36
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 w-full max-w-2xl">
            <p className="text-center text-sm text-white/70">
              © {new Date().getFullYear()} Cáritas Diocesana de Sobral. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
