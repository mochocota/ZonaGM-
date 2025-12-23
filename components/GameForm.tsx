import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { X, Save, Upload, Download, Search, Loader2, Gamepad2, Globe, AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { searchIGDB } from '../services/igdb';
import { useToast } from './Toast';

interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (game: Game) => Promise<boolean>; // Return boolean for success/fail
  initialData?: Game | null;
}

const emptyGame: Omit<Game, 'id'> = {
  title: '',
  console: 'GameCube',
  year: '',
  size: '',
  format: 'ISO',
  description: '',
  publisher: '',
  imageUrl: '',
  screenshots: [],
  downloadUrl: '',
  downloads: 0,
  rating: 0,
  voteCount: 0,
  languages: ['English'],
  comments: []
};

// Expanded list of popular consoles
const POPULAR_CONSOLES = [
  'PlayStation 5', 'PlayStation 4', 'Nintendo Switch', 'PC', 'Xbox Series X/S',
  'PlayStation 3', 'Xbox 360', 'Wii U', 'Wii', 'Nintendo 3DS',
  'PlayStation 2', 'GameCube', 'Xbox', 'Dreamcast', 'PSP',
  'PS Vita', 'Nintendo DS', 'Nintendo 64', 'SNES', 'GBA',
  'NES', 'Sega Genesis', 'Saturn', 'PS1'
];

const LANGUAGES = ['English', 'Spanish', 'Japanese', 'Multi'] as const;

