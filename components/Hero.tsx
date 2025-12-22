import React, { useMemo } from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const BubbleBackground: React.FC = () => {
  // Generamos un array estable de propiedades para las burbujas
  const bubbles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 60 + 20, // 20px a 80px
      left: Math.random() * 100, // 0% a 100%
      duration: Math.random() * 10 + 10, // 10s a 20s
      delay: Math.random() * 5,
      opacity: Math.random() * 0.2 + 0.05, // 5% a 25%
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-primary"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: `-100px`,
            opacity: bubble.opacity,
            filter: 'blur(8px)',
            animation: `float ${bubble.duration}s linear infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
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
        <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter animate-zona-colors select-none leading-none">
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