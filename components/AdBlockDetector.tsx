
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Heart, X } from 'lucide-react';

const AdBlockDetector: React.FC = () => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Usar requestIdleCallback si está disponible para no bloquear el hilo principal
    const runCheck = () => {
        const bait = document.createElement('div');
        bait.className = 'adsbox ad-banner pub_300x250';
        bait.style.cssText = 'position: absolute; top: -1000px; left: -1000px; width: 1px; height: 1px;';
        bait.innerHTML = '&nbsp;';
        document.body.appendChild(bait);

        setTimeout(() => {
            if (
            bait.offsetParent === null ||
            bait.offsetHeight === 0 ||
            bait.offsetLeft === 0 ||
            bait.offsetTop === 0 ||
            bait.offsetWidth === 0 ||
            bait.clientHeight === 0 ||
            bait.clientWidth === 0 ||
            window.getComputedStyle(bait).display === 'none'
            ) {
              setIsAdBlockDetected(true);
              setIsOpen(true);
            }
            try {
              document.body.removeChild(bait);
            } catch (e) {}
        }, 300);
    };

    const delayTimer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(runCheck);
        } else {
            runCheck();
        }
    }, 5000); // 5 segundos después de la carga inicial para dar prioridad al LCP

    return () => clearTimeout(delayTimer);
  }, []);

  if (!isAdBlockDetected || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-primary/50 p-6 relative animate-zoom-in">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary-hover animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-main">Adblock Detectado</h2>
          <div className="text-text-muted space-y-2">
            <p>Hola, hemos notado que estás usando un bloqueador de publicidad.</p>
            <p className="text-sm">ZonaGM se mantiene viva gracias a la publicidad no intrusiva. Ayúdanos a mantener los servidores.</p>
          </div>
          <div className="p-4 bg-background rounded-xl border border-border-color w-full">
            <p className="text-sm font-bold text-text-main flex items-center justify-center gap-2">
              <Heart size={16} className="text-red-500 fill-red-500" />
              Por favor, desactívalo para ayudarnos.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Ya lo desactivé (Recargar)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBlockDetector;
