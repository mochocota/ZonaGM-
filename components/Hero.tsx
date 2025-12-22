import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] mt-4 mb-8 py-20 md:py-28 px-6 text-center bg-[#F9F506] shadow-[0_20px_50px_-15px_rgba(249,245,6,0.3)] border border-black/5 isolate">
      
      {/* Mesh Gradient Animation Container */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Deep Amber Blob */}
        <div className="absolute top-[-25%] left-[-15%] w-[90%] h-[90%] bg-[#FF8C00] rounded-full filter blur-[100px] opacity-60 animate-float-1" />
        
        {/* Bright White/Yellow Reflection */}
        <div className="absolute top-[10%] right-[-20%] w-[70%] h-[70%] bg-white rounded-full filter blur-[120px] opacity-70 animate-float-2" />
        
        {/* Soft Gold Blob */}
        <div className="absolute bottom-[-30%] left-[15%] w-[80%] h-[80%] bg-[#FFD700] rounded-full filter blur-[110px] opacity-50 animate-float-3" />

        {/* Textured Overlay for Premium Feel */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      </div>

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/10 border border-black/5 backdrop-blur-xl mb-4 animate-fade-in">
          <Sparkles size={16} className="text-black" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-black">
            The Digital Preservation Vault
          </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-black leading-none drop-shadow-sm select-none">
          ZonaGM
        </h1>
        
        <div className="space-y-6 max-w-2xl mx-auto">
            <p className="text-black/80 text-xl md:text-3xl font-bold leading-tight italic tracking-tight">
              "Reviviendo los clásicos, píxel a píxel."
            </p>
            <div className="w-32 h-1.5 bg-black/10 mx-auto rounded-full" />
            <p className="text-black/60 text-base md:text-lg font-semibold leading-relaxed">
              Explora una biblioteca curada de ISOs y ROMs verificadas. Calidad garantizada para entusiastas de la emulación.
            </p>
        </div>
      </div>
      
      {/* Decorative Border Glow */}
      <div className="absolute inset-0 border-[1px] border-white/20 rounded-[2.5rem] pointer-events-none" />
    </section>
  );
};

export default Hero;