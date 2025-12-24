
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, DollarSign, Download, Gamepad2, AlertCircle, Key, Filter } from 'lucide-react';

interface HelpViewProps {
  content: {
    shortenerExplanation: string;
    faqs: { q: string, a: string }[];
  };
}

const HelpView: React.FC<HelpViewProps> = ({ content }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const getIcon = (index: number) => {
    switch (index) {
        case 0: return <Download size={20} />;
        case 1: return <Gamepad2 size={20} />;
        case 2: return <Key size={20} />;
        case 3: return <AlertCircle size={20} />;
        case 4: return <Filter size={20} />;
        default: return <HelpCircle size={20} />;
    }
  };

  return (
    <div className="w-full max-w-[1000px] animate-fade-in duration-500 py-8">
      <div className="bg-surface rounded-3xl border border-border-color overflow-hidden shadow-soft">
        
        {/* Header Section */}
        <div className="bg-primary p-8 md:p-12 text-black relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight uppercase italic">¿Necesitas Ayuda?</h1>
                <p className="text-black/80 font-bold text-lg leading-relaxed">
                    Hemos preparado esta guía rápida para resolver tus dudas sobre cómo navegar y descargar en ZonaGM.
                </p>
            </div>
            <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-black/5 rotate-12" />
        </div>

        <div className="p-6 md:p-10 space-y-12">
            
            {/* Shortener Section */}
            <section className="bg-background rounded-2xl p-6 md:p-8 border border-border-color shadow-sm">
                <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-black">
                        <DollarSign size={24} />
                    </div>
                    ¿Por qué usamos acortadores?
                </h2>
                <div className="space-y-4">
                    <p className="text-text-muted text-lg leading-relaxed whitespace-pre-wrap">
                        {content.shortenerExplanation}
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section>
                <h2 className="text-2xl font-bold text-text-main mb-8 flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-black">
                        <HelpCircle size={24} />
                    </div>
                    Preguntas Frecuentes
                </h2>
                
                <div className="space-y-4">
                    {content.faqs.map((faq, index) => (
                        <div key={index} className="bg-background rounded-2xl border border-border-color overflow-hidden transition-all">
                            <button 
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left group hover:bg-surface transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl transition-all ${openIndex === index ? 'bg-primary text-black' : 'bg-surface text-text-muted border border-border-color'}`}>
                                        {getIcon(index)}
                                    </div>
                                    <span className={`font-bold text-lg ${openIndex === index ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                                        {faq.q}
                                    </span>
                                </div>
                                <div className={`p-1.5 rounded-full bg-surface border border-border-color transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-background' : ''}`}>
                                    <ChevronDown size={20} className="text-text-main" />
                                </div>
                            </button>
                            
                            {openIndex === index && (
                                <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2">
                                    <div className="pl-14">
                                        <p className="text-text-muted leading-relaxed text-base">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};

export default HelpView;
