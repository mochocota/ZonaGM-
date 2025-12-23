
import React, { useMemo } from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const BubbleBackground: React.FC = () => {
  const bubbles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 15 + 5,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 20,
      delay: Math.random() * 5,
      opacity: 0.03,
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
            bottom: `-20px`,
            opacity: bubble.opacity,
            animation: `float ${bubble.duration}s linear infinite`,
            animationDelay: `${bubble.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.03; }
          90% { opacity: 0.03; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative flex flex-col gap-4 py-8 md:py-16 items-center text-center px-4 w-full overflow-hidden min-h-[160px] md:min-h-[280px] justify-center">
      <BubbleBackground />
      <div className="relative z-10 space-y-2 max-w-4xl">
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-text-main drop-shadow-sm">
          ZonaGM
        </h1>
        <p className="text-text-muted text-base md:text-xl font-bold italic opacity-80">
          "Reviviendo los clásicos, píxel a píxel."
        </p>
        <div className="h-1 w-12 bg-primary mx-auto rounded-full mt-2" />
      </div>
    </section>
  );
};

export default Hero;
