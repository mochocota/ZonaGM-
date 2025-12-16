import React from 'react';
import { Game } from '../types';
import { Download, Star, MessageSquare } from 'lucide-react';

interface GameListProps {
  games: Game[];
  viewMode: 'list' | 'grid';
  onSelectGame: (game: Game) => void;
  onSelectConsole: (console: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const LanguageFlags = ({ languages }: { languages: Game['languages'] }) => (
  <div className="flex items-center gap-1">
    {languages.map(lang => (
      <span key={lang} title={lang} className="cursor-help text-sm" role="img" aria-label={lang}>
        {lang === 'English' && '🇺🇸'}
        {lang === 'Spanish' && '🇪🇸'}
        {lang === 'Japanese' && '🇯🇵'}
        {lang === 'Multi' && '🌐'}
      </span>
    ))}
  </div>
);

const GameList: React.FC<GameListProps> = ({ games, viewMode, onSelectGame, onSelectConsole }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted font-medium">No artifacts found in the archives.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6' : 'flex flex-col gap-6'}`}>
      {games.map((game) => (
        viewMode === 'list' ? (
          <ListCard key={game.id} game={game} onClick={() => onSelectGame(game)} onSelectConsole={onSelectConsole} />
        ) : (
          <GridCard key={game.id} game={game} onClick={() => onSelectGame(game)} onSelectConsole={onSelectConsole} />
        )
      ))}
    </div>
  );
};

const ListCard: React.FC<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void }> = ({ game, onClick, onSelectConsole }) => (
  <article 
    onClick={onClick}
    className="group flex flex-col md:flex-row gap-6 rounded-3xl bg-surface p-4 shadow-soft hover:shadow-hover border border-transparent hover:border-primary/50 transition-all duration-300 cursor-pointer"
  >
    <div className="shrink-0">
      <div 
        className="h-[140px] w-full md:w-[140px] rounded-2xl bg-gray-200 bg-cover bg-center overflow-hidden relative"
        style={{ backgroundImage: `url('${game.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>
    </div>
    
    <div className="flex flex-1 flex-col justify-between py-1">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onSelectConsole(game.console);
            }}
            className="bg-background border border-border-color text-text-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide hover:border-primary hover:text-primary transition-colors hover:shadow-sm"
          >
            {game.console}
          </button>
          <span className="text-xs text-text-muted font-medium">• {game.size}</span>
          <span className="text-xs text-text-muted font-medium">• {game.format}</span>
          <span className="text-xs text-text-muted font-medium">• {game.year}</span>
          <span className="text-xs text-text-muted font-medium opacity-50 px-1">|</span>
          <LanguageFlags languages={game.languages} />
        </div>
        
        <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-text-muted transition-colors">
          {game.title}
        </h3>
        
        <p className="text-text-muted text-sm leading-relaxed line-clamp-2 max-w-3xl">
          {game.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-6 text-sm font-medium text-text-muted">
         <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border-color">
            <Download size={16} />
            <span>{formatNumber(game.downloads)}</span>
         </div>
         <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border-color">
            <Star size={16} className="fill-primary text-primary" />
            <span>{game.rating}</span>
         </div>
         <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border-color">
            <MessageSquare size={16} />
            <span>{game.comments?.length || 0}</span>
         </div>
      </div>
    </div>
  </article>
);

const GridCard: React.FC<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void }> = ({ game, onClick, onSelectConsole }) => (
  <article 
    onClick={onClick}
    className="group flex flex-col bg-surface rounded-2xl md:rounded-3xl border border-border-color hover:border-primary/60 hover:shadow-hover transition-all duration-300 overflow-hidden h-full cursor-pointer"
  >
    <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
      <img 
        src={game.imageUrl} 
        alt={game.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onSelectConsole(game.console);
        }}
        className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm border border-gray-100 text-text-main hover:bg-primary hover:text-text-main transition-colors"
      >
        {game.console}
      </button>
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg shadow-sm border border-gray-100">
        <LanguageFlags languages={game.languages} />
      </div>
    </div>
    
    <div className="p-3 md:p-5 flex flex-col flex-grow">
      <h3 className="text-sm md:text-lg font-bold text-text-main leading-tight line-clamp-2 md:line-clamp-1 mb-1 group-hover:text-text-muted transition-colors" title={game.title}>
        {game.title}
      </h3>
      
      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-text-muted mb-2 md:mb-3 font-medium">
        <span className="truncate max-w-[80px] md:max-w-[100px]">{game.publisher}</span>
        <span className="opacity-50">•</span>
        <span>{game.year}</span>
      </div>
      
      <p className="text-text-muted text-[10px] md:text-xs leading-relaxed line-clamp-2 md:line-clamp-3 mb-3 md:mb-5 font-sans flex-grow">
        {game.description}
      </p>
      
      {/* Stats Row */}
      <div className="mt-auto w-full pt-3 border-t border-border-color flex items-center justify-between text-[10px] md:text-xs font-bold text-text-muted group-hover:text-text-main transition-colors">
        <div className="flex items-center gap-1.5" title="Downloads">
          <Download size={14} className="md:w-4 md:h-4" />
          <span>{formatNumber(game.downloads)}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Rating">
          <Star size={14} className="md:w-4 md:h-4 fill-primary text-primary" />
          <span>{game.rating}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Comments">
          <MessageSquare size={14} className="md:w-4 md:h-4" />
          <span>{game.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  </article>
);

export default GameList;