import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Library, Disc, Music, Search, PlusCircle,
  Play, SkipBack, SkipForward, Pause,
  Volume2, VolumeX, Menu, Heart, Shuffle, Repeat, Repeat1, ListMusic, X, LogOut
} from 'lucide-react';
import type { ViewState, Song } from '../types';
import type { AuthUser } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onSearch: (query: string) => void;
  onAddClick: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  getSongMeta: (song: Song) => { artistName: string; coverUrl: string };
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite?: () => void;
  queue: Song[];
  onPlayFromQueue: (song: Song) => void;
  shuffleMode: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  user: AuthUser;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children, currentView, onNavigate, onSearch, onAddClick,
  currentSong, isPlaying, onTogglePlay, getSongMeta,
  onNext, onPrev, onToggleFavorite,
  queue, onPlayFromQueue, shuffleMode, repeatMode,
  onToggleShuffle, onToggleRepeat,
  user, onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showQueue, setShowQueue] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<HTMLSpanElement | null>(null);

  const songMeta = currentSong ? getSongMeta(currentSong) : null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    if (currentSong && currentSong.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentSong.audioUrl);
        audioRef.current.volume = volume / 100;

        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            const pct = (time / duration) * 100;
            // Actualizamos el DOM directamente para no causar re-render
            if (progressBarRef.current) progressBarRef.current.style.width = `${pct}%`;
            if (currentTimeRef.current) currentTimeRef.current.textContent = formatTime(time);
          }
        };
        audioRef.current.onended = () => {
          if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else {
            onNext();
          }
        };
      } else if (audioRef.current.src !== currentSong.audioUrl) {
        audioRef.current.pause();
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.currentTime = 0;
        // Volver a registrar onended con el modo de repeticion actual
        audioRef.current.onended = () => {
          if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else {
            onNext();
          }
        };
      }

      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error play:", e));
      } else {
        audioRef.current.pause();
      }
    } else {
      if (audioRef.current) audioRef.current.pause();
    }
  }, [currentSong, isPlaying]);

  // Actualizar el handler de onended cuando cambia el modo de repeticion
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (repeatMode === 'one' && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } else {
          onNext();
        }
      };
    }
  }, [repeatMode, onNext]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => { onNavigate(view); setIsMobileMenuOpen(false); }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === view
          ? 'bg-primary/20 text-primary border-r-4 border-primary'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="flex h-screen w-full bg-dark text-slate-100 overflow-hidden font-sans">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-surface border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
            <Music size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Seve<span className="text-primary">Rhythm</span></h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem view="DASHBOARD" icon={Home} label="Inicio" />
          <NavItem view="SEARCH_RESULTS" icon={Search} label="Buscar" />
          <div className="mt-8 px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mi Biblioteca</div>
          <NavItem view="ARTISTS" icon={Library} label="Artistas" />
          <NavItem view="ALBUMS" icon={Disc} label="Álbumes" />
          <NavItem view="SONGS" icon={Music} label="Canciones" />
          <NavItem view="FAVORITES" icon={Heart} label="Favoritas" />
          <NavItem view="PLAYLISTS" icon={ListMusic} label="Playlists" />
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 px-4 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.displayName || user.username}</p>
              <p className="text-slate-500 text-xs truncate">@{user.username}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-2 w-full transition-colors">
            <LogOut size={18} /><span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300"><Menu size={24} /></button>
          </div>
          <div className="flex-1 max-w-xl ml-4 md:ml-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input type="text" placeholder="Buscar artistas, álbumes o canciones..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-full bg-surface text-slate-300 focus:outline-none focus:border-primary sm:text-sm transition-all"
                onChange={(e) => onSearch(e.target.value)} onClick={() => onNavigate('SEARCH_RESULTS')} />
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <button onClick={onAddClick} className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
              <PlusCircle size={16} /><span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Panel de cola de reproduccion */}
        {showQueue && currentSong && (
          <div className="fixed right-0 bottom-24 w-80 max-h-[60vh] bg-surface border border-slate-700 rounded-tl-xl shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h4 className="text-white font-bold text-sm">Cola de reproducción</h4>
              <button onClick={() => setShowQueue(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {queue.map((song, i) => {
                const meta = getSongMeta(song);
                const isCurrent = song.id === currentSong?.id;
                return (
                  <button key={song.id} onClick={() => onPlayFromQueue(song)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${isCurrent ? 'bg-primary/10' : ''}`}>
                    <span className={`text-xs w-5 text-right flex-shrink-0 ${isCurrent ? 'text-primary font-bold' : 'text-slate-500'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? 'text-primary font-medium' : 'text-white'}`}>{song.title}</p>
                      <p className="text-xs text-slate-500 truncate">{meta.artistName}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{song.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reproductor en el footer */}
        <footer className="fixed bottom-0 right-0 left-0 md:left-64 h-24 bg-surface/95 backdrop-blur-lg border-t border-slate-700/50 px-6 flex items-center justify-between z-40">
          {currentSong && songMeta ? (
            <>
              <div className="flex items-center space-x-4 w-1/3">
                <div className="w-14 h-14 bg-slate-700 rounded-md overflow-hidden shadow-md flex-shrink-0">
                  <img src={songMeta.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{songMeta.artistName}</p>
                </div>
                {onToggleFavorite && (
                  <button onClick={onToggleFavorite}
                    className={`transition-colors ${currentSong.isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
                    <Heart size={16} fill={currentSong.isFavorite ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center space-x-4 mb-2">
                  <button onClick={onToggleShuffle}
                    className={`transition-colors ${shuffleMode ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                    title={shuffleMode ? 'Aleatorio: ON' : 'Aleatorio: OFF'}>
                    <Shuffle size={16} />
                  </button>
                  <button onClick={onPrev} className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
                  <button onClick={onTogglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg">
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={onNext} className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
                  <button onClick={onToggleRepeat}
                    className={`transition-colors ${repeatMode !== 'off' ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                    title={repeatMode === 'off' ? 'Repetir: OFF' : repeatMode === 'all' ? 'Repetir: Todas' : 'Repetir: Una'}>
                    <RepeatIcon size={16} />
                  </button>
                </div>
                <div className="w-full max-w-md flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <span ref={currentTimeRef}>0:00</span>
                  <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group" onClick={handleSeek}>
                    <div ref={progressBarRef} className="h-full bg-primary group-hover:bg-indigo-400 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span>{currentSong.duration}</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 w-1/3">
                <button onClick={() => setShowQueue(!showQueue)}
                  className={`transition-colors ${showQueue ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                  title="Cola de reproducción">
                  <ListMusic size={18} />
                </button>
                <button onClick={() => setVolume(v => v > 0 ? 0 : 50)} className="text-slate-400 hover:text-white">
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="w-24 h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
                }}>
                  <div className="h-full bg-slate-400 group-hover:bg-primary transition-colors" style={{ width: `${volume}%` }}></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center items-center text-slate-500 text-sm italic">Selecciona una canción para comenzar</div>
          )}
        </footer>
      </div>
    </div>
  );
};
