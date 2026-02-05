import { Heart } from "lucide-react";
import logoCaritas from "@/assets/logo-caritas.png";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden py-12 border-t border-border">
      <div className="absolute inset-0 glass-dark" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logoCaritas} alt="Cáritas Diocesana de Sobral" className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="font-heading font-semibold leading-tight">Cáritas</span>
              <span className="text-xs text-muted-foreground">Diocesana de Sobral</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 text-primary" />
            <p>A Solidariedade que Transforma</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Praça Quirino Rodrigues, 76 - Sala 04 - Centro - Sobral/CE
            </p>
            <p className="text-sm text-muted-foreground">
              CNPJ: 10.379.758/0001-36
            </p>
          </div>

          <div className="pt-6 border-t border-border w-full max-w-2xl">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cáritas Diocesana de Sobral. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
