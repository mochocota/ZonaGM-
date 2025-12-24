
import React from 'react';
import { Game, Comment } from '../types';
import { Download, Star, MessageSquare } from 'lucide-react';

interface GameListProps {
  games: Game[];
  viewMode: 'list' | 'grid';
  onSelectGame: (game: Game) => void;
  onSelectConsole: (console: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num?.toString() || '0';
};

const countTotalComments = (comments?: Comment[]): number => {
  if (!comments) return 0;
  let count = 0;
  const traverse = (list: Comment[]) => {
    for (const item of list) {
      count++;
      if (item.replies && item.replies.length > 0) {
        traverse(item.replies);
      }
    }
  };
  traverse(comments);
  return count;
};

const LanguageFlags = ({ languages }: { languages: Game['languages'] }) => {
  if (!languages || languages.length === 0) return null;
  
  const getFlag = (lang: string) => {
    switch (lang) {
      case 'English': return '🇺🇸';
      case 'Spanish': return '🇪🇸';
      case 'Japanese': return '🇯🇵';
      case 'Multi': return '🌐';
      default: return '🌐';
    }
  };

  return (
    <div className="flex gap-1.5 items-center justify-center">
      {languages.map(lang => (
        <span key={lang} className="text-[17px] leading-none drop-shadow-sm" title={lang}>
          {getFlag(lang)}
        </span>
      ))}
    </div>
  );
};

const GridCard = React.memo<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void; isLCP: boolean }>(({ game, onClick, onSelectConsole, isLCP }) => {
  const commentCount = countTotalComments(game.comments);
  
  return (
    <article 
      onClick={onClick}
      className="group flex flex-col bg-surface rounded-3xl border border-border-color overflow-hidden h-full cursor-pointer transition-all hover:shadow-hover"
    >
      <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          loading={isLCP ? "eager" : "lazy"}
          fetchPriority={isLCP ? "high" : "auto"}
          width="300" 
          height="400"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
        
        {/* Console Tag Top Left */}
        <button 
          onClick={(e) => { e.stopPropagation(); onSelectConsole(game.console); }}
          className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10"
        >
          {game.console}
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {/* Language Flags: Centered below image */}
        <div className="mb-3">
          <LanguageFlags languages={game.languages} />
        </div>

        <h3 className="text-base font-bold text-text-main text-center leading-snug line-clamp-2 mb-3 group-hover:text-primary-hover transition-colors">{game.title}</h3>
        
        {/* Information Footer: Downloads, Rating, Comments */}
        <div className="flex items-center justify-center text-[11px] text-text-muted mt-auto font-medium border-t border-border-color/30 pt-3">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1" title="Descargas">
                  <Download size={11} className="text-black dark:text-primary" /> 
                  <span className="opacity-80 leading-none">{formatNumber(game.downloads)}</span>
              </div>
              <div className="flex items-center gap-1" title="Calificación">
                  <Star size={11} className="fill-black text-black dark:fill-primary dark:text-primary" /> 
                  <span className="opacity-80 leading-none">{game.rating || '0.0'}</span>
              </div>
              <div className="flex items-center gap-1" title="Comentarios">
                  <MessageSquare size={11} className="text-text-muted" /> 
                  <span className="opacity-80 leading-none">{commentCount}</span>
              </div>
          </div>
        </div>
      </div>
    </article>
  );
});

const ListCard = React.memo<{ game: Game; onClick: () => void; onSelectConsole: (c: string) => void; isLCP: boolean }>(({ game, onClick, onSelectConsole, isLCP }) => {
  const commentCount = countTotalComments(game.comments);

  return (
    <article 
      onClick={onClick}
      className="group flex flex-col md:flex-row gap-6 rounded-3xl bg-surface p-4 shadow-soft border border-transparent hover:border-primary/20 transition-all cursor-pointer"
    >
      <div className="shrink-0 flex flex-col items-center gap-3">
        <div className="w-full md:w-[160px] aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-zinc-800 overflow-hidden relative shadow-inner">
          <img 
              src={game.imageUrl} 
              alt={game.title}
              loading={isLCP ? "eager" : "lazy"}
              fetchPriority={isLCP ? "high" : "auto"}
              width="160"
              height="220"
              decoding="async"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        {/* Flags below list image */}
        <LanguageFlags languages={game.languages} />
      </div>
      
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onSelectConsole(game.console); }}
              className="bg-background border border-border-color text-text-muted px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
            >
              {game.console}
            </button>
            <span className="text-xs text-text-muted font-medium">• {game.size || 'N/A'}</span>
            <span className="text-xs text-text-muted font-medium">• {game.year}</span>
          </div>
          <h3 className="text-2xl font-bold text-text-main mb-2 group-hover:text-primary-hover transition-colors">{game.title}</h3>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-2 max-w-2xl">{game.description}</p>
        </div>
        
        {/* Information Row: Downloads, Rating, Comments */}
        <div className="mt-4 flex items-center gap-4">
           <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border-color text-xs font-bold text-text-muted">
              <Download size={13} className="text-black dark:text-primary" /> 
              <span className="leading-none">{formatNumber(game.downloads)}</span>
           </div>
           <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border-color text-xs font-bold text-text-muted">
              <Star size={13} className="fill-black text-black dark:fill-primary dark:text-primary" /> 
              <span className="leading-none">{game.rating || '0.0'}</span>
           </div>
           <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border-color text-xs font-bold text-text-muted">
              <MessageSquare size={13} className="text-text-muted" /> 
              <span className="leading-none">{commentCount}</span>
           </div>
        </div>
      </div>
    </article>
  );
});

const GameList: React.FC<GameListProps> = ({ games, viewMode, onSelectGame, onSelectConsole }) => {
  if (games.length === 0) return null;

  return (
    <div className={`w-full ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8' : 'flex flex-col gap-6'}`}>
      {games.map((game, index) => {
        const isLCP = index === 0;
        return viewMode === 'list' ? (
          <ListCard key={game.id} game={game} onClick={() => onSelectGame(game)} onSelectConsole={onSelectConsole} isLCP={isLCP} />
        ) : (
          <GridCard key={game.id} game={game} onClick={() => onSelectGame(game)} onSelectConsole={onSelectConsole} isLCP={isLCP} />
        );
      })}
    </div>
  );
};

export default React.memo(GameList);
