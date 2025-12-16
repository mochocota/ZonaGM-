import React from 'react';

interface FooterProps {
  onOpenSitemap: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenSitemap }) => {
  return (
    <footer className="mt-auto w-full border-t border-border-color bg-surface py-8">
      <div className="flex justify-center">
        <div className="flex w-full max-w-[1200px] flex-col md:flex-row items-center justify-between gap-4 px-6">
          <p className="text-sm text-text-muted font-medium">© {new Date().getFullYear()} ZonaGM. Solo para fines de preservación.</p>
          <div className="flex gap-6">
            <button onClick={onOpenSitemap} className="text-sm text-text-muted hover:text-text-main font-medium transition-colors">
                Mapa del Sitio
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;