import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] mt-4 mb-8 py-16 md:py-24 px-6 text-center bg-[#F9F506] shadow-soft border border-black/5 isolate">
      
      {/* Mesh Gradient Animation Layer */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Amber Blob - Large & Deep */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#FF8C00] rounded-full filter blur-[120px] opacity-40 animate-blob-drift will-change-transform" />
        
        {/* Shine Blob - White & Bright */}
        <div className="absolute top-[10%] right-[-15%] w-[60%] h-[60%] bg-white rounded-full filter blur-[100px] opacity-60 animate-blob-drift-reverse will-change-transform" />
        
        {/* Golden Blob - Rich Yellow */}
        <div className="absolute bottom-[-20%] left-[10%] w-[70%] h-[70%] bg-[#FFD700] rounded-full filter blur-[130px] opacity-50 animate-blob-drift-slow will-change-transform" />

        {/* Subtle Noise Texture overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/5 backdrop-blur-lg mb-2">
          <Sparkles size={14} className="text-black/70" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/70">
            Archivo de Preservación Digital
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black leading-none drop-shadow-sm select-none">
          ZonaGM
        </h1>
        
        <div className="space-y-4">
            <p className="text-black/80 text-lg md:text-2xl font-bold max-w-xl mx-auto leading-tight italic">
              "El refugio definitivo para los clásicos que definieron generaciones."
            </p>
            <div className="w-24 h-1 bg-black/10 mx-auto rounded-full" />
            <p className="text-black/60 text-sm md:text-base font-medium max-w-lg mx-auto">
              Explora nuestra colección curada de ISOs y ROMs verificadas con los más altos estándares de calidad.
            </p>
        </div>
      </div>
      
      {/* Classic CRT Scanline effect (Extreme subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </section>
  );
};

export default Hero;