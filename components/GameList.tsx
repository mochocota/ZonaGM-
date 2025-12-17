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

// Optimize ListCard: Removed complex hover effects on image container for mobile perf
const ListCard = React.memo<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void; priority: boolean }>(({ game, onClick, onSelectConsole, priority }) => (
  <article 
    onClick={onClick}
    className="group flex flex-col md:flex-row gap-6 rounded-3xl bg-surface p-5 shadow-soft border border-transparent transition-colors duration-200 cursor-pointer content-visibility-auto contain-content"
  >
    <div className="shrink-0 mx-auto md:mx-0">
      <div className="h-[240px] w-[180px] md:h-[220px] md:w-[160px] rounded-2xl bg-gray-200 overflow-hidden relative shadow-inner">
        <img 
            src={game.imageUrl} 
            alt={game.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            width="160"
            height="220"
            decoding="async"
            className="w-full h-full object-cover transform-gpu"
        />
        {/* Removed gradient overlay on list view for cleaner paint */}
      </div>
    </div>
    
    <div className="flex flex-1 flex-col justify-between py-1 text-center md:text-left">
      <div>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onSelectConsole(game.console);
            }}
            className="bg-background border border-border-color text-text-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          >
            {game.console}
          </button>
          <span className="text-xs text-text-muted font-medium">• {game.size}</span>
          <span className="text-xs text-text-muted font-medium">• {game.format}</span>
          <span className="text-xs text-text-muted font-medium">• {game.year}</span>
          <span className="text-xs text-text-muted font-medium opacity-50 px-1">|</span>
          <LanguageFlags languages={game.languages} />
        </div>
        
        <h3 className="text-2xl font-bold text-text-main mb-3">
          {game.title}
        </h3>
        
        <p className="text-text-muted text-sm leading-relaxed line-clamp-3 max-w-3xl mx-auto md:mx-0">
          {game.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center md:justify-end gap-4 md:gap-6 text-sm font-medium text-text-muted">
         <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border-color">
            <Download size={16} />
            <span>{formatNumber(game.downloads)}</span>
         </div>
         <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border-color">
            <Star size={16} className="fill-primary text-primary" />
            <span>{game.rating}</span>
         </div>
         <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border-color">
            <MessageSquare size={16} />
            <span>{game.comments?.length || 0}</span>
         </div>
      </div>
    </div>
  </article>
));

// Optimize GridCard: Removed backdrop-blur, added GPU transform, simplified layers
const GridCard = React.memo<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void; priority: boolean }>(({ game, onClick, onSelectConsole, priority }) => (
  <article 
    onClick={onClick}
    className="group flex flex-col bg-surface rounded-3xl border border-border-color overflow-hidden h-full cursor-pointer content-visibility-auto contain-content scroll-gpu"
  >
    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
      <img 
        src={game.imageUrl} 
        alt={game.title} 
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        width="300" 
        height="400"
        decoding="async"
        className="w-full h-full object-cover transform-gpu transition-transform duration-500 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
      
      {/* Replaced backdrop-blur with simple semi-transparent bg for high performance */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onSelectConsole(game.console);
        }}
        className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10"
      >
        {game.console}
      </button>
      
      <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-lg border border-white/10">
        <LanguageFlags languages={game.languages} />
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-white/90">
         <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md">
                <Download size={12} /> {formatNumber(game.downloads)}
            </div>
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md">
                <Star size={12} className="fill-primary text-primary" /> {game.rating}
            </div>
         </div>
      </div>
    </div>
    
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-base md:text-lg font-bold text-text-main leading-snug line-clamp-2 mb-2" title={game.title}>
        {game.title}
      </h3>
      
      <div className="flex items-center gap-2 text-xs text-text-muted mb-3 font-medium">
        <span className="truncate max-w-[100px]">{game.publisher}</span>
        <span className="opacity-50">•</span>
        <span>{game.year}</span>
        <span className="opacity-50">•</span>
        <span>{game.size}</span>
      </div>
    </div>
  </article>
));

const GameList: React.FC<GameListProps> = ({ games, viewMode, onSelectGame, onSelectConsole }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted font-medium">No artifacts found in the archives.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8' : 'flex flex-col gap-6'}`}>
      {games.map((game, index) => {
        // Priority only for the very first image to avoid clogging bandwidth
        const isPriority = index === 0;

        return viewMode === 'list' ? (
          <ListCard 
            key={game.id} 
            game={game} 
            onClick={() => onSelectGame(game)} 
            onSelectConsole={onSelectConsole}
            priority={isPriority}
          />
        ) : (
          <GridCard 
            key={game.id} 
            game={game} 
            onClick={() => onSelectGame(game)} 
            onSelectConsole={onSelectConsole}
            priority={isPriority}
          />
        );
      })}
    </div>
  );
};

export default React.memo(GameList);