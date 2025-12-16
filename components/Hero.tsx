import React from 'react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="flex flex-col gap-8 py-12 md:py-16 items-center text-center px-4 w-full">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-main">
          ZonaGM
        </h1>
        <p className="text-text-muted text-lg md:text-xl font-medium max-w-lg mx-auto">
          Explora nuestra colección de ISOs y ROMs verificados.
        </p>
      </div>
    </section>
  );
};

export default Hero;