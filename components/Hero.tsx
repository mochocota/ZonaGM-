import React from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="flex flex-col gap-8 py-16 md:py-24 items-center text-center px-4 w-full">
      <div className="space-y-4 max-w-4xl">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter animate-zona-colors select-none">
          ZonaGM
        </h1>
        <p className="text-text-muted text-lg md:text-2xl font-bold max-w-lg mx-auto italic">
          "Reviviendo los clásicos, píxel a píxel."
        </p>
      </div>
    </section>
  );
};

export default Hero;