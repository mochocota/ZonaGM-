import React, { useMemo } from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const BubbleBackground: React.FC = () => {
  // Generamos un array estable de propiedades para las burbujas
  const bubbles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      // Tamaño base más pequeño (5px a 25px)
      size: Math.random() * 20 + 5,
      left: Math.random() * 100, // 0% a 100%
      duration: Math.random() * 12 + 15, // Más lento para mayor elegancia
      delay: Math.random() * 10,
      opacity: Math.random() * 0.1 + 0.02, // Opacidad muy sutil
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full bg-primary"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: `-100px`,
            opacity: bubble.opacity,
            filter: 'blur(3px)',
            animation: `float ${bubble.duration}s linear infinite`,
            animationDelay: `${bubble.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--tw-opacity);
          }
          90% {
            opacity: var(--tw-opacity);
          }
          100% {
            transform: translateY(-120vh) translateX(40px);
            opacity: 0;
          }
        }
        
        /* Ajuste específico para móviles: burbujas extremadamente sutiles */
        @media (max-width: 768px) {
          .bubble {
            transform: scale(0.2); /* Escala mucho más reducida para móviles */
            filter: blur(2px);
          }
        }
      `}</style>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative flex flex-col gap-8 py-24 md:py-32 items-center text-center px-4 w-full overflow-hidden">
      {/* Fondo de Burbujas */}
      <BubbleBackground />
      
      {/* Contenido */}
      <div className="relative z-10 space-y-4 max-w-4xl">
        {/* Título limpio sin animaciones de color */}
        <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter select-none leading-none text-text-main">
          ZonaGM
        </h1>
        <div className="space-y-2">
          <p className="text-text-muted text-xl md:text-3xl font-bold max-w-lg mx-auto italic opacity-90">
            "Reviviendo los clásicos, píxel a píxel."
          </p>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full mt-4" />
        </div>
      </div>
    </section>
  );
};

export default Hero;