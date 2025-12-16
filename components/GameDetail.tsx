import React, { useState, useMemo, useEffect } from 'react';
import { Game, Comment } from '../types';
import { ArrowLeft, Download, HardDrive, Calendar, Gamepad2, Layers, ShieldCheck, MessageSquare, Send, User, Globe, Star, Pencil, Trash2, Sparkles, Image as ImageIcon, X, AlertTriangle, Crown, Ban, CornerDownRight, ChevronDown, CheckCircle2, Lock, Unlock, Timer, Loader2 } from 'lucide-react';
import SEO from './SEO';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from './Toast';

interface GameDetailProps {
  game: Game;
  allGames: Game[];
  onBack: () => void;
  onSelectGame: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onReport: (gameId: string, title: string, reason: string, description: string) => void;
  isLoggedIn: boolean;
}

// Lista de moderación básica (Insultos comunes ES/EN y Spam)
const FORBIDDEN_WORDS = [
    // Spam / Links
    'http://', 'https://', 'www.', '.com', '.net', '.org', 'whatsapp', 'telegram', 'ganar dinero', 'free money', 'crypto',
    // Insultos / Groserías (Español)
    'puto', 'puta', 'mierda', 'pendejo', 'estupido', 'idiota', 'cabron', 'verga', 'zorra', 'maldito', 'imbecil', 'basura', 'chinguen', 'joder',
    // Insultos (Inglés)
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'scam'
];

interface CommentNodeProps {
  comment: Comment;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  setCommentError: (error: string) => void;
  isLoggedIn: boolean;
  isAdminComment: boolean;
  setIsAdminComment: (isAdmin: boolean) => void;
  replyName: string;
  setReplyName: (name: string) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handlePostReply: (parentId: string, replyToUser?: string) => void;
}

