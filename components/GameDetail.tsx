
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Game, Comment } from '../types';
import { Download, HardDrive, Calendar, Gamepad2, Layers, ShieldCheck, MessageSquare, Send, User, Globe, Star, Pencil, Trash2, Sparkles, Image as ImageIcon, X, AlertTriangle, Crown, Ban, CornerDownRight, ChevronDown, CheckCircle2, Lock, Unlock, Timer, Loader2, ChevronRight, Home, Share2, Facebook, Twitter, Youtube, MonitorPlay } from 'lucide-react';
import SEO from './SEO';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from './Toast';
import { CONSOLE_EMULATORS } from '../constants';

interface GameDetailProps {
  game: Game;
  allGames: Game[];
  onBack: () => void;
  onSelectGame: (game: Game) => void;
  onSelectConsole: (console: string) => void;
  onHome: () => void;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onReport: (gameId: string, title: string, reason: string, description: string) => void;
  isLoggedIn: boolean;
}

const FORBIDDEN_WORDS = [
    'http://', 'https://', 'www.', '.com', '.net', '.org', 'whatsapp', 'telegram', 'ganar dinero', 'free money', 'crypto',
    'puto', 'puta', 'mierda', 'pendejo', 'estupido', 'idiota', 'cabron', 'verga', 'zorra', 'maldito', 'imbecil', 'basura', 'chinguen', 'joder',
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'scam'
];

