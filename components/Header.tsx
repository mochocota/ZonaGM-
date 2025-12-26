
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, PlusCircle, ShieldAlert, LogOut, ChevronDown, Moon, Sun, User, HelpCircle, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  onAddGame: () => void;
  onHome: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  pendingReportsCount: number;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  consoles: string[];
  selectedConsole: string | null;
  onSelectConsole: (console: string | null) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    searchTerm, 
    setSearchTerm, 
    isSearchOpen,
    setIsSearchOpen,
    onAddGame, 
    onHome, 
    onOpenHelp,
    onOpenAdmin, 
    pendingReportsCount,
    isLoggedIn,
    onOpenLogin,
    onLogout,
    consoles,
    selectedConsole,
    onSelectConsole,
    isDarkMode,
    toggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Console Dropdown State
  const [isConsoleMenuOpen, setIsConsoleMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsConsoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleSelectConsoleAndClose = (c: string | null) => {
      onSelectConsole(c);
      setIsConsoleMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
  };

  return (
    <header className="relative z-50 w-full bg-background border-b border-border-color transition-all">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-2 flex items-center justify-between h-16 md:h-20">
        {/* Logo de Texto Actualizado con Icono Moderno */}
        <div 
          className="flex items-center cursor-pointer group shrink-0" 
          onClick={() => { onSelectConsole(null); onHome(); setIsSearchOpen(false); }}
        >
          <span className="text-2xl font-black text-text-main tracking-tighter transition-all group-hover:scale-105 flex items-center gap-2">
            <Gamepad2 className="text-primary w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
            <span>Zona<span className="text-primary">GM</span></span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => { onSelectConsole(null); onHome(); setIsSearchOpen(false); }} 
            className={`text-sm font-medium transition-colors ${!selectedConsole ? 'text-primary-hover font-bold' : 'text-text-main hover:text-text-muted'}`}
          >
            Home
          </button>
          
          {/* Desktop Consoles Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsConsoleMenuOpen(!isConsoleMenuOpen)}
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${selectedConsole ? 'text-primary-hover font-bold' : 'text-text-main hover:text-text-muted'}`}
            >
                Consolas <ChevronDown size={14} className={`transition-transform duration-200 ${isConsoleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isConsoleMenuOpen && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-surface border border-border-color rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <button 
                        onClick={() => handleSelectConsoleAndClose(null)}
                        className="w-full text-left px-5 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-text-muted hover:text-text-main font-medium border-b border-border-color/50 mb-1"
                    >
                        Ver Todas
                    </button>
                    {consoles.map(c => (
                        <button 
                            key={c}
                            onClick={() => handleSelectConsoleAndClose(c)}
                            className={`w-full text-left px-5 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between ${selectedConsole === c ? 'text-primary-hover font-bold bg-primary/5' : 'text-text-main'}`}
                        >
                            {c}
                            {selectedConsole === c && <div className="w-1.5 h-1.5 rounded-full bg-primary-hover" />}
                        </button>
                    ))}
                </div>
            )}
          </div>

          <button 
            onClick={onOpenHelp} 
            className="text-sm font-medium text-text-main hover:text-text-muted transition-colors flex items-center gap-1"
          >
            <HelpCircle size={16} /> Ayuda
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
            
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-text-main hover:bg-surface hover:shadow-sm transition-colors"
                aria-label="Toggle Dark Mode"
            >
                {isDarkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
            </button>
            
            {isLoggedIn ? (
                <>
                    {/* Admin Button */}
                    <button
                        onClick={onOpenAdmin}
                        className="relative p-2 rounded-full text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Panel de Administración"
                    >
                        <ShieldAlert size={18} className="md:w-5 md:h-5" />
                        {pendingReportsCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
                        )}
                    </button>

                    {/* Add Button - Icon only on mobile */}
                    <button 
                        onClick={onAddGame}
                        className="flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-full bg-text-main text-surface hover:bg-text-muted transition-all text-sm font-bold shadow-sm"
                    >
                        <PlusCircle size={16} />
                        <span className="hidden md:inline">Add Post</span>
                    </button>
                </>
            ) : null}

            {/* Desktop Search */}
            <button 
              onClick={toggleSearch}
              className={`p-2 rounded-full transition-colors hidden md:flex ${isSearchOpen ? 'bg-primary text-black' : 'text-text-main hover:bg-surface hover:shadow-sm'}`}
              aria-label="Toggle Search"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>

            {/* Auth Button Desktop */}
            <div className="hidden md:block ml-2 pl-2 border-l border-border-color">
                {isLoggedIn ? (
                    <button onClick={onLogout} className="text-xs font-bold text-text-muted hover:text-red-500 flex items-center gap-1">
                        <LogOut size={14} /> Salir
                    </button>
                ) : (
                    <button onClick={onOpenLogin} className="text-xs font-bold text-primary-hover hover:text-text-main flex items-center gap-1 bg-surface border border-border-color px-3 py-1.5 rounded-full">
                        <User size={14} /> Login
                    </button>
                )}
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-0.5 md:hidden">
              {/* Mobile Auth Button */}
              <button 
                  onClick={isLoggedIn ? onLogout : onOpenLogin}
                  className="p-2 rounded-full text-text-main hover:bg-gray-100/50 transition-colors"
                  aria-label={isLoggedIn ? "Logout" : "Login"}
              >
                  {isLoggedIn ? <LogOut size={18} /> : <User size={18} />}
              </button>

              <button 
                onClick={toggleSearch}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-primary text-black' : 'text-text-main hover:bg-gray-100/50'}`}
                aria-label="Toggle Search"
              >
                <Search size={18} />
              </button>
              <button 
                className={`p-2 rounded-full transition-colors ${isMobileMenuOpen ? 'bg-gray-100 dark:bg-zinc-800' : 'text-text-main hover:bg-gray-100/50'}`}
                onClick={toggleMenu}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="w-full bg-surface border-b border-border-color p-4 animate-in slide-in-from-top-2 fade-in duration-200 absolute top-full left-0 shadow-lg z-40">
            <div className="max-w-[800px] mx-auto relative flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input 
                        type="text"
                        placeholder="Search archives..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border-color rounded-full py-3 pl-12 pr-6 text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                        autoFocus
                    />
                </div>
                <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-text-muted hover:text-text-main transition-colors"
                    aria-label="Close search"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
      )}

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border-color shadow-lg p-6 flex flex-col gap-6 animate-in slide-in-from-top-2 z-40 max-h-[85vh] overflow-y-auto">
          <button 
            onClick={() => {
                onSelectConsole(null);
                onHome();
                setIsMobileMenuOpen(false);
                setIsSearchOpen(false);
            }} 
            className={`text-lg font-medium text-left ${!selectedConsole ? 'text-primary-hover font-bold' : 'text-text-main'}`}
          >
            Home
          </button>
          
          <button 
            onClick={() => {
                onOpenHelp();
                setIsMobileMenuOpen(false);
            }} 
            className="text-lg font-medium text-text-main text-left flex items-center gap-2"
          >
            <HelpCircle size={20} /> Ayuda
          </button>
          
          {isLoggedIn && (
            <div className="flex flex-col gap-4 pb-4 border-b border-border-color">
                <button 
                    onClick={() => {
                        onOpenAdmin();
                        setIsMobileMenuOpen(false);
                    }} 
                    className="text-lg font-medium text-red-600 text-left flex items-center gap-2"
                >
                    <ShieldAlert size={20} />
                    Panel Admin ({pendingReportsCount})
                </button>
                <button 
                    onClick={() => {
                        onAddGame();
                        setIsMobileMenuOpen(false);
                    }} 
                    className="text-lg font-bold text-primary-hover text-left"
                >
                    + Add New Post
                </button>
            </div>
          )}

          {/* Mobile Consoles List */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                Filtrar por Consola
            </h3>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => handleSelectConsoleAndClose(null)}
                    className={`text-sm px-3 py-2.5 rounded-xl border text-center transition-all ${!selectedConsole ? 'bg-primary border-primary text-black font-bold shadow-sm' : 'bg-surface border-border-color text-text-muted'}`}
                >
                    Todas
                </button>
                {consoles.map(c => (
                    <button 
                        key={c}
                        onClick={() => handleSelectConsoleAndClose(c)}
                        className={`text-sm px-3 py-2.5 rounded-xl border text-center transition-all ${selectedConsole === c ? 'bg-primary border-primary text-black font-bold shadow-sm' : 'bg-surface border-border-color text-text-muted'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
