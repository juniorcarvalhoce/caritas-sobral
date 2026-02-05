import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const lote22 = [
    { name: "Sobral", coords: [-3.6866, -40.3497] as [number, number] },
    { name: "Forquilha", coords: [-3.7972, -40.2672] as [number, number] },
    { name: "Groaíras", coords: [-3.9167, -40.3833] as [number, number] },
  ];

  const lote37 = [
    { name: "Alcântaras", coords: [-3.5833, -40.5500] as [number, number] },
    { name: "Meruoca", coords: [-3.5472, -40.4561] as [number, number] },
    { name: "Massapê", coords: [-3.5186, -40.3453] as [number, number] },
    { name: "Santana do Acaraú", coords: [-3.4619, -40.2156] as [number, number] },
    { name: "Senador Sá", coords: [-3.3531, -40.4692] as [number, number] },
  ];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-3.6, -40.35], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const blueIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    lote22.forEach((location) => {
      L.marker(location.coords, { icon: redIcon })
        .addTo(map)
        .bindPopup(`<strong>${location.name}</strong><br/>Lote 22`);
    });

    lote37.forEach((location) => {
      L.marker(location.coords, { icon: blueIcon })
        .addTo(map)
        .bindPopup(`<strong>${location.name}</strong><br/>Lote 37`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Onde <span className="text-gradient">Atuamos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Presentes em 8 municípios da Diocese de Sobral
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-4 md:p-8"
        >
          <div
            ref={mapRef}
            className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveMap;