const getYoutubeId = (text: string) => {
  if (!text) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(regex);
  return match ? match[1] : null;
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

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
      <div 
          className={`flex gap-4 p-4 rounded-2xl border ${
              comment.isAdmin 
              ? 'bg-primary/5 border-primary/50' 
              : 'bg-surface border-border-color/50'
          }`}
      >
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              comment.isAdmin ? 'bg-primary text-black' : 'bg-gray-100 text-text-muted'
          }`}>
            {comment.isAdmin ? <ShieldCheck size={20} /> : <User size={20} />}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${comment.isAdmin ? 'text-text-main flex items-center gap-1' : 'text-text-main'}`}>
                  {comment.user}
                  {comment.isAdmin && <span className="bg-primary text-[10px] px-1.5 py-0.5 rounded text-black font-bold uppercase">Admin</span>}
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

          {isReplying && (
              <div className="mt-4 p-4 bg-background rounded-xl border border-border-color animate-fade-in">
                  <div className="flex flex-col gap-3">
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
                              className="text-xs font-bold bg-primary hover:bg-primary-hover text-black px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
                          >
                              Enviar Respuesta
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>

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

const GameDetail: React.FC<GameDetailProps> = ({ game, allGames, onBack, onSelectGame, onSelectConsole, onHome, onEdit, onDelete, onReport, isLoggedIn }) => {
  const { toast } = useToast();
  const [localComments, setLocalComments] = useState<Comment[]>(game.comments || []);
  const [localRating, setLocalRating] = useState(game.rating || 0);
  const [localVoteCount, setLocalVoteCount] = useState(game.voteCount || 0);
  
  useEffect(() => {
    setLocalComments(game.comments || []);
    setLocalRating(game.rating || 0);
    setLocalVoteCount(game.voteCount || 0);
  }, [game.comments, game.rating, game.voteCount]);

  const youtubeVideoId = useMemo(() => getYoutubeId(game.description), [game.description]);

  const cleanDescription = useMemo(() => {
      if (!game.description) return '';
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      return game.description.replace(regex, '').trim();
  }, [game.description]);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isAdminComment, setIsAdminComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<'Link Caído' | 'Imagen Rota' | 'Información Incorrecta' | 'Otro'>('Link Caído');
  const [reportDescription, setReportDescription] = useState('');
  const reportBtnRef = useRef<HTMLButtonElement>(null);
  const [modalPos, setModalPos] = useState<{bottom: number} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadTimer, setDownloadTimer] = useState(5);
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  useEffect(() => {
    const storageKey = `rated_${game.id}`;
    if (localStorage.getItem(storageKey)) {
        setHasRated(true);
    } else {
        setHasRated(false);
    }
    setRatingMessage('');
  }, [game.id]);

  useEffect(() => {
    let interval: number;
    if (isDownloadModalOpen && downloadTimer > 0) {
        interval = window.setInterval(() => {
            setDownloadTimer(prev => prev - 1);
        }, 1000);
    } else if (downloadTimer === 0) {
        setIsDownloadReady(true);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isDownloadModalOpen, downloadTimer]);

  const relatedGames = useMemo(() => {
    const sameConsoleGames = allGames.filter(g => g.console === game.console && g.id !== game.id);
    const shuffled = [...sameConsoleGames].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [game, allGames]);

  const emulators = useMemo(() => {
    const raw = CONSOLE_EMULATORS[game.console] || null;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [game.console]);

  const addReplyToTree = (nodes: Comment[], parentId: string, reply: Comment): Comment[] => {
    const hasDescendant = (n: Comment, id: string): boolean => {
        if (n.id === id) return true;
        if (n.replies) return n.replies.some(r => hasDescendant(r, id));
        return false;
    };
    return nodes.map(node => {
      if (hasDescendant(node, parentId)) {
        return { ...node, replies: [...(node.replies || []), reply] };
      }
      return node;
    });
  };

  const validateContent = (text: string, name: string, isAdmin: boolean) => {
    if (isAdmin) return true;
    const lowerText = text.toLowerCase();
    const lowerName = name.toLowerCase();
    const foundBadWord = FORBIDDEN_WORDS.find(word => lowerText.includes(word) || lowerName.includes(word));
    return !foundBadWord;
  };

  const saveCommentsToFirestore = async (newComments: Comment[]) => {
      setLocalComments(newComments);
      try {
          const gameRef = doc(db, 'games', game.id);
          await updateDoc(gameRef, { comments: newComments });
      } catch (error: any) {
          if (error.code === 'permission-denied') {
             toast.success("Comentario publicado", "Modo invitado.");
          } else {
             setCommentError('Hubo un error de conexión.');
          }
      }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : newCommentName;
    if (!userName.trim() || !newCommentText.trim()) return;
    if (!validateContent(newCommentText, userName, isLoggedIn && isAdminComment)) {
        setCommentError('Contenido no permitido.');
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
    const updatedComments = [comment, ...localComments];
    await saveCommentsToFirestore(updatedComments);
    setNewCommentText('');
    if (!isAdminComment) setNewCommentName('');
  };

  const handlePostReply = async (parentId: string, replyToUser?: string) => {
      setCommentError('');
      const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : replyName;
      if (!userName.trim() || !replyText.trim()) return;
      if (!validateContent(replyText, userName, isLoggedIn && isAdminComment)) {
        toast.warning("Contenido no permitido");
        return;
      }
      let finalContent = replyText;
      if (replyToUser) finalContent = `@${replyToUser} ${replyText}`;
      const reply: Comment = {
          id: Date.now().toString(),
          user: userName,
          date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          content: finalContent,
          isAdmin: (isLoggedIn && isAdminComment),
          replies: []
      };
      const updatedComments = addReplyToTree(localComments, parentId, reply);
      await saveCommentsToFirestore(updatedComments);
      setReplyingToId(null);
      setReplyText('');
      if(!isAdminComment) setReplyName('');
  };

  const handleRateGame = async (score: number) => {
    if (hasRated) return;
    const currentCount = localVoteCount;
    const currentRating = localRating;
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + score) / newCount;
    const finalRating = parseFloat(newRating.toFixed(1));
    setLocalRating(finalRating);
    setLocalVoteCount(newCount);
    setHasRated(true);
    setRatingMessage('¡Gracias por calificar!');
    localStorage.setItem(`rated_${game.id}`, 'true');
    try {
        const gameRef = doc(db, 'games', game.id);
        await updateDoc(gameRef, { rating: finalRating, voteCount: newCount });
    } catch (error: any) {}
    setHoverRating(0);
  };

  const initiateDownload = () => {
      if (game.downloadUrl) {
          setIsDownloadModalOpen(true);
          setDownloadTimer(5);
          setIsDownloadReady(false);
      }
  };

  const handleFinalDownload = () => {
      if (game.downloadUrl) {
          try {
              const gameRef = doc(db, 'games', game.id);
              updateDoc(gameRef, { downloads: (game.downloads || 0) + 1 }).catch(() => {});
          } catch(e) {}
          window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
          setIsDownloadModalOpen(false);
      }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
      e.preventDefault();
      onReport(game.id, game.title, reportReason, reportDescription);
      setIsReportModalOpen(false);
      setReportDescription('');
  };

  const shareTitle = `${game.title} (${game.console} - ${game.year})`;
  const shareUrl = window.location.href;
  const fullShareText = `🎮 Mira este juego en ZonaGM: ${shareTitle}.`;

  return (
    <>
      <SEO 
        title={`Descargar ${game.title} (${game.year}) - ${game.console}`}
        description={`Descarga segura de ${game.title} para ${game.console}.`}
        image={game.imageUrl}
        url={shareUrl}
      />

      {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
              <div className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-red-200 text-center animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={32} className="mx-auto mb-4 text-red-600" />
                  <h3 className="text-xl font-bold text-text-main mb-2">¿Eliminar Juego?</h3>
                  <p className="text-text-muted mb-6">Esta acción es irreversible.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-border-color font-bold text-text-muted hover:bg-gray-100 transition-colors">Cancelar</button>
                      <button onClick={() => { onDelete(game.id); setIsDeleteModalOpen(false); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg transition-colors">Sí, Eliminar</button>
                  </div>
              </div>
          </div>
      )}

      {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsDownloadModalOpen(false)}>
              <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border-color relative overflow-hidden animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setIsDownloadModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-main"><X size={24} /></button>
                  <div className="flex flex-col items-center text-center space-y-6">
                      {!isDownloadReady ? (
                          <>
                              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                                  <Lock size={40} className="text-primary animate-pulse" />
                                  <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                              </div>
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-bold text-text-main">Generando Enlace Seguro</h3>
                                  <p className="text-text-muted">Por favor espere...</p>
                              </div>
                              <div className="flex items-center gap-3 text-4xl font-mono font-bold text-text-main">
                                  <Timer size={32} className="text-text-muted" />
                                  <span>0:0{downloadTimer}</span>
                              </div>
                          </>
                      ) : (
                          <>
                               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-zoom-in">
                                  <Unlock size={40} className="text-green-600 animate-pulse" />
                              </div>
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-bold text-text-main">¡Enlace Listo!</h3>
                                  <p className="text-text-muted">El archivo está listo.</p>
                              </div>
                              <button onClick={handleFinalDownload} className="w-full bg-primary hover:bg-primary-hover text-black text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 animate-slide-in-up">
                                  <Download size={24} strokeWidth={2.5} />
                                  <span>Ir al Servidor</span>
                              </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {isReportModalOpen && (
          <div className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm p-4 animate-fade-in ${modalPos ? '' : 'flex items-center justify-center'}`} onClick={() => setIsReportModalOpen(false)}>
              <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-color animate-zoom-in relative mx-auto" onClick={(e) => e.stopPropagation()} style={modalPos ? { position: 'absolute', bottom: modalPos.bottom, left: 0, right: 0, width: 'calc(100% - 2rem)' } : {}}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                          <AlertTriangle size={24} className="text-red-500" /> Reportar Problema
                      </h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="text-text-muted hover:text-text-main"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-text-muted mb-2">Motivo</label>
                          <select value={reportReason} onChange={(e) => setReportReason(e.target.value as any)} className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none">
                              <option value="Link Caído">Link Caído</option>
                              <option value="Imagen Rota">Imagen Rota</option>
                              <option value="Información Incorrecta">Información Incorrecta</option>
                              <option value="Otro">Otro</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-text-muted mb-2">Detalles</label>
                          <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows={3} placeholder="Describa el problema..." className="w-full bg-background border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none resize-none" />
                      </div>
                      <div className="pt-2 flex gap-3">
                          <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border-color font-bold text-text-muted hover:bg-gray-100">Cancelar</button>
                          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg">Enviar Reporte</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {selectedScreenshot && (
        <div className="fixed inset-0 z-[5000] bg-black/98 flex items-center justify-center animate-fade-in cursor-zoom-out" onClick={() => setSelectedScreenshot(null)} style={{ touchAction: 'none' }}>
            <div className="w-full h-full p-2 flex items-center justify-center">
                <img src={selectedScreenshot} alt="Screenshot" className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()} />
            </div>
            <p className="absolute bottom-8 text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse pointer-events-none">Haz clic fuera para cerrar</p>
        </div>
      )}

      <div className="w-full max-w-[1000px] animate-slide-in-up duration-500">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4 overflow-x-auto whitespace-nowrap px-1">
            <button 
                onClick={(e) => { e.preventDefault(); onHome(); }} 
                className="flex items-center gap-1 hover:text-primary-hover transition-colors"
            >
                <Home size={14} /> Inicio
            </button>
            <ChevronRight size={14} className="opacity-50" />
            <button 
                onClick={(e) => { e.preventDefault(); onSelectConsole(game.console); }} 
                className="hover:text-primary-hover transition-colors font-medium"
            >
                {game.console}
            </button>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-text-main font-bold truncate">{game.title}</span>
        </nav>

        {isLoggedIn && (
            <div className="flex items-center justify-end mb-6">
                <div className="flex gap-2">
                    <button onClick={() => onEdit(game)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border-color hover:border-primary hover:text-primary transition-all text-sm font-medium"><Pencil size={16} /><span className="hidden sm:inline">Edit</span></button>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border-color hover:border-red-500 hover:text-red-500 transition-all text-sm font-medium"><Trash2 size={16} /><span className="hidden sm:inline">Delete</span></button>
                </div>
            </div>
        )}

        <article className="bg-surface rounded-3xl border border-border-color overflow-hidden shadow-soft mb-8">
            <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900">
            <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{game.console}</span>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{game.year}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">{game.title}</h1>
                <p className="text-gray-300 font-medium text-lg drop-shadow-sm">{game.publisher}</p>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
            <div className="md:col-span-2 space-y-8">
                <section>
                <h2 className="text-2xl font-bold text-text-main mb-6">Sobre este juego</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="shrink-0 mx-auto sm:mx-0 w-full max-w-[200px]">
                    <img src={game.imageUrl} alt={game.title} className="w-full h-auto rounded-xl shadow-md border border-border-color" />
                    </div>
                    <div className="flex-1">
                        <p className="text-text-muted leading-relaxed text-lg whitespace-pre-wrap text-justify">{cleanDescription}</p>
                    </div>
                </div>
                </section>

                {youtubeVideoId && (
                    <section>
                        <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2"><Youtube size={24} className="text-red-600" /> Trailer / Gameplay</h3>
                        <div className="rounded-xl overflow-hidden shadow-lg border border-border-color bg-black aspect-video relative group">
                            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${youtubeVideoId}`} title="YouTube player" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                    </section>
                )}

                {game.screenshots && game.screenshots.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-primary-hover" /> Galería</h3>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {game.screenshots.map((screen, idx) => (
                                <div key={idx} onClick={() => setSelectedScreenshot(screen)} className="aspect-video rounded-xl bg-gray-100 overflow-hidden border border-border-color cursor-pointer group relative">
                                    <img src={screen} alt="Screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <div className="md:col-span-1 space-y-6">
                <div className="bg-background rounded-2xl p-6 border border-border-color space-y-4 text-sm">
                <h3 className="font-bold text-text-main text-lg mb-2">Información</h3>
                <div className="flex items-center justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Tamaño</span><span className="text-text-main font-bold">{game.size}</span></div>
                <div className="flex items-center justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Idioma</span><div className="flex items-center gap-1">{game.languages.map(lang => (<span key={lang} className="text-lg">{lang === 'English' ? '🇺🇸' : lang === 'Spanish' ? '🇪🇸' : lang === 'Japanese' ? '🇯🇵' : '🌐'}</span>))}</div></div>
                <div className="flex items-center justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Formato</span><span className="text-text-main font-bold">{game.format}</span></div>
                <div className="flex items-center justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Plataforma</span><span className="text-text-main font-bold">{game.console}</span></div>
                <div className="flex items-center justify-between py-2"><span className="text-text-muted">Lanzamiento</span><span className="text-text-main font-bold">{game.year}</span></div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={initiateDownload} disabled={!game.downloadUrl} className={`w-full font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${game.downloadUrl ? 'bg-primary hover:bg-primary-hover text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>
                    <Download size={24} strokeWidth={2.5} /><span>{game.downloadUrl ? 'Descargar' : 'No Disponible'}</span>
                    </button>
                    <button ref={reportBtnRef} onClick={() => setIsReportModalOpen(true)} className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-text-muted hover:text-red-500 transition-colors text-xs font-bold"><AlertTriangle size={14} /><span>Reportar Problema</span></button>
                    {emulators.length > 0 && emulators.map((emu, index) => (
                        <a key={index} href={emu.url} target="_blank" rel="noopener noreferrer" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 text-sm"><MonitorPlay size={18} /><span>Emulador {emu.name}</span></a>
                    ))}
                </div>

                <div className="w-full bg-background rounded-2xl p-4 border border-border-color flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{hasRated ? 'Tu Calificación' : 'Calificar'}</span>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} disabled={hasRated} onMouseEnter={() => !hasRated && setHoverRating(star)} onMouseLeave={() => !hasRated && setHoverRating(0)} onClick={() => handleRateGame(star)} className={`${hasRated ? 'cursor-default' : 'transition-transform hover:scale-110'}`}><Star size={28} className={`${star <= (hoverRating || Math.round(localRating)) ? 'fill-primary text-primary' : 'text-gray-300 fill-gray-100'} transition-colors`} /></button>
                        ))}
                    </div>
                    <div className="text-2xl font-bold text-text-main flex items-baseline gap-1.5">{(localRating).toFixed(1)} <span className="text-sm text-text-muted font-normal">/ 5.0</span></div>
                    {ratingMessage && <div className="text-green-600 font-bold text-sm mt-1 animate-fade-in">{ratingMessage}</div>}
                </div>

                <div className="w-full bg-background rounded-2xl p-4 border border-border-color flex flex-col items-center justify-center gap-3">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wide flex items-center gap-1"><Share2 size={12} /> Compartir</span>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={20} /></a>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 text-black hover:bg-black hover:text-white transition-all"><Twitter size={20} /></a>
                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"><WhatsAppIcon /></a>
                    </div>
                </div>
            </div>
            </div>

            <div className="px-6 pb-6 md:px-10 md:pb-10">
                <section className="pt-8 border-t border-border-color">
                <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="w-full flex items-center justify-between mb-6 group">
                    <h3 className="text-2xl font-bold text-text-main flex items-center gap-2"><MessageSquare size={24} /> Comentarios <span className="text-base font-medium text-text-muted">({localComments.length})</span></h3>
                    <div className={`p-2 rounded-full bg-surface border border-border-color transition-transform duration-300 ${isCommentsOpen ? 'rotate-180 bg-gray-50' : ''}`}><ChevronDown size={20} /></div>
                </button>
                {isCommentsOpen && (
                    <div className="animate-slide-in-up duration-300">
                        <form onSubmit={handlePostComment} className="bg-background rounded-2xl p-6 border border-border-color mb-8 space-y-4">
                            {isLoggedIn && (<div className="flex items-center gap-2"><input type="checkbox" id="adminToggle" checked={isAdminComment} onChange={(e) => setIsAdminComment(e.target.checked)} className="accent-primary" /><label htmlFor="adminToggle" className="text-xs font-bold uppercase text-text-muted">Post as Admin</label></div>)}
                            <div><label className="block text-xs font-bold uppercase text-text-muted mb-2">Nickname</label><input type="text" value={(isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : newCommentName} onChange={(e) => { if(!(isLoggedIn && isAdminComment)) setNewCommentName(e.target.value); }} disabled={isLoggedIn && isAdminComment} className="w-full border rounded-lg px-4 py-2 text-text-main" /></div>
                            <div><label className="block text-xs font-bold uppercase text-text-muted mb-2">Mensaje</label><textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} rows={3} className="w-full bg-surface border rounded-lg px-4 py-2 resize-none" /></div>
                            {commentError && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">{commentError}</div>}
                            <div className="flex justify-end"><button type="submit" disabled={(!(isLoggedIn && isAdminComment) && !newCommentName.trim()) || !newCommentText.trim()} className="bg-primary hover:bg-primary-hover text-black font-bold px-6 py-2.5 rounded-full">Publicar</button></div>
                        </form>
                        <div className="space-y-4 mb-10">{localComments.length > 0 ? localComments.map((comment) => (<CommentNode key={comment.id} comment={comment} replyingToId={replyingToId} setReplyingToId={setReplyingToId} setCommentError={setCommentError} isLoggedIn={isLoggedIn} isAdminComment={isAdminComment} setIsAdminComment={setIsAdminComment} replyName={replyName} setReplyName={setReplyName} replyText={replyText} setReplyText={setReplyText} handlePostReply={handlePostReply} />)) : <div className="text-center py-8 text-text-muted italic">No hay comentarios aún.</div>}</div>
                    </div>
                )}
                </section>

                <section className="pt-8 border-t border-border-color">
                    <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Te pudiera interesar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {relatedGames.map(related => (
                            <div key={related.id} onClick={() => onSelectGame(related)} className="group cursor-pointer flex flex-col gap-2">
                                <div className="aspect-[3/4] w-full rounded-xl bg-gray-200 overflow-hidden relative border border-border-color group-hover:border-primary/50 transition-all">
                                    <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <h4 className="text-xs md:text-sm font-bold text-text-main line-clamp-2 group-hover:text-primary-hover transition-colors">{related.title}</h4>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </article>
      </div>
    </>
  );
};

export default GameDetail;
