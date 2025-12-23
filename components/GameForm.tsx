import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { X, Save, Upload, Download, Search, Loader2, Gamepad2, Globe, AlertCircle, Image as ImageIcon, ExternalLink, Sparkles, Link as LinkIcon, Wand2 } from 'lucide-react';
import { searchIGDB } from '../services/igdb';
import { fetchAndroidDownloadLink } from '../services/scraper';
import { useToast } from './Toast';

interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (game: Game) => Promise<boolean>; 
  initialData?: Game | null;
}

const emptyGame: Omit<Game, 'id'> = {
  title: '',
  console: 'Android',
  year: '',
  size: '',
  format: 'APK',
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

const POPULAR_CONSOLES = [
  'Android', 'PlayStation 5', 'Nintendo Switch', 'PC',
  'PlayStation 4', 'Xbox 360', 'Wii', 'PlayStation 2', 
  'GameCube', 'PSP', 'Nintendo DS', 'GBA', 'PS1'
];

const LANGUAGES = ['English', 'Spanish', 'Japanese', 'Multi'] as const;

const GameForm: React.FC<GameFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Game, 'id'>>({ ...emptyGame });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Scraper States
  const [sourceUrl, setSourceUrl] = useState('');
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [shortenerPrefix, setShortenerPrefix] = useState(localStorage.getItem('shortener_prefix') || '');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!formData.title) newErrors.title = 'El título es obligatorio';
    if (!formData.year) newErrors.year = 'El año es obligatorio';
    if (!formData.imageUrl) newErrors.imageUrl = 'La imagen es obligatoria';
    if (!formData.size) newErrors.size = 'El tamaño es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const gameToSubmit: Game = {
      id: initialData?.id || Date.now().toString(),
      ...formData
    };

    const success = await onSubmit(gameToSubmit);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleIGDBSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
        const results = await searchIGDB(searchQuery);
        setSearchResults(results);
    } catch (err) {
        toast.error("Error IGDB", "No se pudo conectar con la base de datos.");
    } finally {
        setIsSearching(false);
    }
  };

  const selectIGDBResult = (data: any) => {
    setFormData(prev => ({
        ...prev,
        ...data,
        size: prev.size || 'TBD',
    }));
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    toast.success("Datos Importados", "Información cargada desde IGDB.");
  };

  const handleAutoFetchLink = async () => {
    if (!sourceUrl.trim()) {
        toast.warning("URL vacía", "Pega un enlace de AN1.com para extraer el archivo.");
        return;
    }
    setIsFetchingLink(true);
    try {
        const directLink = await fetchAndroidDownloadLink(sourceUrl);
        if (directLink) {
            setFormData(prev => ({ ...prev, downloadUrl: directLink }));
            toast.success("Enlace Extraído", "Se ha obtenido el link directo del APK.");
        } else {
            toast.error("Error de Extracción", "No se pudo encontrar el enlace automático. Intenta manual.");
        }
    } catch (e) {
        toast.error("Error", "Ocurrió un error al procesar la URL.");
    } finally {
        setIsFetchingLink(false);
    }
  };

  const applyShortener = () => {
    if (!formData.downloadUrl) {
        toast.warning("Sin enlace", "Primero obtén o pega un enlace de descarga.");
        return;
    }
    if (!shortenerPrefix.trim()) {
        toast.warning("Sin prefijo", "Ingresa el prefijo de tu acortador (ej. ouo.io/st/api=KEY&url=)");
        return;
    }
    
    // Guardar prefijo para la próxima vez
    localStorage.setItem('shortener_prefix', shortenerPrefix);
    
    // Si el link ya está acortado (contiene el prefijo), no lo duplicamos
    if (formData.downloadUrl.includes(shortenerPrefix)) {
        toast.info("Ya acortado", "El enlace ya contiene el prefijo del acortador.");
        return;
    }

    const shortened = `${shortenerPrefix}${encodeURIComponent(formData.downloadUrl)}`;
    setFormData(prev => ({ ...prev, downloadUrl: shortened }));
    toast.success("Enlace Acortado", "Se ha aplicado tu acortador al link de descarga.");
  };

  const toggleLanguage = (lang: typeof LANGUAGES[number]) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang) 
        ? prev.languages.filter(l => l !== lang) 
        : [...prev.languages, lang]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-background w-full max-w-2xl rounded-3xl shadow-2xl border border-border-color flex flex-col max-h-[90vh] relative overflow-hidden animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        
        {/* IGDB Search Overlay */}
        {isSearchOpen && (
             <div className="absolute inset-0 z-50 bg-background flex flex-col animate-slide-in-up">
                <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface">
                    <h3 className="text-xl font-bold text-text-main">Buscar en IGDB</h3>
                    <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-text-muted"><X size={24} /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleIGDBSearch} className="flex gap-2 mb-6">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nombre del juego..." className="flex-1 bg-surface border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-lg" autoFocus />
                        <button type="submit" disabled={isSearching} className="bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-xl font-bold transition-colors">
                            {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                        </button>
                    </form>
                    <div className="space-y-3">
                        {searchResults.map((result, idx) => (
                            <button key={idx} onClick={() => selectIGDBResult(result)} className="w-full flex items-start gap-4 p-3 rounded-xl bg-surface border border-border-color hover:border-primary transition-all text-left group">
                                <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                    {result.imageUrl && <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-text-main group-hover:text-primary-hover">{result.title}</h4>
                                    <p className="text-xs text-text-muted mt-1">{result.year} • {result.console}</p>
                                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{result.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface">
          <div>
            <h2 className="text-2xl font-bold text-text-main">{initialData ? 'Editar Juego' : 'Nuevo Juego'}</h2>
            <button type="button" onClick={() => setIsSearchOpen(true)} className="text-xs font-bold text-primary-hover hover:underline flex items-center gap-1 mt-1"><Globe size={12} /> Importar Datos de IGDB</button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-text-muted"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-gray-50/30">
          <form id="game-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Título</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={`w-full bg-surface border ${errors.title ? 'border-red-500' : 'border-border-color'} rounded-xl px-4 py-3 focus:outline-none focus:border-primary`} placeholder="Ej: Minecraft PE" />
            </div>

            {/* Android Tools - AUTOMATED FLOW */}
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-primary-hover" />
                    <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">Herramientas Android (Automático)</h4>
                </div>
                
                {/* Step 1: Fetch Link */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted">1. Extraer Link de AN1.com</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={sourceUrl} 
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="Pega URL de AN1 (ej: an1.com/65-game.html)" 
                            className="flex-1 bg-surface border border-border-color rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                        <button 
                            type="button" 
                            onClick={handleAutoFetchLink}
                            disabled={isFetchingLink}
                            className="bg-primary hover:bg-primary-hover text-black px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isFetchingLink ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            {isFetchingLink ? 'Extrayendo...' : 'Extraer Link'}
                        </button>
                    </div>
                </div>

                {/* Step 2: Shorten Link */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted">2. Aplicar Acortador</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={shortenerPrefix} 
                            onChange={(e) => setShortenerPrefix(e.target.value)}
                            placeholder="Prefijo (ej: ouo.io/s/abc?url=)" 
                            className="flex-1 bg-surface border border-border-color rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                        <button 
                            type="button" 
                            onClick={applyShortener}
                            className="bg-text-main hover:bg-black text-white px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                        >
                            <LinkIcon size={14} />
                            Acortar Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Download URL Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-muted">Enlace de Descarga Final</label>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Download className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input type="text" value={formData.downloadUrl || ''} onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary text-sm font-medium" placeholder="Link directo o ya acortado..." />
                  </div>
                  <button type="button" onClick={() => formData.downloadUrl && window.open(formData.downloadUrl, '_blank')} className="bg-surface border border-border-color hover:bg-gray-100 text-text-muted px-4 rounded-xl transition-colors"><ExternalLink size={18} /></button>
              </div>
            </div>

            {/* Console Tags */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Consola / Sistema</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CONSOLES.map((c) => (
                    <button key={c} type="button" onClick={() => setFormData({ ...formData, console: c })} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formData.console === c ? 'bg-primary border-primary text-black' : 'bg-surface border-border-color text-text-muted'}`}>{c}</button>
                  ))}
                </div>
            </div>

            {/* Meta Data Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Año</label>
                <input type="text" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Tamaño</label>
                <input type="text" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none" placeholder="150 MB" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Formato</label>
                <input type="text" value={formData.format} onChange={e => setFormData({ ...formData, format: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none" placeholder="APK" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Empresa</label>
                <input type="text" value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 focus:outline-none" placeholder="EA Games" />
              </div>
            </div>

            {/* Image & Description */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-text-muted">URL Imagen de Portada</label>
                    <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-3 focus:outline-none" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-text-muted">Descripción</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full bg-surface border border-border-color rounded-xl px-4 py-3 focus:outline-none resize-none" placeholder="Detalles del juego..." />
                </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border-color bg-surface rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-text-muted hover:bg-gray-100 transition-colors">Cancelar</button>
          <button type="submit" form="game-form" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold shadow-lg flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Guardando...' : 'Guardar Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameForm;