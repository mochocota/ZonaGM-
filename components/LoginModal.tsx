import React, { useState, useEffect } from 'react';
import { X, Lock, User, LogIn, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from './Toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (status: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin(true);
        toast.success("Bienvenido Admin", "Has iniciado sesión correctamente.");
        onClose();
    } catch (err: any) {
        console.error("Login failed", err);
        setError('Error: Credenciales inválidas o usuario no encontrado.');
        toast.error("Error de Acceso", "Credenciales inválidas.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl border border-border-color p-8 relative animate-zoom-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary-hover mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-main">Acceso Admin</h2>
          <p className="text-text-muted text-sm text-center">Ingresa tus credenciales para gestionar el sitio.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="email" 
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-background border border-border-color rounded-xl pl-10 pr-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-background border border-border-color rounded-xl pl-10 pr-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium text-center border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-text-main font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span>{isLoading ? 'Ingresando...' : 'Ingresar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;