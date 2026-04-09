import React, { useState } from 'react';
import { Music, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { AuthUser } from '../services/api';
import { authApi } from '../services/api';

interface AuthPageProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const { user } = await authApi.login(username, password);
        onAuthenticated(user);
      } else {
        if (password.length < 4) {
          setError('La contraseña debe tener al menos 4 caracteres');
          setIsLoading(false);
          return;
        }
        const { user } = await authApi.register(username, email, password, displayName || username);
        onAuthenticated(user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const inputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      {/* Decoracion de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo de la app */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Seve<span className="text-primary">Rhythm</span>
          </h1>
          <p className="text-slate-400 mt-2">Tu biblioteca musical personal</p>
        </div>

        {/* Formulario */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Usuario
              </label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Nombre para mostrar
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Cómo quieres que te llamemos (opcional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`${inputClass} pr-12`}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-white font-bold text-sm transition-all ${
                isLoading
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-primary hover:bg-indigo-600 shadow-lg shadow-primary/20 hover:shadow-primary/40'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isLogin ? 'Entrando...' : 'Creando cuenta...'}</span>
                </span>
              ) : (
                isLogin ? 'Entrar' : 'Crear cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={switchMode}
                className="text-primary hover:text-indigo-400 font-medium ml-1 transition-colors"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          SeveRhythm &copy; 2026 — Trabajo de Fin de Grado
        </p>
      </div>
    </div>
  );
};
