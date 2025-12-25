
import React, { useState, useEffect, useRef } from 'react';
import { Report, Game } from '../types';
import { X, CheckCircle, Trash2, ExternalLink, ShieldAlert, DownloadCloud, Loader2, Plus, AlertCircle, CheckCircle2, Globe, HelpCircle, Save, Database, FileUp, FileDown } from 'lucide-react';
import { searchIGDB } from '../services/igdb';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useToast } from './Toast';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  games: Game[];
  helpContent: {
      shortenerExplanation: string;
      faqs: { q: string, a: string }[];
  };
  onSaveHelp: (content: any) => Promise<void>;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigateToGame: (gameId: string) => void;
}

interface ImportItem {
  name: string;
  console?: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  title?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  reports, 
  games,
  helpContent,
  onSaveHelp,
  onResolve, 
  onDelete,
  onNavigateToGame
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'reports' | 'importer' | 'backup' | 'help'>('reports');
  
  // Importer States
  const [namesText, setNamesText] = useState('');
  const [importingList, setImportingList] = useState<ImportItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Backup States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  // Help Content Local State
  const [localHelp, setLocalHelp] = useState(helpContent);
  const [isSavingHelp, setIsSavingHelp] = useState(false);

  useEffect(() => {
    setLocalHelp(helpContent);
  }, [helpContent]);

  if (!isOpen) return null;

  const handleStartImport = async () => {
    const lines = namesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast.error("Error", "Ingresa al menos un nombre de juego.");
      return;
    }

