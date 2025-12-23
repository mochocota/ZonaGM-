
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Game, Comment } from '../types';
import { Download, HardDrive, Calendar, Gamepad2, Layers, ShieldCheck, MessageSquare, Send, User, Globe, Star, Pencil, Trash2, Sparkles, Image as ImageIcon, X, AlertTriangle, CornerDownRight, ChevronDown, CheckCircle2, Lock, Unlock, Timer, ChevronRight, Home, Share2, Facebook, Twitter, Youtube, MonitorPlay } from 'lucide-react';
import SEO from './SEO';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from './Toast';
import { CONSOLE_EMULATORS } from '../constants';
import { fetchFreshAndroidLink } from '../services/scraper';

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

const FORBIDDEN_WORDS = ['http://', 'https://', 'www.', 'puto', 'mierda', 'scam'];

const getYoutubeId = (text: string) => {
  if (!text) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(regex);
  return match ? match[1] : null;
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

const CommentNode = ({ comment, replyingToId, setReplyingToId, isLoggedIn, isAdminComment, setIsAdminComment, replyName, setReplyName, replyText, setReplyText, handlePostReply }: any) => {
  const isReplying = replyingToId === comment.id;
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex gap-4 p-4 rounded-2xl border ${comment.isAdmin ? 'bg-primary/5 border-primary/50' : 'bg-surface border-border-color/50'}`}>
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comment.isAdmin ? 'bg-primary text-black' : 'bg-gray-100 text-text-muted'}`}>
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
            <button onClick={() => setReplyingToId(isReplying ? null : comment.id)} className="text-xs font-bold text-text-muted hover:text-primary-hover flex items-center gap-1"><CornerDownRight size={14} /> Responder</button>
          </div>
          <p className="leading-relaxed text-sm text-text-muted">{comment.content}</p>
          {isReplying && (
            <div className="mt-4 p-4 bg-background rounded-xl border border-border-color animate-fade-in">
                <div className="flex flex-col gap-3">
                  {!isLoggedIn && <input type="text" value={replyName} onChange={(e) => setReplyName(e.target.value)} placeholder="Tu Nickname" className="w-full bg-white border border-border-color rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />}
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Responder a ${comment.user}...`} rows={2} className="w-full bg-white border border-border-color rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyingToId(null)} className="text-xs font-bold text-text-muted px-3 py-1.5 hover:text-text-main">Cancelar</button>
                    <button onClick={() => handlePostReply(comment.id, comment.user)} className="text-xs font-bold bg-primary hover:bg-primary-hover text-black px-4 py-1.5 rounded-full transition-colors">Enviar Respuesta</button>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 border-border-color/60">
          {comment.replies.map((reply: any) => (
            <CommentNode key={reply.id} comment={reply} replyingToId={replyingToId} setReplyingToId={setReplyingToId} isLoggedIn={isLoggedIn} isAdminComment={isAdminComment} setIsAdminComment={setIsAdminComment} replyName={replyName} setReplyName={setReplyName} replyText={replyText} setReplyText={setReplyText} handlePostReply={handlePostReply} />
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
  
  // Download Dynamic Logic
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadTimer, setDownloadTimer] = useState(5);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [resolvedLink, setResolvedLink] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Form states
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isAdminComment, setIsAdminComment] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    setLocalComments(game.comments || []);
    setLocalRating(game.rating || 0);
    setLocalVoteCount(game.voteCount || 0);
  }, [game]);

  const youtubeVideoId = useMemo(() => getYoutubeId(game.description), [game.description]);
  const cleanDescription = useMemo(() => game.description?.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S+|youtu\.be\/\S+)/g, '').trim(), [game.description]);

  // Logic to resolve link during timer
  useEffect(() => {
    let interval: number;
    if (isDownloadModalOpen && downloadTimer > 0) {
        interval = window.setInterval(() => setDownloadTimer(prev => prev - 1), 1000);
        
        if (downloadTimer === 5 && game.downloadUrl?.includes('an1.com')) {
            setIsResolving(true);
            fetchFreshAndroidLink(game.downloadUrl).then(link => {
                setResolvedLink(link);
                setIsResolving(false);
            });
        }
    } else if (downloadTimer === 0) {
        setIsDownloadReady(true);
    }
    return () => clearInterval(interval);
  }, [isDownloadModalOpen, downloadTimer, game.downloadUrl]);

  const initiateDownload = () => {
      if (game.downloadUrl) {
          setIsDownloadModalOpen(true);
          setDownloadTimer(5);
          setIsDownloadReady(false);
          setResolvedLink(null);
      }
  };

  const handleFinalDownload = () => {
      let finalUrl = resolvedLink || game.downloadUrl;
      if (!finalUrl) return;

      const gameRef = doc(db, 'games', game.id);
      updateDoc(gameRef, { downloads: (game.downloads || 0) + 1 }).catch(() => {});

      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      setIsDownloadModalOpen(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : newCommentName;
    if (!userName.trim() || !newCommentText.trim()) return;
    const comment: Comment = { id: Date.now().toString(), user: userName, date: new Date().toLocaleDateString(), content: newCommentText, isAdmin: (isLoggedIn && isAdminComment), replies: [] };
    const updated = [comment, ...localComments];
    setLocalComments(updated);
    await updateDoc(doc(db, 'games', game.id), { comments: updated });
    setNewCommentText('');
  };

  const handlePostReply = async (parentId: string, replyToUser?: string) => {
      const userName = (isLoggedIn && isAdminComment) ? 'ZONA_ADMiN' : replyName;
      if (!userName.trim() || !replyText.trim()) return;
      const reply: Comment = { id: Date.now().toString(), user: userName, date: new Date().toLocaleDateString(), content: replyToUser ? `@${replyToUser} ${replyText}` : replyText, isAdmin: (isLoggedIn && isAdminComment), replies: [] };
      const updated = localComments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c);
      setLocalComments(updated);
      await updateDoc(doc(db, 'games', game.id), { comments: updated });
      setReplyingToId(null);
      setReplyText('');
  };

  const relatedGames = useMemo(() => allGames.filter(g => g.console === game.console && g.id !== game.id).sort(() => 0.5 - Math.random()).slice(0, 4), [game, allGames]);

  return (
    <>
      <SEO title={`Descargar ${game.title} - ${game.console}`} description={cleanDescription} image={game.imageUrl} />
      
      {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsDownloadModalOpen(false)}>
              <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border-color relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setIsDownloadModalOpen(false)} className="absolute top-4 right-4 text-text-muted"><X size={24} /></button>
                  <div className="flex flex-col items-center text-center space-y-6">
                      {!isDownloadReady ? (
                          <>
                              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                                  <Lock size={40} className="text-primary animate-pulse-fast" />
                                  <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                              </div>
                              <h3 className="text-2xl font-bold text-text-main">Generando Enlace Seguro</h3>
                              <div className="flex items-center gap-3 text-4xl font-mono font-bold text-text-main">
                                  <Timer size={32} className="text-text-muted" />
                                  <span>0:0{downloadTimer}</span>
                              </div>
                              {isResolving && <p className="text-xs text-primary-hover font-bold animate-pulse">Obteniendo enlace de descarga directo...</p>}
                          </>
                      ) : (
                          <>
                               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"><Unlock size={40} className="text-green-600" /></div>
                              <h3 className="text-2xl font-bold text-text-main">¡Enlace Listo!</h3>
                              <button onClick={handleFinalDownload} className="w-full bg-primary hover:bg-primary-hover text-black text-lg font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
                                  <Download size={24} strokeWidth={2.5} />
                                  <span>Descargar Ahora</span>
                              </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {selectedScreenshot && (
        <div className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center animate-fade-in" onClick={() => setSelectedScreenshot(null)}>
            <img src={selectedScreenshot} className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <div className="w-full max-w-[1000px] animate-slide-in-up">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <button onClick={onHome} className="flex items-center gap-1 hover:text-primary-hover"><Home size={14} /> Inicio</button>
            <ChevronRight size={14} />
            <button onClick={() => onSelectConsole(game.console)} className="hover:text-primary-hover">{game.console}</button>
            <ChevronRight size={14} />
            <span className="text-text-main font-bold truncate">{game.title}</span>
        </nav>

        {isLoggedIn && (
            <div className="flex justify-end gap-2 mb-6">
                <button onClick={() => onEdit(game)} className="px-4 py-2 rounded-full border border-border-color hover:border-primary flex items-center gap-2 text-sm font-medium"><Pencil size={16} /> Edit</button>
                <button onClick={() => onDelete(game.id)} className="px-4 py-2 rounded-full border border-border-color hover:border-red-500 hover:text-red-500 flex items-center gap-2 text-sm font-medium"><Trash2 size={16} /> Delete</button>
            </div>
        )}

        <article className="bg-surface rounded-3xl border border-border-color overflow-hidden shadow-soft mb-8">
            <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900">
                <img src={game.imageUrl} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                    <div className="flex gap-3 mb-4">
                        <span className="bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase">{game.console}</span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{game.year}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{game.title}</h1>
                    <p className="text-gray-300 font-medium text-lg">{game.publisher}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-6">Sobre este juego</h2>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <img src={game.imageUrl} className="w-full max-w-[200px] h-auto rounded-xl shadow-md" />
                            <p className="text-text-muted leading-relaxed text-lg whitespace-pre-wrap">{cleanDescription}</p>
                        </div>
                    </section>
                    {youtubeVideoId && (
                        <section>
                            <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2"><Youtube size={24} className="text-red-600" /> Trailer</h3>
                            <div className="rounded-xl overflow-hidden aspect-video bg-black">
                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeVideoId}`} allowFullScreen></iframe>
                            </div>
                        </section>
                    )}
                    {game.screenshots && game.screenshots.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2"><ImageIcon size={20} /> Galería</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {game.screenshots.map((s, i) => <img key={i} src={s} onClick={() => setSelectedScreenshot(s)} className="rounded-xl cursor-pointer hover:opacity-90 transition-opacity" />)}
                            </div>
                        </section>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="bg-background rounded-2xl p-6 border border-border-color space-y-4 text-sm font-medium">
                        <div className="flex justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Tamaño</span><span className="text-text-main font-bold">{game.size}</span></div>
                        <div className="flex justify-between py-2 border-b border-border-color/50"><span className="text-text-muted">Sistema</span><span className="text-text-main font-bold">{game.console}</span></div>
                        <div className="flex justify-between py-2"><span className="text-text-muted">Formato</span><span className="text-text-main font-bold">{game.format}</span></div>
                    </div>
                    <button onClick={initiateDownload} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3"><Download size={24} /> Descargar</button>
                    <div className="flex justify-center gap-4">
                        <a href="#" className="p-2 bg-[#1877F2]/10 text-[#1877F2] rounded-full"><Facebook size={20} /></a>
                        <a href={`https://api.whatsapp.com/send?text=${game.title}`} className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-full"><WhatsAppIcon /></a>
                    </div>
                </div>
            </div>
            <section className="p-6 md:p-10 border-t border-border-color">
                <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="w-full flex items-center justify-between mb-6 group">
                    <h3 className="text-2xl font-bold text-text-main flex items-center gap-2"><MessageSquare size={24} /> Comentarios ({localComments.length})</h3>
                    <ChevronDown className={`transition-transform ${isCommentsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCommentsOpen && (
                    <div className="space-y-6">
                         <form onSubmit={handlePostComment} className="bg-background rounded-2xl p-6 border border-border-color mb-8">
                            <div className="flex flex-col gap-4">
                            {!isLoggedIn && <input type="text" value={newCommentName} onChange={(e) => setNewCommentName(e.target.value)} placeholder="Tu Nickname" className="w-full bg-surface border border-border-color rounded-lg px-4 py-2" />}
                            <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Escribe un comentario..." rows={3} className="w-full bg-surface border border-border-color rounded-lg px-4 py-2 resize-none" />
                            <button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold px-6 py-2 rounded-full self-end">Publicar</button>
                            </div>
                        </form>
                        {localComments.map(c => (
                            <CommentNode key={c.id} comment={c} replyingToId={replyingToId} setReplyingToId={setReplyingToId} isLoggedIn={isLoggedIn} isAdminComment={isAdminComment} setIsAdminComment={setIsAdminComment} replyName={replyName} setReplyName={setReplyName} replyText={replyText} setReplyText={setReplyText} handlePostReply={handlePostReply} />
                        ))}
                    </div>
                )}
            </section>
        </article>
      </div>
    </>
  );
};

export default GameDetail;
