
import React, { useState, useMemo, useEffect, Suspense, useCallback, useLayoutEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GameList from './components/GameList';
import Footer from './components/Footer';
import SEO from './components/SEO';
import AdBlockDetector from './components/AdBlockDetector';
import { SortOption, Game, Report } from './types';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useToast } from './components/Toast';

const GameDetail = React.lazy(() => import('./components/GameDetail'));
const GameForm = React.lazy(() => import('./components/GameForm'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const LoginModal = React.lazy(() => import('./components/LoginModal'));
const SitemapView = React.lazy(() => import('./components/SitemapView'));

const ITEMS_PER_PAGE = 20;

const slugify = (text: string) => {
  return text.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const SkeletonGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 w-full mt-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-color rounded-3xl overflow-hidden flex flex-col aspect-[3/4.8]">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 animate-pulse" />
                <div className="p-4 space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);

const App: React.FC = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]); 
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('Alphabetically');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const qGames = query(collection(db, 'games'), orderBy('title')); 
    const unsubGames = onSnapshot(qGames, (snapshot) => {
        const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Game[];
        setGames(gamesData);
        setIsLoading(false);
    });
    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[]);
    });
    return () => { unsubGames(); unsubReports(); };
  }, []);

  useEffect(() => {
    if (isLoading || games.length === 0) return; 
    
    const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const gameSlug = params.get('game');
        const view = params.get('view');
        
        if (gameSlug) {
            const found = games.find(g => slugify(g.title) === gameSlug);
            if (found) setSelectedGame(found);
        } else if (view === 'sitemap') {
            setIsSitemapOpen(true);
        } else {
            setSelectedGame(null);
            setIsSitemapOpen(false);
        }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [games.length, isLoading]); 

  const filteredGames = useMemo(() => {
    let result = [...games];
    if (selectedConsole) result = result.filter(g => g.console === selectedConsole);
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(game => game.title.toLowerCase().includes(lowerTerm));
    }
    if (sortBy === 'Popularity') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortBy === 'Date') result.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
    else if (sortBy === 'Alphabetically') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [games, searchTerm, sortBy, selectedConsole]);

  const currentGames = useMemo(() => 
    filteredGames.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
  [filteredGames, currentPage]);

  const handleSelectGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setIsSitemapOpen(false);
    window.scrollTo({ top: 0 });
    window.history.pushState({ gameId: game.id }, '', `?game=${slugify(game.title)}`);
  }, []);

  const handleHome = useCallback(() => {
    setSelectedGame(null);
    setIsSitemapOpen(false);
    setSearchTerm('');
    setSelectedConsole(null);
    window.history.pushState({}, '', '/');
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-text-main">
      <AdBlockDetector />
      <SEO title="ZonaGM | ROMs e ISOs Verificadas" description="El mejor archivo de juegos clásicos." />

      <Header 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        onAddGame={() => setIsFormOpen(true)} onHome={handleHome}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        pendingReportsCount={reports.filter(r => r.status === 'Pending').length}
        isLoggedIn={isLoggedIn} onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => signOut(auth)} consoles={useMemo(() => Array.from(new Set(games.map(g => g.console))).sort(), [games.length])}
        selectedConsole={selectedConsole} onSelectConsole={setSelectedConsole}
        isDarkMode={isDarkMode} toggleTheme={() => {
            const next = !isDarkMode;
            setIsDarkMode(next);
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', next ? 'dark' : 'light');
        }}
      />

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 w-full max-w-[1200px] mx-auto pb-16 min-h-[600px]">
        {selectedGame ? (
            <Suspense fallback={<div className="py-20 animate-pulse text-text-muted">Cargando detalles...</div>}>
                <GameDetail 
                    game={selectedGame} allGames={games} onBack={() => setSelectedGame(null)} 
                    onSelectGame={handleSelectGame} onSelectConsole={setSelectedConsole}
                    onHome={handleHome} onEdit={setEditingGame} onDelete={() => {}} 
                    onReport={() => {}} isLoggedIn={isLoggedIn}
                />
            </Suspense>
        ) : isSitemapOpen ? (
            <Suspense fallback={<SkeletonGrid />}>
                <SitemapView games={games} onSelectGame={handleSelectGame} />
            </Suspense>
        ) : (
            <div className="flex w-full max-w-[1000px] flex-col gap-2">
                <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-color pb-4 mt-2 gap-4 min-h-[48px]">
                  <h3 className="text-lg font-bold text-text-main">
                      {selectedConsole ? `${selectedConsole} - ` : ''} 
                      {isLoading ? 'Sincronizando...' : `${filteredGames.length} títulos`}
                  </h3>
                  <div className="flex items-center gap-4">
                    <select 
                      value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent font-bold text-sm text-text-main focus:outline-none cursor-pointer"
                    >
                      <option value="Alphabetically">A-Z</option>
                      <option value="Date">Fecha</option>
                      <option value="Popularity">Popularidad</option>
                    </select>
                    <div className="flex items-center bg-surface border border-border-color rounded-lg p-1 gap-1">
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-text-muted'}`}><ListIcon size={18} /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-text-muted'}`}><LayoutGrid size={18} /></button>
                    </div>
                  </div>
                </div>

                <div className="min-h-[800px]">
                    {isLoading ? <SkeletonGrid /> : (
                        <GameList games={currentGames} viewMode={viewMode} onSelectGame={handleSelectGame} onSelectConsole={setSelectedConsole} />
                    )}
                </div>

                {filteredGames.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-2 py-12">
                        {[...Array(Math.ceil(filteredGames.length / ITEMS_PER_PAGE))].map((_, i) => (
                            <button 
                                key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 300 }); }}
                                className={`w-9 h-9 rounded-full font-bold text-sm transition-colors ${currentPage === i + 1 ? 'bg-primary text-black' : 'text-text-muted hover:bg-surface border border-transparent hover:border-border-color'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>

      <Footer onOpenSitemap={() => setIsSitemapOpen(true)} />

      <Suspense fallback={null}>
          {isFormOpen && <GameForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={async () => true} initialData={editingGame} />}
          {isAdminPanelOpen && <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} reports={reports} onResolve={() => {}} onDelete={() => {}} onNavigateToGame={handleSelectGame} />}
          {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={() => {}} />}
      </Suspense>
    </div>
  );
};

export default App;
