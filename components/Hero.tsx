
import React, { useMemo } from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const BubbleBackground: React.FC = () => {
  const bubbles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 12 + 4,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-primary/20 will-change-transform"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: `-20px`,
            animation: `float-up ${bubble.duration}s linear infinite`,
            animationDelay: `${bubble.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="hero-section relative flex flex-col gap-4 py-8 md:py-16 items-center text-center px-4 w-full overflow-hidden justify-center will-change-transform">
      <BubbleBackground />
      <div className="relative z-10 space-y-2 max-w-4xl">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-text-main drop-shadow-sm">
          ZonaGM
        </h1>
        <p className="text-text-muted text-base md:text-xl font-bold italic opacity-80">
          "Reviviendo los clásicos, píxel a píxel."
        </p>
        <div className="h-1.5 w-16 bg-primary mx-auto rounded-full mt-4" />
      </div>
    </section>
  );
};

export default React.memo(Hero);
