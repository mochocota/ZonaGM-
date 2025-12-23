
import React, { useState } from 'react';
import { Report, Game } from '../types';
import { X, CheckCircle, Trash2, ExternalLink, ShieldAlert, DownloadCloud, Loader2, Plus, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { scrapeUniversalMetadata } from '../services/scraper';
import { searchIGDB } from '../services/igdb';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from './Toast';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigateToGame: (gameId: string) => void;
}

interface ImportItem {
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  title?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  reports, 
  onResolve, 
  onDelete,
  onNavigateToGame
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'reports' | 'importer'>('reports');
  
  // Importer States
  const [urlsText, setUrlsText] = useState('');
  const [importingList, setImportingList] = useState<ImportItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStartImport = async () => {
    const urls = urlsText.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    if (urls.length === 0) {
      toast.error("Error", "Pega al menos una URL válida.");
      return;
    }

    setIsProcessing(true);
    const initialList: ImportItem[] = urls.map(url => ({ url, status: 'pending' }));
    setImportingList(initialList);

    for (let i = 0; i < initialList.length; i++) {
        setImportingList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'loading' } : item));
        
        try {
            // 1. Universal Scraping for Meta/Description
            const scraped = await scrapeUniversalMetadata(initialList[i].url);
            
            // 2. Search IGDB using the scraped title for visuals
            let igdbData: any = null;
            try {
                const results = await searchIGDB(scraped.title);
                if (results && results.length > 0) igdbData = results[0];
            } catch (e) { console.warn("IGDB failed", e); }

            // 3. Assemble and save
            const newGame: Omit<Game, 'id'> = {
                title: igdbData?.title || scraped.title,
                description: scraped.description || igdbData?.description || 'Sin descripción.',
                imageUrl: igdbData?.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image',
                screenshots: igdbData?.screenshots || [],
                year: igdbData?.year || new Date().getFullYear().toString(),
                publisher: igdbData?.publisher || 'Unknown',
                console: igdbData?.console || 'PC',
                size: 'N/A',
                format: 'ROM',
                downloadUrl: initialList[i].url,
                downloads: 0,
                rating: igdbData?.rating || 0,
                voteCount: igdbData?.voteCount || 0,
                languages: ['English', 'Spanish'],
                comments: []
            };

            await addDoc(collection(db, 'games'), newGame);

            setImportingList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', title: newGame.title } : item));
        } catch (err: any) {
            setImportingList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message } : item));
        }
    }

    setIsProcessing(false);
    toast.success("Finalizado", "Se ha completado la importación masiva.");
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-background w-full max-w-4xl rounded-3xl shadow-2xl border border-border-color flex flex-col max-h-[90vh] overflow-hidden animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col bg-surface border-b border-border-color">
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-main leading-none">Panel ZONA_ADMiN</h2>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-muted">
                    <X size={24} />
                </button>
            </div>

            <div className="flex px-6 gap-6">
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'reports' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    Reportes ({reports.filter(r => r.status === 'Pending').length})
                </button>
                <button 
                    onClick={() => setActiveTab('importer')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'importer' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    Importador Universal
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {activeTab === 'reports' ? (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                    <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
                    <p className="text-lg font-medium">Todo limpio.</p>
                </div>
              ) : (
                reports.map((report) => (
                    <div key={report.id} className={`bg-surface border rounded-xl p-4 flex flex-col md:flex-row gap-4 ${report.status === 'Resolved' ? 'opacity-60 border-green-200' : 'border-red-100 shadow-sm'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${report.reason === 'Link Caído' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{report.reason}</span>
                                <span className="text-xs text-text-muted">{report.date}</span>
                            </div>
                            <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                                {report.gameTitle}
                                <button onClick={() => { onNavigateToGame(report.gameId); onClose(); }} className="text-primary-hover hover:text-text-main"><ExternalLink size={16} /></button>
                            </h3>
                            {report.description && <p className="text-sm text-text-muted mt-1 bg-gray-50 p-2 rounded border border-border-color/50 italic">"{report.description}"</p>}
                        </div>
                        <div className="flex items-center gap-2 md:border-l md:border-border-color md:pl-4">
                            {report.status === 'Pending' ? (
                                <button onClick={() => onResolve(report.id)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors">
                                    <CheckCircle size={16} /> Resolver
                                </button>
                            ) : (
                                <span className="px-4 py-2 text-green-600 font-bold text-sm flex items-center gap-2"><CheckCircle size={16} /> Resuelto</span>
                            )}
                            <button onClick={() => onDelete(report.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
                <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-2 flex items-center gap-2">
                        <Globe className="text-primary" />
                        Poblar archivos automáticamente
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                        Pega URLs de sitios como AN1, CdRomance, etc. Extraeremos el texto y buscaremos las imágenes en IGDB automáticamente.
                    </p>
                    
                    <textarea 
                        value={urlsText}
                        onChange={(e) => setUrlsText(e.target.value)}
                        placeholder="https://an1.com/game.html&#10;https://cdromance.com/game.html"
                        rows={6}
                        disabled={isProcessing}
                        className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary resize-none font-mono text-xs"
                    />

                    <button 
                        onClick={handleStartImport}
                        disabled={isProcessing || !urlsText.trim()}
                        className="mt-4 w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <DownloadCloud size={24} />}
                        <span>{isProcessing ? 'Procesando Enlaces...' : 'Comenzar Importación Universal'}</span>
                    </button>
                </div>

                {importingList.length > 0 && (
                    <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Estado de los Enlaces</h4>
                        <div className="space-y-2">
                            {importingList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-color/50 text-xs">
                                    <div className="flex flex-col gap-1 truncate max-w-[70%]">
                                        <span className="truncate text-text-muted font-mono">{item.url}</span>
                                        {item.title && <span className="font-bold text-text-main truncate">{item.title}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {item.status === 'loading' && <Loader2 size={16} className="animate-spin text-primary" />}
                                        {item.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                                        {item.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                                        <span className={`font-bold uppercase ${item.status === 'success' ? 'text-green-600' : item.status === 'error' ? 'text-red-600' : 'text-text-muted'}`}>{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
