import React from 'react';
import { Report, Game } from '../types';
import { X, CheckCircle, Trash2, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigateToGame: (gameId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  reports, 
  onResolve, 
  onDelete,
  onNavigateToGame
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background w-full max-w-4xl rounded-3xl shadow-2xl border border-border-color flex flex-col max-h-[90vh] overflow-hidden animate-slide-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <ShieldAlert size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-text-main leading-none">Panel ZONA_ADMiN</h2>
                <p className="text-sm text-text-muted mt-1">Gestionar reportes de usuarios</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-muted">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">Todo limpio.</p>
                <p className="text-sm">No hay reportes pendientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
                {reports.map((report) => (
                    <div 
                        key={report.id} 
                        className={`bg-surface border rounded-xl p-4 transition-all hover:shadow-md flex flex-col md:flex-row gap-4 ${report.status === 'Resolved' ? 'opacity-60 border-green-200' : 'border-red-100 shadow-sm'}`}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    report.reason === 'Link Caído' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    {report.reason}
                                </span>
                                <span className="text-xs text-text-muted">{report.date}</span>
                            </div>
                            <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                                {report.gameTitle}
                                <button 
                                    onClick={() => {
                                        onNavigateToGame(report.gameId);
                                        onClose();
                                    }}
                                    className="text-primary-hover hover:text-text-main transition-colors"
                                    title="Ir al juego"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </h3>
                            {report.description && (
                                <p className="text-sm text-text-muted mt-1 bg-gray-50 p-2 rounded border border-border-color/50">
                                    "{report.description}"
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:border-l md:border-border-color md:pl-4">
                             {report.status === 'Pending' ? (
                                <button 
                                    onClick={() => onResolve(report.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <CheckCircle size={16} />
                                    <span>Marcar Resuelto</span>
                                </button>
                             ) : (
                                <span className="px-4 py-2 text-green-600 font-bold text-sm flex items-center gap-2">
                                    <CheckCircle size={16} /> Resuelto
                                </span>
                             )}
                             
                             <button 
                                onClick={() => onDelete(report.id)}
                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar reporte"
                             >
                                <Trash2 size={20} />
                             </button>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;