import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] mt-4 mb-8 py-20 md:py-32 px-6 text-center bg-[#F9F506] shadow-[0_20px_50px_-15px_rgba(249,245,6,0.3)] border border-black/5 isolate">
      
      {/* Mesh Gradient Animation Container */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Amber Sphere */}
        <div className="absolute top-[-30%] left-[-15%] w-[100%] h-[100%] bg-[#FF8C00] rounded-full filter blur-[120px] opacity-60 animate-float-1" />
        
        {/* Shine Sphere */}
        <div className="absolute top-[10%] right-[-25%] w-[80%] h-[80%] bg-white rounded-full filter blur-[100px] opacity-70 animate-float-2" />
        
        {/* Golden Sphere */}
        <div className="absolute bottom-[-40%] left-[20%] w-[90%] h-[90%] bg-[#FFD700] rounded-full filter blur-[140px] opacity-50 animate-float-3" />

        {/* Textured Overlay */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/10 border border-black/5 backdrop-blur-xl mb-4 animate-fade-in shadow-inner">
          <Sparkles size={16} className="text-black" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-black">
            The Digital Preservation Vault
          </span>
        </div>

        {/* Animated Title */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none drop-shadow-sm select-none animate-text-gradient">
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
      
      {/* Decorative Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </section>
  );
};

export default Hero;