const CommentNode: React.FC<CommentNodeProps> = ({ 
  comment, 
  replyingToId,
  setReplyingToId,
  setCommentError,
  isLoggedIn,
  isAdminComment,
  setIsAdminComment,
  replyName,
  setReplyName,
  replyText,
  setReplyText,
  handlePostReply
}) => {
  const isReplying = replyingToId === comment.id;

  return (
    <div className="flex flex-col gap-2">
      {/* Main Comment Body */}
      <div 
          className={`flex gap-4 p-4 rounded-2xl border ${
              comment.isAdmin 
              ? 'bg-primary/5 border-primary/50' 
              : 'bg-surface border-border-color/50'
          }`}
      >
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              comment.isAdmin ? 'bg-primary text-text-main' : 'bg-gray-100 text-text-muted'
          }`}>
            {comment.isAdmin ? <ShieldCheck size={20} /> : <User size={20} />}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${comment.isAdmin ? 'text-text-main flex items-center gap-1' : 'text-text-main'}`}>
                  {comment.user}
                  {comment.isAdmin && <span className="bg-primary text-[10px] px-1.5 py-0.5 rounded text-text-main font-bold uppercase">Admin</span>}
              </span>
              <span className="text-xs text-text-muted font-medium">{comment.date}</span>
            </div>
            <button 
              onClick={() => {
                  setReplyingToId(isReplying ? null : comment.id);
                  setCommentError('');
              }}
              className="text-xs font-bold text-text-muted hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <CornerDownRight size={14} /> Responder
            </button>
          </div>
          <p className={`leading-relaxed text-sm ${comment.isAdmin ? 'text-text-main font-medium' : 'text-text-muted'}`}>
            {comment.content}
          </p>

          {/* Inline Reply Form */}
          {isReplying && (
              <div className="mt-4 p-4 bg-background rounded-xl border border-border-color animate-fade-in">
                  <div className="flex flex-col gap-3">
                       {/* Admin Toggle in Reply */}
                      {isLoggedIn && (
                          <div className="flex items-center gap-2 mb-1">
                              <input 
                              type="checkbox" 
                              checked={isAdminComment}
                              onChange={(e) => setIsAdminComment(e.target.checked)}
                              className="accent-primary w-3 h-3 cursor-pointer"
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Como Admin</span>
                          </div>
                      )}
                      
                      {!((isLoggedIn && isAdminComment)) && (
                          <input 
                              type="text" 
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="Tu Nickname"
                              className="w-full bg-white border border-border-color rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                      )}
                      <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Responder a ${comment.user}...`}
                          rows={2}
                          className="w-full bg-white border border-border-color rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                      />
                      <div className="flex justify-end gap-2">
                          <button 
                              onClick={() => setReplyingToId(null)}
                              className="text-xs font-bold text-text-muted px-3 py-1.5 hover:text-text-main"
                          >
                              Cancelar
                          </button>
                          <button 
                              onClick={() => handlePostReply(comment.id, comment.user)}
                              disabled={(!(isLoggedIn && isAdminComment) && !replyName.trim()) || !replyText.trim()}
                              className="text-xs font-bold bg-primary hover:bg-primary-hover text-text-main px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
                          >
                              Enviar Respuesta
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* Recursive Replies Container */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 border-border-color/60">
          {comment.replies.map(reply => (
            <CommentNode 
              key={reply.id} 
              comment={reply}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              setCommentError={setCommentError}
              isLoggedIn={isLoggedIn}
              isAdminComment={isAdminComment}
              setIsAdminComment={setIsAdminComment}
              replyName={replyName}
              setReplyName={setReplyName}
              replyText={replyText}
              setReplyText={setReplyText}
              handlePostReply={handlePostReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GameDetail: React.FC<GameDetailProps> = ({ game, allGames, onBack, onSelectGame, onEdit, onDelete, onReport, isLoggedIn }) => {
  const { toast } = useToast();
  // We use the passed game.comments for rendering, which is updated by App.tsx listeners
  const comments = game.comments || [];
  
  // Accordion State
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  
  // Main Comment Form State
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isAdminComment, setIsAdminComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  
  // Reply State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');

  // Rating State
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<'Link Caído' | 'Imagen Rota' | 'Información Incorrecta' | 'Otro'>('Link Caído');
  const [reportDescription, setReportDescription] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Download Security Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadTimer, setDownloadTimer] = useState(5);
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  // Check Local Storage for Rating
  useEffect(() => {
    const storageKey = `rated_${game.id}`;
    if (localStorage.getItem(storageKey)) {
        setHasRated(true);
    } else {
        setHasRated(false);
    }
    setRatingMessage('');
  }, [game.id]);

  // Download Timer Logic
  useEffect(() => {
    let interval: number;
    if (isDownloadModalOpen && downloadTimer > 0) {
        interval = window.setInterval(() => {
            setDownloadTimer(prev => prev - 1);
        }, 1000);
    } else if (downloadTimer === 0) {
        setIsDownloadReady(true);
    }

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isDownloadModalOpen, downloadTimer]);

  // Recommendations Logic
  const relatedGames = useMemo(() => {
    // 1. Filter out current game
    const otherGames = allGames.filter(g => g.id !== game.id);
    
    // 2. Prioritize same console
    const sameConsole = otherGames.filter(g => g.console === game.console);
    const differentConsole = otherGames.filter(g => g.console !== game.console);
    
    // 3. Combine and take 3
    return [...sameConsole, ...differentConsole].slice(0, 3);
  }, [game, allGames]);

  // Helper: Flattened reply logic. Finds the root ancestor and adds the reply to its list.
  const addReplyToTree = (nodes: Comment[], parentId: string, reply: Comment): Comment[] => {
    
    // Check if a node or any of its descendants matches the ID
    const hasDescendant = (n: Comment, id: string): boolean => {
        if (n.id === id) return true;
        if (n.replies) return n.replies.some(r => hasDescendant(r, id));
        return false;
    };

    return nodes.map(node => {
      // If this root node is the parent or contains the parent
      if (hasDescendant(node, parentId)) {
        return { 
          ...node, 
          replies: [...(node.replies || []), reply] 
        };
      }
      return node;
    });
  };

  const validateContent = (text: string, name: string, isAdmin: boolean) => {
    if (isAdmin) return true;
    const lowerText = text.toLowerCase();
    const lowerName = name.toLowerCase();
    
    const foundBadWord = FORBIDDEN_WORDS.find(word => 
        lowerText.includes(word) || lowerName.includes(word)
    );

    return !foundBadWord;
  };

  const saveCommentsToFirestore = async (newComments: Comment[]) => {
      try {
          const gameRef = doc(db, 'games', game.id);
          await updateDoc(gameRef, { comments: newComments });
      } catch (error: any) {
          console.error("Error saving comment:", error);
          if (error.code === 'permission-denied') {
             setCommentError('Error de Permisos: Revisa la consola de Firebase -> Firestore -> Reglas.');
          } else {
             setCommentError('Hubo un error al guardar el comentario.');
          }
      }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    
    const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : newCommentName;
    
    if (!userName.trim() || !newCommentText.trim()) return;

    if (!validateContent(newCommentText, userName, isLoggedIn && isAdminComment)) {
        setCommentError('Tu comentario no se puede publicar porque contiene lenguaje ofensivo, groserías o spam.');
        return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      user: userName,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      content: newCommentText,
      isAdmin: (isLoggedIn && isAdminComment),
      replies: []
    };

    const updatedComments = [comment, ...comments];
    await saveCommentsToFirestore(updatedComments);

    setNewCommentText('');
    if (!isAdminComment) setNewCommentName('');
  };

  const handlePostReply = async (parentId: string, replyToUser?: string) => {
      setCommentError('');
      
      const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : replyName;
      
      if (!userName.trim() || !replyText.trim()) return;

      if (!validateContent(replyText, userName, isLoggedIn && isAdminComment)) {
        toast.warning("Contenido no permitido", "Tu respuesta contiene lenguaje ofensivo.");
        return;
      }

      // If replying to someone deeply nested, we might want to tag them in the content
      let finalContent = replyText;
      if (replyToUser) {
          finalContent = `@${replyToUser} ${replyText}`;
      }

      const reply: Comment = {
          id: Date.now().toString(),
          user: userName,
          date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          content: finalContent,
          isAdmin: (isLoggedIn && isAdminComment),
          replies: []
      };

      const updatedComments = addReplyToTree(comments, parentId, reply);
      await saveCommentsToFirestore(updatedComments);
      
      // Cleanup
      setReplyingToId(null);
      setReplyText('');
      if(!isAdminComment) setReplyName('');
  };

  const handleRateGame = async (score: number) => {
    if (hasRated) return;

    // Simulate saving to DB and updating average
    const currentRating = game.rating || 0;
    const simulatedNewRating = ((currentRating * 20) + score) / 21; // Assume 20 previous votes for weight (simple logic)
    const finalRating = parseFloat(simulatedNewRating.toFixed(1));
    
    try {
        const gameRef = doc(db, 'games', game.id);
        await updateDoc(gameRef, { rating: finalRating });
        
        // Save to local storage
        localStorage.setItem(`rated_${game.id}`, 'true');
        setHasRated(true);
        setRatingMessage('¡Gracias por calificar el juego!');
    } catch (error: any) {
        console.error("Error updating rating:", error);
        if (error.code === 'permission-denied') {
            setRatingMessage('Error: Permisos insuficientes.');
        }
    }

    // Disable hover
    setHoverRating(0);
  };

  const initiateDownload = () => {
      if (game.downloadUrl) {
          setIsDownloadModalOpen(true);
          setDownloadTimer(5); // 5 Seconds countdown
          setIsDownloadReady(false);
      }
  };

  const handleFinalDownload = () => {
      if (game.downloadUrl) {
          // Increment download count in Firestore
          try {
              const gameRef = doc(db, 'games', game.id);
              // Optimistic update isn't needed strictly as onSnapshot will catch it, but increment() from firestore is better. 
              // Since we imported simple functions, let's just do a manual increment based on current state for simplicity
              updateDoc(gameRef, { downloads: (game.downloads || 0) + 1 });
          } catch(e) { console.error(e); }

          window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
          setIsDownloadModalOpen(false);
      }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
      e.preventDefault();
      onReport(game.id, game.title, reportReason, reportDescription);
      setIsReportModalOpen(false);
      setReportDescription('');
      // Toast handled in App.tsx
  };

  return (
    <div className="w-full max-w-[1000px] animate-slide-in-up duration-500">
      
      {/* Dynamic SEO for Game Detail */}
      <SEO 
        title={`Download ${game.title} (${game.year}) - ${game.console} ISO/ROM`}
        description={`Download ${game.title} for ${game.console}. Verified secure download, format ${game.format}, size ${game.size}. Publisher: ${game.publisher}.`}
        image={game.imageUrl}
        url={window.location.href}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
          <div 
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsDeleteModalOpen(false)}
          >
              <div 
                className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-red-200 text-center animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <Trash2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2">¿Eliminar Juego?</h3>
                  <p className="text-text-muted mb-6">
                      Esta acción es irreversible. El juego "{game.title}" será eliminado permanentemente del archivo.
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="flex-1 py-3 rounded-xl border border-border-color font-bold text-text-muted hover:bg-gray-100 transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={() => {
                              onDelete(game.id);
                              setIsDeleteModalOpen(false);
                          }}
                          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg transition-colors"
                      >
                          Sí, Eliminar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Download Security Modal */}
      {isDownloadModalOpen && (
          <div 
            className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsDownloadModalOpen(false)}
          >
              <div 
                className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border-color relative overflow-hidden animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                  <button 
                      onClick={() => setIsDownloadModalOpen(false)}
                      className="absolute top-4 right-4 text-text-muted hover:text-text-main"
                  >
                      <X size={24} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                      {!isDownloadReady ? (
                          <>
                              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                                  <Lock size={40} className="text-primary animate-pulse-fast" />
                                  <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                              </div>
                              
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-bold text-text-main">Generando Enlace Seguro</h3>
                                  <p className="text-text-muted">Por favor espere mientras encriptamos su conexión...</p>
                              </div>
                              
                              <div className="flex items-center gap-3 text-4xl font-mono font-bold text-text-main">
                                  <Timer size={32} className="text-text-muted" />
                                  <span>0:0{downloadTimer}</span>
                              </div>
                          </>
                      ) : (
                          <>
                               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-zoom-in">
                                  <Unlock size={40} className="text-green-600" />
                              </div>
                              
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-bold text-text-main">¡Enlace Listo!</h3>
                                  <p className="text-text-muted">El archivo ha sido verificado y está listo para descargar.</p>
                              </div>

                              <button 
                                  onClick={handleFinalDownload}
                                  className="w-full bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 animate-slide-in-up"
                              >
                                  <Download size={24} strokeWidth={2.5} />
                                  <span>Ir al Servidor de Descarga</span>
                              </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
          <div 
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsReportModalOpen(false)}
          >
              <div 
                className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-color animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                          <AlertTriangle size={24} className="text-red-500" />
                          Reportar Problema
                      </h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="text-text-muted hover:text-text-main">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-text-muted mb-2">Motivo del reporte</label>
                          <select 
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value as any)}
                            className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-red-500"
                          >
                              <option value="Link Caído">Link Caído</option>
                              <option value="Imagen Rota">Imagen Rota</option>
                              <option value="Información Incorrecta">Información Incorrecta</option>
                              <option value="Otro">Otro</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-text-muted mb-2">Detalles adicionales</label>
                          <textarea 
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            rows={3}
                            placeholder="Describa el problema..."
                            className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-red-500 resize-none"
                          />
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsReportModalOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-border-color font-bold text-text-muted hover:bg-gray-100"
                          >
                              Cancelar
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg"
                          >
                              Enviar Reporte
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Fullscreen Screenshot Modal - IMPROVED MOBILE */}
      {selectedScreenshot && (
        <div 
            className="fixed inset-0 z-[5000] bg-black/98 flex items-center justify-center animate-fade-in"
            onClick={() => setSelectedScreenshot(null)}
            style={{ touchAction: 'none' }} // Prevent scrolling body underneath
        >
            <button 
                onClick={() => setSelectedScreenshot(null)}
                className="absolute top-4 right-4 z-[5010] p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-md"
            >
                <X size={24} />
            </button>
            
            <div className="w-full h-full p-2 flex items-center justify-center">
                <img 
                    src={selectedScreenshot} 
                    alt="Screenshot Fullscreen" 
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-zoom-in"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
            
            <p className="absolute bottom-8 text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse">
                Click anywhere to close
            </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-text-muted hover:text-text-main font-medium transition-colors"
        >
            <div className="p-2 rounded-full bg-surface border border-border-color group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft size={20} />
            </div>
            <span>Back to Archive</span>
        </button>

        {/* Admin Actions - ONLY VISIBLE IF LOGGED IN */}
        {isLoggedIn && (
            <div className="flex gap-2">
                <button 
                    onClick={() => onEdit(game)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border-color hover:border-primary hover:text-primary transition-all text-sm font-medium"
                >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Edit</span>
                </button>
                <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border-color hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
                >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                </button>
            </div>
        )}
      </div>

      <article className="bg-surface rounded-3xl border border-border-color overflow-hidden shadow-soft mb-8">
        {/* Hero Header */}
        <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900">
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary text-text-main px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {game.console}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {game.year}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">
              {game.title}
            </h1>
            <p className="text-gray-300 font-medium text-lg drop-shadow-sm">
              {game.publisher}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-text-main mb-6">Sobre este juego</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0 mx-auto sm:mx-0 w-full max-w-[200px]">
                  <img 
                    src={game.imageUrl} 
                    alt={`Cover for ${game.title}`}
                    className="w-full h-auto rounded-xl shadow-md border border-border-color hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-text-muted leading-relaxed text-lg">
                  {game.description}
                </p>
              </div>
            </section>

             {/* Screenshots Section */}
             {game.screenshots && game.screenshots.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <ImageIcon size={20} className="text-primary-hover" />
                        Galería
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {game.screenshots.map((screen, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedScreenshot(screen)}
                                className="aspect-video rounded-xl bg-gray-100 overflow-hidden border border-border-color cursor-pointer group relative"
                            >
                                <img 
                                    src={screen} 
                                    alt={`Screenshot ${idx + 1}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
          </div>

          {/* Sidebar / Stats */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-background rounded-2xl p-6 border border-border-color space-y-4">
              <h3 className="font-bold text-text-main text-lg mb-2">Información del archivo</h3>
              
              <div className="flex items-center justify-between py-2 border-b border-border-color/50">
                <div className="flex items-center gap-2 text-text-muted">
                  <HardDrive size={18} />
                  <span className="text-sm font-medium">Tamaño</span>
                </div>
                <span className="text-text-main font-bold">{game.size}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border-color/50">
                <div className="flex items-center gap-2 text-text-muted">
                  <Globe size={18} />
                  <span className="text-sm font-medium">Idioma</span>
                </div>
                <div className="flex items-center gap-1">
                  {game.languages.map(lang => (
                    <span key={lang} title={lang} className="cursor-help text-lg" role="img" aria-label={lang}>
                      {lang === 'English' && '🇺🇸'}
                      {lang === 'Spanish' && '🇪🇸'}
                      {lang === 'Japanese' && '🇯🇵'}
                      {lang === 'Multi' && '🌐'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border-color/50">
                <div className="flex items-center gap-2 text-text-muted">
                  <Layers size={18} />
                  <span className="text-sm font-medium">Formato</span>
                </div>
                <span className="text-text-main font-bold">{game.format}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border-color/50">
                <div className="flex items-center gap-2 text-text-muted">
                  <Gamepad2 size={18} />
                  <span className="text-sm font-medium">Plataforma</span>
                </div>
                <span className="text-text-main font-bold">{game.console}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Lanzamiento</span>
                </div>
                <span className="text-text-main font-bold">{game.year}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={initiateDownload}
                    disabled={!game.downloadUrl}
                    className={`w-full font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] ${
                        game.downloadUrl 
                        ? 'bg-primary hover:bg-primary-hover text-text-main hover:shadow-xl cursor-pointer' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                >
                <Download size={24} strokeWidth={2.5} />
                <span>{game.downloadUrl ? 'Descargar' : 'No Disponible'}</span>
                </button>
                
                {/* Report Button - Opens Internal Modal */}
                <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-bold"
                >
                    <AlertTriangle size={14} className="mb-0.5" />
                    <span>Reportar Problema</span>
                </button>
            </div>

            {/* Rating Section */}
            <div className="w-full bg-background rounded-2xl p-4 border border-border-color flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                {hasRated ? 'Tu Calificación' : 'Calificar juego'}
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={hasRated}
                    onMouseEnter={() => !hasRated && setHoverRating(star)}
                    onMouseLeave={() => !hasRated && setHoverRating(0)}
                    onClick={() => handleRateGame(star)}
                    className={`${hasRated ? 'cursor-default' : 'transition-transform hover:scale-110 cursor-pointer'} focus:outline-none`}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={28}
                      className={`${
                        star <= (hoverRating || Math.round(game.rating || 0))
                          ? 'fill-primary text-primary'
                          : 'text-gray-300 fill-gray-100'
                      } transition-colors`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <div className="text-2xl font-bold text-text-main flex items-baseline gap-1">
                {(game.rating || 0).toFixed(1)} <span className="text-sm text-text-muted font-normal">/ 5.0</span>
              </div>
              {ratingMessage && (
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm mt-1 animate-fade-in">
                      <CheckCircle2 size={16} />
                      <span>{ratingMessage}</span>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section & Recommendations */}
        <div className="px-6 pb-6 md:px-10 md:pb-10">
            <section className="pt-8 border-t border-border-color">
              <button 
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="w-full flex items-center justify-between mb-6 group focus:outline-none"
              >
                  <h3 className="text-2xl font-bold text-text-main flex items-center gap-2">
                    <MessageSquare size={24} className="text-text-muted" />
                    Comentarios <span className="text-base font-medium text-text-muted">({comments.length})</span>
                  </h3>
                  <div className={`p-2 rounded-full bg-surface border border-border-color text-text-muted transition-transform duration-300 ${isCommentsOpen ? 'rotate-180 bg-gray-50' : 'group-hover:bg-gray-50'}`}>
                    <ChevronDown size={20} />
                  </div>
              </button>

              {isCommentsOpen && (
                <div className="animate-slide-in-up duration-300">
                    {/* Main Comment Form */}
                    <form onSubmit={handlePostComment} className="bg-background rounded-2xl p-6 border border-border-color mb-8">
                        <div className="flex flex-col gap-4">
                        
                        {/* Admin Toggle - ONLY IF LOGGED IN */}
                        {isLoggedIn && (
                            <div className="flex items-center gap-2">
                                <input 
                                type="checkbox" 
                                id="adminToggle" 
                                checked={isAdminComment}
                                onChange={(e) => setIsAdminComment(e.target.checked)}
                                className="accent-primary w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="adminToggle" className="text-xs font-bold uppercase tracking-wide text-text-muted cursor-pointer select-none">
                                Publicar como Admin
                                </label>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">Nickname</label>
                            <input 
                            type="text" 
                            id="name"
                            value={(isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : newCommentName}
                            onChange={(e) => {
                                if(!(isLoggedIn && isAdminComment)) {
                                    setNewCommentName(e.target.value);
                                    setCommentError('');
                                }
                            }}
                            disabled={isLoggedIn && isAdminComment}
                            placeholder="Ingresa tu nombre"
                            className={`w-full border rounded-lg px-4 py-2.5 text-text-main focus:outline-none transition-all ${
                                (isLoggedIn && isAdminComment) 
                                ? 'bg-primary/10 border-primary font-bold text-primary-hover' 
                                : 'bg-surface border-border-color focus:border-primary focus:ring-1 focus:ring-primary'
                            }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">Mensaje</label>
                            <textarea 
                            id="comment"
                            value={newCommentText}
                            onChange={(e) => {
                                setNewCommentText(e.target.value);
                                setCommentError('');
                            }}
                            placeholder={(isLoggedIn && isAdminComment) ? "Escribe un mensaje oficial..." : "Comparte tu opinión sobre este juego..."}
                            rows={3}
                            className="w-full bg-surface border border-border-color rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                            />
                        </div>

                        {commentError && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
                                <Ban size={16} className="shrink-0" />
                                <span>{commentError}</span>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button 
                            type="submit" 
                            disabled={(!(isLoggedIn && isAdminComment) && !newCommentName.trim()) || !newCommentText.trim()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-bold px-6 py-2.5 rounded-full transition-colors"
                            >
                            <Send size={16} />
                            <span>Publicar Comentario</span>
                            </button>
                        </div>
                        </div>
                    </form>

                    {/* Comments Tree */}
                    <div className="space-y-4 mb-10">
                        {comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentNode 
                                key={comment.id} 
                                comment={comment}
                                replyingToId={replyingToId}
                                setReplyingToId={setReplyingToId}
                                setCommentError={setCommentError}
                                isLoggedIn={isLoggedIn}
                                isAdminComment={isAdminComment}
                                setIsAdminComment={setIsAdminComment}
                                replyName={replyName}
                                setReplyName={setReplyName}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                handlePostReply={handlePostReply} 
                            />
                        ))
                        ) : (
                        <div className="text-center py-8 text-text-muted italic">
                            Aún no hay comentarios. ¡Sé el primero en compartir!
                        </div>
                        )}
                    </div>
                </div>
              )}
            </section>

            {/* Recommendations Section */}
            <section className="pt-8 border-t border-border-color">
                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                    <Sparkles size={20} className="text-primary" />
                    Te pudiera interesar
                </h3>
                {/* 3 cols on mobile, 4 cols on md/lg */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {relatedGames.map(related => (
                        <div 
                            key={related.id} 
                            onClick={() => onSelectGame(related)}
                            className="group cursor-pointer flex flex-col gap-2"
                        >
                            <div className="aspect-[3/4] w-full rounded-xl bg-gray-200 overflow-hidden relative shadow-sm border border-border-color group-hover:shadow-md group-hover:border-primary/50 transition-all">
                                <img 
                                    src={related.imageUrl} 
                                    alt={related.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                                    {related.console}
                                </div>
                            </div>
                            <h4 className="text-xs md:text-sm font-bold text-text-main leading-tight line-clamp-2 group-hover:text-primary-hover transition-colors" title={related.title}>
                                {related.title}
                            </h4>
                        </div>
                    ))}
                    {relatedGames.length === 0 && (
                        <div className="col-span-full text-center py-4 text-text-muted text-sm italic">
                            No related games found.
                        </div>
                    )}
                </div>
            </section>
        </div>
      </article>
    </div>
  );
};

export default GameDetail;