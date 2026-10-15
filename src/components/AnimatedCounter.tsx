import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

// Conta de 0 até o valor quando o número entra na tela
const AnimatedCounter = ({ value, suffix = "", duration = 2, delay = 0, className }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, value, duration, delay, reduceMotion]);

  return (
    <span ref={ref} className={className} aria-label={`${value.toLocaleString("pt-BR")}${suffix}`}>
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
