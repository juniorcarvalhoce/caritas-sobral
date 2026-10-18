import { useReducedMotion } from "framer-motion";
import { Handshake } from "lucide-react";
import { parceiros } from "@/data/projetos";

// Faixa com os parceiros e financiadores, rolando continuamente (para ao passar o mouse)
const FaixaParceiros = () => {
  const reduzirMovimento = useReducedMotion();

  const Item = ({ nome }: { nome: string }) => (
    <li className="flex items-center gap-3 px-5 md:px-7 whitespace-nowrap text-sm md:text-base font-semibold text-foreground/70">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/50" aria-hidden="true" />
      {nome}
    </li>
  );

  return (
    <div className="mt-16 md:mt-20">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        <Handshake className="w-4 h-4 text-primary" />
        Parceiros e financiadores que caminharam conosco
      </p>

      {reduzirMovimento ? (
        <ul className="flex flex-wrap justify-center gap-y-3">
          {parceiros.map((p) => (
            <Item key={p} nome={p} />
          ))}
        </ul>
      ) : (
        <div
          className="group relative overflow-hidden py-4 border-y bg-card/50"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <ul
            className="flex w-max group-hover:[animation-play-state:paused]"
            style={{ animation: `faixa-parceiros ${parceiros.length * 4}s linear infinite` }}
          >
            {/* A lista aparece duas vezes para a rolagem emendar sem corte */}
            {[...parceiros, ...parceiros].map((p, i) => (
              <Item key={`${p}-${i}`} nome={p} />
            ))}
          </ul>
          <ul className="sr-only">
            {parceiros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FaixaParceiros;