    setIsProcessing(true);
    const initialList: ImportItem[] = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return { name: parts[0], console: parts[1], status: 'pending' };
    });
    setImportingList(initialList);

    for (let i = 0; i < initialList.length; i++) {
        const item = initialList[i];
        setImportingList(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'loading' } : it));
        
        try {
            const results = await searchIGDB(item.name);
            let igdbData: any = null;
            
            if (results && results.length > 0) {
                // Si el usuario especificó consola, buscamos coincidencia
                if (item.console) {
                    igdbData = results.find(r => r.console.toLowerCase() === item.console?.toLowerCase()) || results[0];
                } else {
                    igdbData = results[0];
                }
            }

            if (!igdbData) throw new Error('No se encontró en IGDB');

            const newGame: Omit<Game, 'id'> = {
                title: igdbData.title,
                description: igdbData.description || 'Sin descripción.',
                imageUrl: igdbData.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image',
                screenshots: igdbData.screenshots || [],
                year: igdbData.year || new Date().getFullYear().toString(),
                publisher: igdbData.publisher || 'Unknown',
                console: igdbData.console || 'PC',
                size: 'N/A',
                format: 'ROM',
                downloadUrl: '',
                downloads: 0,
                rating: igdbData.rating || 0,
                voteCount: igdbData.voteCount || 0,
                languages: ['English', 'Spanish'],
                comments: []
            };

            await addDoc(collection(db, 'games'), newGame);
            setImportingList(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'success', title: newGame.title } : it));
        } catch (err: any) {
            setImportingList(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error', error: err.message } : it));
        }
    }

    setIsProcessing(false);
    toast.success("Finalizado", "Se ha completado la importación desde IGDB.");
  };

  const handleDownloadBackup = () => {
      const backupData = {
          version: '1.0',
          date: new Date().toISOString(),
          games: games,
          reports: reports,
          help: helpContent
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zonagm_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Respaldo Generado", "Se ha descargado el archivo de respaldo correctamente.");
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsBackupLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (!data.games || !Array.isArray(data.games)) throw new Error('Formato de respaldo inválido');

              const batch = writeBatch(db);
              
              // Restaurar Juegos
              for (const game of data.games) {
                  const { id, ...gameData } = game;
                  const gameRef = doc(collection(db, 'games'), id);
                  batch.set(gameRef, gameData);
              }

              // Restaurar Reportes
              if (data.reports && Array.isArray(data.reports)) {
                  for (const report of data.reports) {
                      const { id, ...reportData } = report;
                      const reportRef = doc(collection(db, 'reports'), id);
                      batch.set(reportRef, reportData);
                  }
              }

              // Restaurar Ayuda
              if (data.help) {
                  const helpRef = doc(db, 'settings', 'help');
                  batch.set(helpRef, data.help);
              }

              await batch.commit();
              toast.success("Importación Exitosa", "Todos los datos han sido restaurados.");
              onClose();
          } catch (err) {
              console.error(err);
              toast.error("Error", "No se pudo importar el archivo de respaldo.");
          } finally {
              setIsBackupLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleUpdateHelp = async () => {
      setIsSavingHelp(true);
      await onSaveHelp(localHelp);
      setIsSavingHelp(false);
  };

  const updateFAQ = (index: number, field: 'q' | 'a', value: string) => {
      const newFaqs = [...localHelp.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      setLocalHelp({ ...localHelp, faqs: newFaqs });
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
                    Importar IGDB
                </button>
                <button 
                    onClick={() => setActiveTab('backup')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'backup' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    Respaldo
                </button>
                <button 
                    onClick={() => setActiveTab('help')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'help' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                >
                    Editar Ayuda
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
          ) : activeTab === 'importer' ? (
            <div className="space-y-6">
                <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-2 flex items-center gap-2">
                        <Globe className="text-primary" />
                        Importar por Nombre e IGDB
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                        Ingresa un nombre de juego por línea. Opcionalmente añade la consola usando un separador '|'. Los metadatos se llenarán solos.
                    </p>
                    <textarea 
                        value={namesText}
                        onChange={(e) => setNamesText(e.target.value)}
                        placeholder="Super Mario 64 | N64&#10;The Legend of Zelda Ocarina of Time&#10;Metal Gear Solid | PS1"
                        rows={6}
                        disabled={isProcessing}
                        className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary resize-none font-mono text-xs"
                    />
                    <button 
                        onClick={handleStartImport}
                        disabled={isProcessing || !namesText.trim()}
                        className="mt-4 w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <DownloadCloud size={24} />}
                        <span>{isProcessing ? 'Procesando Nombres...' : 'Comenzar Importación IGDB'}</span>
                    </button>
                </div>
                {importingList.length > 0 && (
                    <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Estado de la Importación</h4>
                        <div className="space-y-2">
                            {importingList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-color/50 text-xs">
                                    <div className="flex flex-col gap-1 truncate max-w-[70%]">
                                        <span className="truncate text-text-muted font-mono">{item.name} {item.console ? `(${item.console})` : ''}</span>
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
          ) : activeTab === 'backup' ? (
            <div className="space-y-6">
                <div className="bg-surface border border-border-color rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
                    <Database size={48} className="text-primary mb-4" />
                    <h3 className="text-xl font-bold text-text-main mb-2">Respaldo Integral</h3>
                    <p className="text-text-muted mb-8 max-w-md">
                        Descarga o restaura una copia completa de la base de datos, incluyendo posts (juegos), comentarios, reportes y configuraciones de ayuda.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <button 
                            onClick={handleDownloadBackup}
                            className="flex items-center justify-center gap-3 bg-text-main text-surface hover:bg-text-muted font-bold py-4 rounded-xl transition-all shadow-md"
                        >
                            <FileDown size={20} />
                            Descargar Respaldo (.json)
                        </button>
                        
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".json" 
                                ref={fileInputRef} 
                                onChange={handleImportBackup} 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isBackupLoading}
                                className="w-full flex items-center justify-center gap-3 bg-surface border-2 border-dashed border-border-color hover:border-primary text-text-main font-bold py-4 rounded-xl transition-all"
                            >
                                {isBackupLoading ? <Loader2 className="animate-spin" size={20} /> : <FileUp size={20} />}
                                Importar Respaldo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                        <HelpCircle className="text-primary" /> Explicación de Acortadores
                    </h3>
                    <textarea 
                        value={localHelp.shortenerExplanation}
                        onChange={(e) => setLocalHelp({...localHelp, shortenerExplanation: e.target.value})}
                        rows={5}
                        className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary resize-none"
                        placeholder="Escribe aquí la razón de los acortadores..."
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-text-main px-2">Preguntas Frecuentes (FAQ)</h3>
                    {localHelp.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-surface border border-border-color rounded-2xl p-6 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pregunta {idx + 1}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-text-muted">Pregunta</label>
                                <input 
                                    type="text" 
                                    value={faq.q}
                                    onChange={(e) => updateFAQ(idx, 'q', e.target.value)}
                                    className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-text-muted">Respuesta</label>
                                <textarea 
                                    value={faq.a}
                                    onChange={(e) => updateFAQ(idx, 'a', e.target.value)}
                                    rows={2}
                                    className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-sm text-text-muted resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 p-4 bg-surface border-t border-border-color flex justify-end rounded-b-2xl">
                    <button 
                        onClick={handleUpdateHelp}
                        disabled={isSavingHelp}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-bold px-8 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isSavingHelp ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Guardar Cambios en Ayuda</span>
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