const GameForm: React.FC<GameFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Game, 'id'>>({ ...emptyGame });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // IGDB Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData({ ...emptyGame });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.imageUrl) newErrors.imageUrl = 'Image URL is required';
    if (!formData.size) newErrors.size = 'Size is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
        // Scroll to error
        const firstErrorInput = document.querySelector('[aria-invalid="true"]');
        if (firstErrorInput) {
            firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorInput.classList.add('animate-pulse-slow');
            setTimeout(() => firstErrorInput.classList.remove('animate-pulse-slow'), 500);
        }
        return;
    }

    setIsSubmitting(true);
    const gameToSubmit: Game = {
      id: initialData?.id || Date.now().toString(),
      ...formData
    };

    const success = await onSubmit(gameToSubmit);
    setIsSubmitting(false);

    if (success) {
        onClose();
    }
    // If fail, we keep form open so user can retry or check error toast
  };

  const handleIGDBSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
        const results = await searchIGDB(searchQuery);
        setSearchResults(results);
    } catch (err) {
        console.error(err);
        toast.error("Error IGDB", "No se pudo conectar con la base de datos de juegos.");
    } finally {
        setIsSearching(false);
    }
  };

  const selectIGDBResult = (data: any) => {
    const isDisc = ['GameCube', 'PS2', 'Wii', 'Xbox', 'Xbox 360', 'PS1', 'Dreamcast'].includes(data.console);
    const suggestedFormat = isDisc ? 'ISO' : 'ROM';
    
    setFormData(prev => ({
        ...prev,
        title: data.title,
        description: data.description,
        year: data.year,
        imageUrl: data.imageUrl,
        screenshots: data.screenshots || [],
        publisher: data.publisher,
        console: data.console, // Use whatever string comes back, or user can change it
        rating: data.rating > 0 ? data.rating : prev.rating,
        voteCount: data.voteCount || 0, // Import vote count
        // Autofill size if empty to prevent validation block (IGDB doesn't provide file size)
        size: prev.size || 'TBD',
        format: prev.format || suggestedFormat
    }));
    
    // Clear errors if any
    setErrors({});

    // Close search and reset
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    toast.success("Datos Importados", "Información cargada desde IGDB.");
  };

  const toggleLanguage = (lang: typeof LANGUAGES[number]) => {
    setFormData(prev => {
      const current = prev.languages;
      if (current.includes(lang)) {
        return { ...prev, languages: current.filter(l => l !== lang) };
      } else {
        return { ...prev, languages: [...current, lang] };
      }
    });
  };

  const testLink = () => {
    if (formData.downloadUrl) {
        window.open(formData.downloadUrl, '_blank');
    } else {
        toast.warning("Sin URL", "Ingresa un enlace para probarlo.");
    }
  }

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose} // Click outside to close
    >
      <div 
        className="bg-background w-full max-w-2xl rounded-3xl shadow-2xl border border-border-color flex flex-col max-h-[90vh] relative overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        
        {/* Search Modal Overlay */}
        {isSearchOpen && (
             <div className="absolute inset-0 z-50 bg-background flex flex-col animate-slide-in-up">
                <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface">
                    <h3 className="text-xl font-bold text-text-main">Search IGDB</h3>
                    <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-muted">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleIGDBSearch} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type game name..."
                            className="flex-1 bg-surface border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            disabled={isSearching}
                            className="bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                        </button>
                    </form>

                    <div className="space-y-3">
                        {searchResults.length > 0 ? (
                            searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectIGDBResult(result)}
                                    className="w-full flex items-start gap-4 p-3 rounded-xl bg-surface border border-border-color hover:border-primary hover:shadow-md transition-all text-left group"
                                >
                                    <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        {result.imageUrl ? (
                                            <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-text-main group-hover:text-primary-hover transition-colors">{result.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                                            <span>{result.year}</span>
                                            <span>•</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-bold">{result.console}</span>
                                            <span>•</span>
                                            <span>{result.publisher}</span>
                                        </div>
                                        <p className="text-xs text-text-muted mt-2 line-clamp-2">{result.description}</p>
                                        {result.screenshots && result.screenshots.length > 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-primary-hover font-bold">
                                                <ImageIcon size={12} />
                                                <span>{result.screenshots.length} Screenshots available</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            !isSearching && searchQuery && <p className="text-center text-text-muted mt-10">No results found.</p>
                        )}
                        
                        {!isSearching && !searchQuery && searchResults.length === 0 && (
                            <div className="text-center text-text-muted mt-10 flex flex-col items-center gap-2">
                                <Search size={40} className="opacity-20" />
                                <p>Enter a game title to find metadata.</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        )}

        {/* Normal Form Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface rounded-t-3xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-text-main leading-none">
                {initialData ? 'Edit Entry' : 'New Entry'}
            </h2>
            <button 
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="text-xs font-bold text-primary-hover hover:underline flex items-center gap-1 mt-1"
            >
                <Globe size={12} />
                Import from IGDB
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-muted">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="game-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* IGDB Banner Button (Visible if no title is set) */}
            {!formData.title && (
                <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 text-text-main hover:bg-primary/20 transition-all flex flex-col items-center justify-center gap-2 group border-dashed"
                >
                    <div className="p-3 bg-primary rounded-full text-black group-hover:scale-110 transition-transform">
                        <Search size={20} />
                    </div>
                    <span className="font-bold">Auto-fill game data from IGDB</span>
                </button>
            )}
            
            {Object.keys(errors).length > 0 && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Please fill in all required fields marked in red.</span>
                </div>
            )}

            {/* Title */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full bg-surface border ${errors.title ? 'border-red-500' : 'border-border-color'} rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
                    placeholder="e.g. The Legend of Zelda"
                    aria-invalid={!!errors.title}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Console Tags */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Console</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CONSOLES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, console: c })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        formData.console === c
                          ? 'bg-primary border-primary text-black shadow-sm scale-105'
                          : 'bg-surface border-border-color text-text-muted hover:border-gray-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <input
                     type="text"
                     value={formData.console}
                     onChange={(e) => setFormData({...formData, console: e.target.value})}
                     placeholder="Other..."
                     className={`px-3 py-1.5 rounded-full text-xs font-bold border bg-surface border-border-color focus:outline-none focus:border-primary min-w-[80px] ${!POPULAR_CONSOLES.includes(formData.console) && formData.console ? 'border-primary text-text-main' : 'text-text-muted'}`}
                  />
                </div>
            </div>

            {/* Meta Data Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  className={`w-full bg-surface border ${errors.year ? 'border-red-500' : 'border-border-color'} rounded-xl px-4 py-2 focus:outline-none focus:border-primary`}
                  placeholder="2002"
                  aria-invalid={!!errors.year}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  className={`w-full bg-surface border ${errors.size ? 'border-red-500' : 'border-border-color'} rounded-xl px-4 py-2 focus:outline-none focus:border-primary`}
                  placeholder="1.4 GB"
                  aria-invalid={!!errors.size}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Format</label>
                <input
                  type="text"
                  value={formData.format}
                  onChange={e => setFormData({ ...formData, format: e.target.value })}
                  className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="ISO"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Publisher</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Nintendo"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-muted">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-surface border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary resize-none"
                placeholder="Game description..."
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-muted">Image URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={`w-full bg-surface border ${errors.imageUrl ? 'border-red-500' : 'border-border-color'} rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary`}
                    placeholder="https://..."
                    aria-invalid={!!errors.imageUrl}
                  />
                </div>
              </div>
              {formData.imageUrl && (
                 <div className="mt-2 h-40 w-full bg-gray-100 rounded-lg overflow-hidden border border-border-color relative">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover object-top opacity-100" onError={(e) => (e.currentTarget.style.display = 'none')} />
                 </div>
              )}
            </div>

            {/* Screenshots Info (Hidden field essentially, just info) */}
            {formData.screenshots && formData.screenshots.length > 0 && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span>{formData.screenshots.length} screenshots loaded from IGDB.</span>
                </div>
            )}

            {/* Download URL - Option 1: Shorteners support hint */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-muted">Download URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Download className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={formData.downloadUrl || ''}
                    onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
                    className="w-full bg-surface border border-border-color rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary"
                    placeholder="https://mega.nz/... o acortador (Adfly, Shink, etc)"
                  />
                </div>
                <button 
                    type="button" 
                    onClick={testLink}
                    className="bg-surface border border-border-color hover:bg-gray-50 text-text-muted px-4 rounded-xl flex items-center gap-2 transition-colors font-bold text-sm"
                    title="Probar Enlace"
                >
                    <ExternalLink size={16} />
                    Test
                </button>
              </div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider pl-1">
                <span className="text-primary-hover">Tip:</span> Puedes usar enlaces directos o acortadores para monetizar tus descargas.
              </p>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-muted block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.languages.includes(lang)
                        ? 'bg-primary border-primary text-black'
                        : 'bg-surface border-border-color text-text-muted hover:border-gray-400'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            
             {/* Stats (Initial values for edit or create) */}
             <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-color/50">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-text-muted">Downloads</label>
                    <input
                    type="number"
                    value={formData.downloads}
                    onChange={e => setFormData({ ...formData, downloads: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-text-muted">Rating (0-5)</label>
                    <input
                    type="number"
                    step="0.1"
                    max="5"
                    min="0"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-text-muted">Votes (Count)</label>
                    <input
                    type="number"
                    min="0"
                    value={formData.voteCount || 0}
                    onChange={e => setFormData({ ...formData, voteCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
             </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-color bg-surface rounded-b-3xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-text-muted hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="game-form"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Saving...' : 'Save Entry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameForm;