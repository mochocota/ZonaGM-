import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] mt-4 mb-8 py-16 md:py-24 px-6 text-center bg-gradient-to-br from-[#F9F506] via-[#FFD700] to-[#EBE705] bg-[length:400%_400%] animate-gradient-slow shadow-soft border border-black/5">
      {/* Decorative Blobs for "Elegance" */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/5 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-black/5 backdrop-blur-md mb-2">
          <Sparkles size={14} className="text-black" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black">
            Archivo de Preservación Digital
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black leading-none drop-shadow-sm">
          ZonaGM
        </h1>
        
        <div className="space-y-2">
            <p className="text-black/80 text-lg md:text-2xl font-bold max-w-xl mx-auto leading-tight italic">
              "El refugio definitivo para los clásicos que definieron generaciones."
            </p>
            <p className="text-black/60 text-sm md:text-base font-medium max-w-lg mx-auto">
              Explora nuestra colección curada de ISOs y ROMs verificadas con los más altos estándares de calidad.
            </p>
        </div>
      </div>
      
      {/* Sutil scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </section>
  );
};

export default Hero;