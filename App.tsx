
import React, { useState, useMemo, useEffect, Suspense, useCallback, useLayoutEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GameList from './components/GameList';
import Footer from './components/Footer';
import SEO from './components/SEO';
import AdBlockDetector from './components/AdBlockDetector';
import { SortOption, Game, Report } from './types';
import { LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useToast } from './components/Toast';

const GameDetail = React.lazy(() => import('./components/GameDetail'));
const GameForm = React.lazy(() => import('./components/GameForm'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const LoginModal = React.lazy(() => import('./components/LoginModal'));
const SitemapView = React.lazy(() => import('./components/SitemapView'));
const HelpView = React.lazy(() => import('./components/HelpView'));

const ITEMS_PER_PAGE = 20;

const DEFAULT_HELP_CONTENT = {
  shortenerExplanation: "Mantener todos estos juegos guardados y listos para descargar tiene un costo mensual de servidores. En lugar de cobrarte por entrar o llenar el sitio de anuncios molestos que saltan por todos lados, usamos estos enlaces. Al esperar esos pocos segundos, nos ayudas a pagar los gastos del sitio para que ZonaGM siga existiendo y sea gratis para todos. ¡Gracias por ayudarnos a seguir en línea!",
  faqs: [
    { q: "¿Cómo se descargan los juegos?", a: "Busca el título que desees, entra en sus detalles y haz clic en el botón amarillo \"Descargar\". Se abrirá una ventana con un contador de 5 segundos por seguridad; una vez termine, pulsa \"Ir al Servidor\" para acceder al enlace final en el servidor de almacenamiento." },
    { q: "¿Qué necesito para ejecutar los juegos (ISOs/ROMs)?", a: "Necesitas un emulador correspondiente a la consola del juego (por ejemplo, Dolphin para GameCube o PCSX2 para PS2). En la ficha de cada juego, debajo de la información técnica, encontrarás botones naranjas que te llevan directamente a la descarga de los emuladores oficiales recomendados." },
    { q: "¿Cuál es la contraseña de los archivos comprimidos?", a: "La gran mayoría de nuestros archivos están libres de contraseña para facilitar el acceso. En caso de que un archivo comprimido (.zip, .rar o .7z) te solicite una y no esté especificada en la descripción, prueba siempre con: zonagm." },
    { q: "¿Qué debo hacer si un enlace no funciona?", a: "Si encuentras un link caído, utiliza el botón \"Reportar Problema\" que aparece justo debajo del botón de descarga. Selecciona el motivo \"Link Caído\" y envíalo; esto notificará inmediatamente a los administradores para que resubamos el archivo en tiempo récord." },
    { q: "¿Cómo puedo filtrar los juegos por consola?", a: "En la parte superior de la página (cabecera), haz clic en el menú \"Consolas\". Se desplegará una lista con todos los sistemas disponibles (PS2, GameCube, PSP, etc.). Al seleccionar uno, el sitio te mostrará exclusivamente el catálogo de esa plataforma para facilitar tu búsqueda." }
  ]
};

const App: React.FC = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]); 
  const [reports, setReports] = useState<Report[]>([]);
  const [helpContent, setHelpContent] = useState(DEFAULT_HELP_CONTENT);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Alphabetically');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const scrollPositionRef = useRef<number>(0);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const selectedGame = useMemo(() => 
    games.find(g => g.id === selectedGameId) || null
  , [games, selectedGameId]);

  // Si el usuario escribe en el buscador, cerramos cualquier vista abierta para mostrar los resultados
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setSelectedGameId(null);
      setIsHelpOpen(false);
      setIsSitemapOpen(false);
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Manejo del historial para el botón atrás del navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      setSelectedGameId(state?.gameId || null);
      setIsHelpOpen(state?.view === 'help');
      setIsSitemapOpen(state?.view === 'sitemap');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const unsubHelp = onSnapshot(doc(db, 'settings', 'help'), (snapshot) => {
        if (snapshot.exists()) {
            setHelpContent(snapshot.data() as any);
        } else {
            setDoc(doc(db, 'settings', 'help'), DEFAULT_HELP_CONTENT).catch(e => console.warn("Init help failed:", e));
        }
    });
    return () => { unsubGames(); unsubReports(); unsubHelp(); };
  }, []);

  const handleOpenHelp = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
    setIsHelpOpen(true);
    setIsSitemapOpen(false);
    setSelectedGameId(null);
    setIsSearchOpen(false);
    setSearchTerm('');
    window.history.pushState({ view: 'help' }, '');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleHome = useCallback(() => {
    scrollPositionRef.current = 0;
    setSelectedGameId(null);
    setIsSitemapOpen(false);
    setIsHelpOpen(false);
    setIsSearchOpen(false);
    setSearchTerm('');
    setSelectedConsole(null);
    setCurrentPage(1);
    // Push home state if not already there to allow "back" to list
    if (window.history.state) {
        window.history.pushState(null, '');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const handleSaveHelp = async (newContent: typeof DEFAULT_HELP_CONTENT) => {
    try {
        const cleanContent = JSON.parse(JSON.stringify(newContent));
        await setDoc(doc(db, 'settings', 'help'), cleanContent);
        toast.success("Ayuda Actualizada", "Los cambios se han guardado correctamente.");
    } catch (e: any) {
        console.error("Save Help Error:", e);
        toast.error("Error de Permisos", "Verifica las reglas de seguridad en tu consola de Firebase.");
    }
  };

  const handleSelectGameById = useCallback((gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      scrollPositionRef.current = window.scrollY;
      setSelectedGameId(game.id);
      setIsSitemapOpen(false);
      setIsHelpOpen(false);
      setSearchTerm('');
      setIsSearchOpen(false);
      
      // Update history
      if (window.history.state?.gameId !== game.id) {
          window.history.pushState({ gameId: game.id }, '');
      }
      
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [games]);

  const handleOpenSitemap = useCallback(() => {
    setIsSitemapOpen(true);
    setIsHelpOpen(false);
    setSelectedGameId(null);
    window.history.pushState({ view: 'sitemap' }, '');
    window.scrollTo(0, 0);
  }, []);

  const filteredGames = useMemo(() => {
    let result = [...games];
    if (searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(game => game.title.toLowerCase().includes(lowerTerm));
    } else if (selectedConsole) {
        result = result.filter(g => g.console === selectedConsole);
    }
    if (sortBy === 'Popularity') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortBy === 'Date') result.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
    else if (sortBy === 'Alphabetically') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [games, searchTerm, sortBy, selectedConsole]);

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const currentGames = useMemo(() => 
    filteredGames.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
  [filteredGames, currentPage]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-text-main">
      <AdBlockDetector />
      <SEO title="ZonaGM | ROMs e ISOs Verificadas" description="El mejor archivo de juegos clásicos." />

      <Header 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}
        onAddGame={() => { setEditingGame(null); setIsFormOpen(true); }} 
        onHome={handleHome} onOpenHelp={handleOpenHelp}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        pendingReportsCount={reports.filter(r => r.status === 'Pending').length}
        isLoggedIn={isLoggedIn} onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => signOut(auth)} consoles={useMemo(() => Array.from(new Set(games.map(g => g.console))).sort(), [games])}
        selectedConsole={selectedConsole} 
        onSelectConsole={(c) => { 
          setSelectedConsole(c); 
          setCurrentPage(1); 
          setSelectedGameId(null); 
          setIsHelpOpen(false); 
          setIsSitemapOpen(false);
          setSearchTerm('');
          // Push console filter to history? Usually menu clicks are cleaner without pushState
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode} toggleTheme={() => {
            const next = !isDarkMode;
            setIsDarkMode(next);
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', next ? 'dark' : 'light');
        }}
      />

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 w-full max-w-[1200px] mx-auto pb-16 min-h-[800px]">
        {isLoading ? (
            <div className="w-full grid-skeleton animate-pulse px-4 mt-20">
              {[...Array(8)].map((_, i) => <div key={i} className="card-stub" />)}
            </div>
        ) : selectedGame ? (
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
                <GameDetail 
                    game={selectedGame} allGames={games} onBack={() => { window.history.back(); }} 
                    onSelectGame={(g) => handleSelectGameById(g.id)} onSelectConsole={(c) => { setSelectedConsole(c); setCurrentPage(1); setSelectedGameId(null); setSearchTerm(''); }}
                    onHome={handleHome} onEdit={(g) => { setEditingGame(g); setIsFormOpen(true); }} 
                    onDelete={async (id) => { await deleteDoc(doc(db, 'games', id)); handleHome(); }} 
                    onReport={async (id, title, reason, desc) => {
                        await addDoc(collection(db, 'reports'), { gameId: id, gameTitle: title, reason, description: desc, date: new Date().toLocaleString(), status: 'Pending' });
                    }} 
                    isLoggedIn={isLoggedIn}
                />
            </Suspense>
        ) : isHelpOpen ? (
            <Suspense fallback={null}>
                <HelpView content={helpContent} />
            </Suspense>
        ) : isSitemapOpen ? (
            <Suspense fallback={null}>
                <SitemapView games={games} onSelectGame={(g) => handleSelectGameById(g.id)} />
            </Suspense>
        ) : (
            <div className="flex w-full flex-col gap-2">
                <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-color pb-4 mt-2 gap-4">
                  <h3 className="text-lg font-bold text-text-main">
                    {searchTerm.trim() ? `Buscando "${searchTerm}"` : (selectedConsole ? `${selectedConsole} - ` : '') + `${filteredGames.length} títulos`}
                  </h3>
                  <div className="flex items-center gap-4">
                    <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }} className="bg-transparent font-bold text-sm text-text-main focus:outline-none cursor-pointer">
                      <option value="Alphabetically">A-Z</option>
                      <option value="Date">Fecha</option>
                      <option value="Popularity">Popularidad</option>
                    </select>
                    <div className="flex items-center bg-surface border border-border-color rounded-lg p-1">
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-text-muted'}`}><ListIcon size={18} /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-text-muted'}`}><LayoutGrid size={18} /></button>
                    </div>
                  </div>
                </div>
                
                <div className="min-h-[600px] mt-6">
                    <GameList games={currentGames} viewMode={viewMode} onSelectGame={(g) => handleSelectGameById(g.id)} onSelectConsole={(c) => { setSelectedConsole(c); setCurrentPage(1); setSelectedGameId(null); setSearchTerm(''); }} />
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 py-12">
                        <button 
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 border ${currentPage === 1 ? 'opacity-30 cursor-not-allowed border-border-color' : 'bg-surface border-border-color hover:border-primary hover:text-primary shadow-sm hover:shadow-md active:scale-90'}`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-surface border border-border-color px-6 py-3 rounded-2xl shadow-sm">
                            <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Página</span>
                            <span className="text-lg font-black text-text-main">{currentPage}</span>
                            <span className="text-sm font-bold text-text-muted">/</span>
                            <span className="text-sm font-bold text-text-muted">{totalPages}</span>
                        </div>

                        <button 
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 border ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed border-border-color' : 'bg-surface border-border-color hover:border-primary hover:text-primary shadow-sm hover:shadow-md active:scale-90'}`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>

      <Footer onOpenSitemap={handleOpenSitemap} />

      <Suspense fallback={null}>
          {isFormOpen && (
              <GameForm 
                  isOpen={isFormOpen} 
                  onClose={() => { setIsFormOpen(false); setEditingGame(null); }} 
                  onSubmit={async (gameData) => {
                      try {
                          if (editingGame) {
                              const { id, ...data } = gameData;
                              await updateDoc(doc(db, 'games', editingGame.id), data);
                          } else {
                              const { id, ...data } = gameData;
                              await addDoc(collection(db, 'games'), data);
                          }
                          setIsFormOpen(false);
                          setEditingGame(null);
                          return true;
                      } catch (e) { return false; }
                  }}
                  initialData={editingGame}
              />
          )}
          {isAdminPanelOpen && (
            <AdminPanel 
              isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} 
              reports={reports} helpContent={helpContent} onSaveHelp={handleSaveHelp}
              onResolve={async (id) => await updateDoc(doc(db, 'reports', id), { status: 'Resolved' })}
              onDelete={async (id) => await deleteDoc(doc(db, 'reports', id))}
              onNavigateToGame={handleSelectGameById} 
            />
          )}
          {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={() => {}} />}
      </Suspense>
    </div>
  );
};

export default App;
