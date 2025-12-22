import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] mt-4 mb-8 py-16 md:py-24 px-6 text-center bg-[#F9F506] shadow-soft border border-black/5">
      
      {/* Animated Mesh Gradient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Amber Blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFD700] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob-drift" />
        
        {/* Bright Yellow Blob */}
        <div className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-[#F9F506] rounded-full mix-blend-screen filter blur-[60px] opacity-80 animate-blob-drift animation-delay-2000" style={{ animationDirection: 'reverse' }} />
        
        {/* Golden Blob */}
        <div className="absolute bottom-[-15%] left-[20%] w-[55%] h-[55%] bg-[#EBE705] rounded-full mix-blend-multiply filter blur-[90px] opacity-60 animate-blob-drift animation-delay-4000" />

        {/* Dynamic Overlay Grain/Noise (Subtle) */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-black/5 backdrop-blur-md mb-2">
          <Sparkles size={14} className="text-black" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black">
            Archivo de Preservación Digital
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black leading-none drop-shadow-sm">
          ZonaGM
        </h1>
        
        <div className="space-y-4">
            <p className="text-black/80 text-lg md:text-2xl font-bold max-w-xl mx-auto leading-tight italic">
              "El refugio definitivo para los clásicos que definieron generaciones."
            </p>
            <div className="w-24 h-1 bg-black/20 mx-auto rounded-full" />
            <p className="text-black/60 text-sm md:text-base font-medium max-w-lg mx-auto">
              Explora nuestra colección curada de ISOs y ROMs verificadas con los más altos estándares de calidad.
            </p>
        </div>
      </div>
      
      {/* Sutil scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </section>
  );
};

export default Hero;