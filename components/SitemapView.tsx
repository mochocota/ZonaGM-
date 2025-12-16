import React, { useMemo } from 'react';
import { Game } from '../types';
import { Gamepad2, ArrowRight } from 'lucide-react';

interface SitemapViewProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
}

const SitemapView: React.FC<SitemapViewProps> = ({ games, onSelectGame }) => {
  // Group games by console and sort them alphabetically
  const gamesByConsole = useMemo(() => {
    const grouped: Record<string, Game[]> = {};
    games.forEach(game => {
      if (!grouped[game.console]) grouped[game.console] = [];
      grouped[game.console].push(game);
    });
    return grouped;
  }, [games]);

  // Sort consoles alphabetically
  const sortedConsoles = Object.keys(gamesByConsole).sort();

  return (
    <div className="w-full max-w-[1000px] animate-slide-in-up duration-500 py-8">
      <div className="bg-surface rounded-3xl border border-border-color p-8 md:p-12 shadow-soft">
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-text-main mb-4">Mapa del Sitio</h1>
            <p className="text-text-muted text-lg max-w-2xl">
                Índice completo de todos los títulos disponibles en el archivo, organizados por sistema.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {sortedConsoles.map((consoleName) => (
            <div key={consoleName} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b-2 border-primary pb-2 w-full">
                <Gamepad2 size={24} className="text-text-main" />
                <h3 className="text-xl font-bold text-text-main uppercase tracking-wide">
                  {consoleName}
                </h3>
                <span className="ml-auto text-xs font-bold bg-gray-100 text-text-muted px-2 py-1 rounded-full">
                    {gamesByConsole[consoleName].length}
                </span>
              </div>
              
              <ul className="space-y-3">
                {gamesByConsole[consoleName]
                    .sort((a,b) => a.title.localeCompare(b.title))
                    .map(game => (
                  <li key={game.id} className="group">
                    <a 
                      href={`?gameId=${game.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectGame(game);
                      }}
                      className="flex items-start gap-2 text-text-muted hover:text-text-main transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <ArrowRight size={16} className="mt-1 text-primary-hover opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-medium text-sm md:text-base leading-tight">
                        {game.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapView;