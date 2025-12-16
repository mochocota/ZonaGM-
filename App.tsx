import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GameList from './components/GameList';
import GameDetail from './components/GameDetail';
import Footer from './components/Footer';
import GameForm from './components/GameForm';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import SEO from './components/SEO';
import SitemapView from './components/SitemapView';
import { SortOption, Game, Report } from './types';
import { LayoutGrid, List as ListIcon, ChevronDown, Loader2 } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

const ITEMS_PER_PAGE = 20;

const App: React.FC = () => {
  // Main Data State
  const [games, setGames] = useState<Game[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('Relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  // Navigation State
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Admin Panel State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Data Listeners
  useEffect(() => {
    // Listen to Games
    const gamesCollection = collection(db, 'games');
    const qGames = query(gamesCollection, orderBy('title')); // Default sort
    const unsubGames = onSnapshot(qGames, (snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
        const gamesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Game[];
        setGames(gamesData);
        
        // Update selected game if it exists to keep it in sync
        if (selectedGame) {
           const updatedSelected = gamesData.find(g => g.id === selectedGame.id);
           if (updatedSelected) setSelectedGame(updatedSelected);
        }
        setIsLoading(false);
    });

    // Listen to Reports
    const reportsCollection = collection(db, 'reports');
    const unsubReports = onSnapshot(reportsCollection, (snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
        const reportsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Report[];
        setReports(reportsData);
    });

    return () => {
        unsubGames();
        unsubReports();
    };
  }, [selectedGame]);

  const toggleTheme = () => {
      if (isDarkMode) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          setIsDarkMode(false);
      } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          setIsDarkMode(true);
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setIsAdminPanelOpen(false);
  };

  // Derive unique consoles for the menu
  const uniqueConsoles = useMemo(() => {
    const allConsoles = games.map(g => g.console);
    return Array.from(new Set(allConsoles)).sort();
  }, [games]);

  // Handle URL Params for SEO (Deep Linking)
  useEffect(() => {
    if (isLoading) return; // Wait for data load
    
    const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('gameId');
        const view = params.get('view');
        
        if (gameId) {
            const found = games.find(g => g.id === gameId);
            if (found) {
                setSelectedGame(found);
                setIsSitemapOpen(false);
            }
        } else if (view === 'sitemap') {
            setIsSitemapOpen(true);
            setSelectedGame(null);
        } else {
            setSelectedGame(null);
            setIsSitemapOpen(false);
        }
    };

    // Initial check
    handlePopState();

    // Listen for back/forward button
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [games, isLoading]);

  // Reset pagination when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, selectedConsole]);

  // Filter and Sort logic
  const filteredGames = useMemo(() => {
    let result = games;

    // 1. Filter by Console if selected
    if (selectedConsole) {
        result = result.filter(g => g.console === selectedConsole);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(game => 
            game.title.toLowerCase().includes(lowerTerm) ||
            game.console.toLowerCase().includes(lowerTerm)
        );
    }

    // 3. Sort
    if (sortBy === 'Popularity') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'Date') {
      result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }
    // Relevance is default (as is order in constants/array)

    return result;
  }, [games, searchTerm, sortBy, selectedConsole]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const currentGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        // Always show first, last, and pages around current
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
    }
    return pages;
  };

  // CRUD Handlers (Firestore)
  const handleAddGame = () => {
    setEditingGame(null);
    setIsFormOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (gameData: Game) => {
    try {
        if (editingGame) {
            // Update existing in Firestore
            const gameRef = doc(db, 'games', gameData.id);
            // We destructure to remove the 'id' field from the data payload, as doc ref holds ID
            const { id, ...dataToUpdate } = gameData;
            await updateDoc(gameRef, dataToUpdate);
            
            if (selectedGame && selectedGame.id === gameData.id) {
                setSelectedGame(gameData);
            }
        } else {
            // Create new in Firestore
            const { id, ...newGameData } = gameData; 
            // We ignore the passed ID for creation and let Firestore generate one, or use it if we really want custom IDs.
            // But usually addDoc generates one.
            await addDoc(collection(db, 'games'), newGameData);
        }
    } catch (error) {
        console.error("Error saving game:", error);
        alert("Failed to save game. Check console.");
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'games', id));
        if (selectedGame && selectedGame.id === id) {
            setSelectedGame(null);
            // Clean URL
            window.history.pushState({}, '', window.location.pathname);
        }
    } catch (error) {
        console.error("Error deleting game:", error);
        alert("Failed to delete game.");
    }
  };

  // Reports Logic (Firestore)
  const handleReportGame = async (gameId: string, title: string, reason: string, description: string) => {
    try {
        await addDoc(collection(db, 'reports'), {
            gameId,
            gameTitle: title,
            reason,
            description,
            date: new Date().toLocaleDateString('es-ES'),
            status: 'Pending'
        });
    } catch (error) {
        console.error("Error sending report:", error);
    }
  };

  const handleResolveReport = async (id: string) => {
      try {
          await updateDoc(doc(db, 'reports', id), { status: 'Resolved' });
      } catch (error) {
          console.error("Error resolving report:", error);
      }
  };

  const handleDeleteReport = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'reports', id));
      } catch (error) {
          console.error("Error deleting report:", error);
      }
  };

  // Search & Navigation
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      setSelectedGame(null); 
      setIsSitemapOpen(false);
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSelectConsole = (consoleName: string | null) => {
      setSelectedConsole(consoleName);
      setSearchTerm(''); // Clear search to show only this console's games
      setSelectedGame(null);
      setIsSitemapOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState({}, '', window.location.pathname);
  };

  const handleBack = () => {
    setSelectedGame(null);
    setIsSitemapOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleHome = () => {
    setSelectedGame(null);
    setIsSitemapOpen(false);
    setSearchTerm('');
    setSelectedConsole(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setIsSitemapOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL for SEO/Sharing
    const newUrl = `?gameId=${game.id}`;
    window.history.pushState({ gameId: game.id }, '', newUrl);
  };

  const handleOpenSitemap = () => {
    setIsSitemapOpen(true);
    setSelectedGame(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ sitemap: true }, '', '?view=sitemap');
  }

  const handleNavigateFromAdmin = (gameId: string) => {
      const game = games.find(g => g.id === gameId);
      if (game) {
          handleSelectGame(game);
      }
  };

  // Render Logic
  let content;
  
  if (isLoading) {
      content = (
          <div className="flex h-[50vh] w-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      );
  } else if (selectedGame) {
    content = (
        <div className="flex w-full justify-center pt-8">
            <GameDetail 
                game={selectedGame}
                allGames={games} 
                onBack={handleBack} 
                onSelectGame={handleSelectGame}
                onEdit={handleEditGame}
                onDelete={handleDeleteGame}
                onReport={handleReportGame}
                isLoggedIn={isLoggedIn}
            />
        </div>
    );
  } else if (isSitemapOpen) {
      content = (
          <SitemapView 
            games={games} 
            onSelectGame={handleSelectGame} 
          />
      );
  } else {
    content = (
        <div className="flex w-full max-w-[1000px] flex-col gap-2">
            
            <Hero searchTerm={searchTerm} setSearchTerm={handleSearch} />

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-color pb-4 mt-2 gap-4">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                {selectedConsole && (
                    <span className="bg-primary text-text-main px-3 py-1 rounded-full text-sm font-bold uppercase">
                        {selectedConsole}
                    </span>
                )}
                <span>
                    {searchTerm 
                        ? `${filteredGames.length} resultados para '${searchTerm}'` 
                        : (selectedConsole ? `${filteredGames.length} títulos disponibles` : 'Archivos Recientes')
                    }
                </span>
              </h3>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-sm text-text-muted relative group">
                  <span className="font-medium">Ordenar por:</span>
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-transparent pl-2 pr-6 font-bold text-text-main focus:outline-none cursor-pointer"
                    >
                      <option value="Relevance">Relevancia</option>
                      <option value="Date">Fecha</option>
                      <option value="Popularity">Popularidad</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-main" />
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-surface border border-border-color rounded-lg p-1 gap-1">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    aria-label="List View"
                  >
                    <ListIcon size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    aria-label="Grid View"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="mt-6">
              <GameList 
                games={currentGames} 
                viewMode={viewMode} 
                onSelectGame={handleSelectGame}
                onSelectConsole={handleSelectConsole}
              />
            </div>

            {/* Functional Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-12 mt-4">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex h-10 items-center justify-center rounded-full bg-surface border border-border-color px-6 text-sm font-medium transition-colors ${
                        currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed text-text-muted' 
                        : 'text-text-main hover:border-primary hover:text-primary hover:bg-surface'
                    }`}
                >
                    Anterior
                </button>
                
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                    {getPageNumbers().map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                currentPage === pageNum 
                                ? 'bg-primary text-text-main font-bold shadow-sm' 
                                : 'hover:bg-gray-200 cursor-pointer text-text-muted'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex h-10 items-center justify-center rounded-full bg-surface border border-border-color px-6 text-sm font-bold transition-colors ${
                        currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed text-text-muted font-medium' 
                        : 'text-text-main hover:border-primary hover:text-primary hover:bg-surface'
                    }`}
                >
                    Siguiente
                </button>
                </div>
            )}

          </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-sans bg-background text-text-main">
      
      {/* Default SEO for Home */}
      {!selectedGame && (
          <SEO 
            title="ZonaGM | Download Verified ROMs & ISOs"
            description="The best archive for verified game ROMs and ISOs. Download games for GameCube, PS2, SNES, GBA and more. Safe, fast, and organized."
            image="https://zonagm.com/og-image.jpg" // Placeholder
            url={window.location.href}
          />
      )}

      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={handleSearch} 
        onAddGame={handleAddGame}
        onHome={handleHome}
        onOpenAdmin={isLoggedIn ? () => setIsAdminPanelOpen(true) : () => setIsLoginModalOpen(true)}
        pendingReportsCount={reports.filter(r => r.status === 'Pending').length}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        consoles={uniqueConsoles}
        selectedConsole={selectedConsole}
        onSelectConsole={handleSelectConsole}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 w-full max-w-[1200px] mx-auto z-10 pb-16">
        {content}
      </main>

      <Footer onOpenSitemap={handleOpenSitemap} />

      {/* Modals */}
      <GameForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingGame}
      />

      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        reports={reports}
        onResolve={handleResolveReport}
        onDelete={handleDeleteReport}
        onNavigateToGame={handleNavigateFromAdmin}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(status) => {
            // This is now handled by onAuthStateChanged, but kept for compatibility with the component props
            if (status) setIsAdminPanelOpen(true);
        }}
      />

    </div>
  );
};

export default App;