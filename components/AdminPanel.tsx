
import React, { useState } from 'react';
import { Report, Game } from '../types';
import { X, CheckCircle, Trash2, ExternalLink, ShieldAlert, DownloadCloud, Loader2, Plus, AlertCircle, CheckCircle2, ListFilter } from 'lucide-react';
import { scrapeAN1Game } from '../services/scraper';
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
            // 1. Scraping de Meta y Descripción (Texto solamente)
            const scrapedData = await scrapeAN1Game(initialList[i].url);
            
            // 2. Buscar Imágenes y Screenshots en IGDB usando el título extraído
            let imageUrl = '';
            let screenshots: string[] = [];
            try {
                const igdbResults = await searchIGDB(scrapedData.title);
                if (igdbResults && igdbResults.length > 0) {
                    imageUrl = igdbResults[0].imageUrl;
                    screenshots = igdbResults[0].screenshots || [];
                }
            } catch (igdbErr) {
                console.warn("IGDB falló durante la importación, continuando sin imágenes.", igdbErr);
            }

            // 3. Crear objeto Game y guardar en Firestore
            const newGame: Omit<Game, 'id'> = {
                title: scrapedData.title,
                description: scrapedData.description,
                size: scrapedData.size,
                year: scrapedData.year,
                publisher: scrapedData.publisher,
                console: 'Android',
                format: 'APK',
                imageUrl: imageUrl || 'https://via.placeholder.com/600x800?text=No+Image',
                screenshots: screenshots,
                downloadUrl: initialList[i].url, // URL de referencia
                downloads: 0,
                rating: 5,
                voteCount: 1,
                comments: [],
                languages: ['English', 'Spanish']
            };

            await addDoc(collection(db, 'games'), newGame);

            setImportingList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', title: scrapedData.title } : item));
        } catch (err: any) {
            console.error(err);
            setImportingList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message } : item));
        }
    }

    setIsProcessing(false);
    toast.success("Completado", "Proceso de importación finalizado.");
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-background w-full max-w-4xl rounded-3xl shadow-2xl border border-border-color flex flex-col max-h-[90vh] overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Tab Header */}
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
                    Importador Masivo
                </button>
            </div>
        </div>

        {/* Content Area */}
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
                        <DownloadCloud className="text-primary" />
                        Scraping Masivo (AN1.com)
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                        Pega una lista de URLs de AN1.com. El sistema extraerá el <b>Título y Descripción</b>, y buscará automáticamente las <b>Imágenes</b> en IGDB.
                    </p>
                    
                    <textarea 
                        value={urlsText}
                        onChange={(e) => setUrlsText(e.target.value)}
                        placeholder="https://an1.com/juego-1.html&#10;https://an1.com/juego-2.html"
                        rows={8}
                        disabled={isProcessing}
                        className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary resize-none font-mono text-xs leading-relaxed"
                    />

                    <button 
                        onClick={handleStartImport}
                        disabled={isProcessing || !urlsText.trim()}
                        className="mt-4 w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                        <span>{isProcessing ? 'Procesando Archivos...' : 'Comenzar Importación Masiva'}</span>
                    </button>
                </div>

                {importingList.length > 0 && (
                    <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Registro de Procesamiento</h4>
                        <div className="space-y-2">
                            {importingList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-color/50 text-xs">
                                    <div className="flex flex-col gap-1 truncate max-w-[70%]">
                                        <span className="truncate text-text-muted font-mono">{item.url}</span>
                                        {item.title && <span className="font-bold text-text-main">{item.title}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {item.status === 'loading' && <Loader2 size={16} className="animate-spin text-primary" />}
                                        {item.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                                        {item.status === 'error' && (
                                            <span title={item.error} className="cursor-help">
                                                <AlertCircle size={16} className="text-red-500" />
                                            </span>
                                        )}
                                        <span className={`font-bold uppercase tracking-tighter ${
                                            item.status === 'success' ? 'text-green-600' : 
                                            item.status === 'error' ? 'text-red-600' : 'text-text-muted'
                                        }`}>
                                            {item.status}
                                        </span>
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
