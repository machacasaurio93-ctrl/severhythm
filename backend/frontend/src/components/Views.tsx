import React, { useState, useEffect } from 'react';
import { Users, Disc, Music, Heart, Clock, PlayCircle, PauseCircle, Trash2, Edit3, ArrowLeft, Play } from 'lucide-react';
import type { Artist, Album, Song, ViewState } from '../types';

// --- UTILIDADES ---
const getArtistName = (id: string | null | undefined, artists: Artist[]) => {
  if (!id) return 'Sin artista';
  return artists.find(a => a.id === id)?.name || 'Sin artista';
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-surface border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all ${className}`}>
    {children}
  </div>
);

// --- PANEL PRINCIPAL ---
interface DashboardProps {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  onNavigate: (view: ViewState) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ artists, albums, songs, onNavigate }) => {
  const stats = [
    { icon: Users, label: 'Artistas', value: artists.length, color: 'bg-blue-500 text-blue-500', view: 'ARTISTS' as ViewState },
    { icon: Disc, label: 'Álbumes', value: albums.length, color: 'bg-purple-500 text-purple-500', view: 'ALBUMS' as ViewState },
    { icon: Music, label: 'Canciones', value: songs.length, color: 'bg-pink-500 text-pink-500', view: 'SONGS' as ViewState },
    { icon: Heart, label: 'Favoritas', value: songs.filter(s => s.isFavorite).length, color: 'bg-red-500 text-red-500', view: 'FAVORITES' as ViewState },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle title="Bienvenido a SeveRhythm" subtitle="Resumen de tu biblioteca musical" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, label, value, color, view }) => (
          <div key={label} onClick={() => onNavigate(view)}
            className="bg-surface p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-primary transition-colors">{value}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}><Icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>
      {/* Mas reproducidas */}
      {songs.filter(s => s.plays > 0).length > 0 && (
        <div>
          <SectionTitle title="Más reproducidas" subtitle="Las canciones con más reproducciones" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.sort((a, b) => b.plays - a.plays).slice(0, 6).map(song => {
              return (
                <Card key={song.id} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Play size={16} className="text-primary ml-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-slate-400 text-xs">{song.plays.toLocaleString()} reproducciones</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- LISTA DE ARTISTAS ---
interface ArtistListProps {
  artists: Artist[];
  onDelete: (id: string) => void;
  onEdit: (artist: Artist) => void;
  onSelect: (id: string) => void;
}

export const ArtistList: React.FC<ArtistListProps> = ({ artists, onDelete, onEdit, onSelect }) => (
  <div>
    <SectionTitle title="Artistas" subtitle={`${artists.length} artistas en tu biblioteca`} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <Card key={artist.id} className="group cursor-pointer" >
          <div className="flex items-center space-x-4" onClick={() => onSelect(artist.id)}>
            <img src={artist.imageUrl} alt={artist.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors" />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{artist.name}</h3>
              <p className="text-slate-400 text-xs truncate">{artist.genre}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={(e) => { e.stopPropagation(); onEdit(artist); }}
              className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded transition-colors text-xs flex items-center justify-center">
              <Edit3 size={14} className="mr-1" /> Editar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(artist.id); }}
              className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors text-xs flex items-center justify-center">
              <Trash2 size={14} className="mr-1" /> Eliminar
            </button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// --- LISTA DE ALBUMES ---
interface AlbumListProps {
  albums: Album[];
  artists: Artist[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({ albums, artists, onDelete, onSelect }) => (
  <div>
    <SectionTitle title="Álbumes" subtitle={`${albums.length} álbumes en tu biblioteca`} />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {albums.map((album) => (
        <div key={album.id} className="group cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden relative mb-3 shadow-lg bg-slate-800" onClick={() => onSelect(album.id)}>
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); onDelete(album.id); }}
                className="opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <h3 className="text-white font-medium text-sm truncate group-hover:text-primary transition-colors">{album.title}</h3>
          <p className="text-slate-500 text-xs truncate">{getArtistName(album.artistId, artists)} &bull; {album.year}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- LISTA DE CANCIONES ---
interface SongListProps {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  onToggleFav: (id: string) => void;
  onPlay: (song: Song) => void;
  onDelete: (id: string) => void;
  currentSongId?: string;
  isPlaying: boolean;
  title?: string;
  subtitle?: string;
}

export const SongList: React.FC<SongListProps> = ({
  songs, artists, onToggleFav, onPlay, onDelete,
  currentSongId, isPlaying, title = "Canciones", subtitle
}) => (
  <div>
    <SectionTitle title={title} subtitle={subtitle || `${songs.length} canciones`} />
    <div className="bg-surface border border-slate-700/50 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[600px]">
        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-4 w-10">#</th>
            <th className="px-6 py-4">Título</th>
            <th className="px-6 py-4">Artista</th>
            <th className="px-6 py-4 text-center"><Clock size={14} /></th>
            <th className="px-6 py-4 text-center">Fav</th>
            <th className="px-6 py-4 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {songs.map((song, i) => {
            const isCurrent = currentSongId === song.id;
            return (
              <tr key={song.id} className={`hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-primary/10' : ''}`}>
                <td className="px-6 py-4 text-slate-500">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <span className={`group-hover:hidden ${isCurrent ? 'text-primary font-bold' : ''}`}>{i + 1}</span>
                    <button onClick={() => onPlay(song)} className="absolute inset-0 hidden group-hover:flex items-center justify-center text-primary">
                      {isCurrent && isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                    </button>
                  </div>
                </td>
                <td className={`px-6 py-4 font-medium ${isCurrent ? 'text-primary' : 'text-slate-200'}`}>{song.title}</td>
                <td className="px-6 py-4 text-slate-400">{getArtistName(song.artistId, artists)}</td>
                <td className="px-6 py-4 text-slate-400 text-center font-mono text-xs">{song.duration}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onToggleFav(song.id)}>
                    <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"}
                      className={`${song.isFavorite ? 'text-red-500' : 'text-slate-600 hover:text-slate-400'} transition-colors`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => onDelete(song.id)}
                    className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {songs.length === 0 && (
        <div className="text-center py-12 text-slate-500">No hay canciones para mostrar</div>
      )}
    </div>
  </div>
);

// --- DETALLE DE ARTISTA ---
interface ArtistDetailProps {
  artist: Artist;
  albums: Album[];
  songs: Song[];
  allArtists: Artist[];
  onEdit: (artist: Artist) => void;
  onDelete: (id: string) => void;
  onSelectAlbum: (id: string) => void;
  onPlay: (song: Song) => void;
  onToggleFav: (id: string) => void;
  currentSongId?: string;
  isPlaying: boolean;
  onBack: () => void;
}

export const ArtistDetailView: React.FC<ArtistDetailProps> = ({
  artist, albums, songs, onEdit, onDelete, onSelectAlbum,
  onPlay, onToggleFav, currentSongId, isPlaying, onBack
}) => (
  <div className="space-y-8 animate-fade-in">
    <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
      <ArrowLeft size={20} /><span>Volver</span>
    </button>
    {/* Cabecera del artista */}
    <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-8">
      <img src={artist.imageUrl} alt={artist.name}
        className="w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-primary/30" />
      <div className="flex-1">
        <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Artista</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mt-1">{artist.name}</h1>
        <p className="text-slate-400 mt-2">{artist.genre}</p>
        {artist.bio && <p className="text-slate-500 mt-2 text-sm max-w-xl">{artist.bio}</p>}
        <div className="flex items-center space-x-3 mt-4">
          <span className="text-sm text-slate-400">{albums.length} álbumes &bull; {songs.length} canciones</span>
          <button onClick={() => onEdit(artist)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-full transition-colors">
            <Edit3 size={12} className="inline mr-1" />Editar
          </button>
          <button onClick={() => onDelete(artist.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-full transition-colors">
            <Trash2 size={12} className="inline mr-1" />Eliminar
          </button>
        </div>
      </div>
    </div>
    {/* Álbumes del artista */}
    {albums.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Álbumes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {albums.map(album => (
            <div key={album.id} className="group cursor-pointer" onClick={() => onSelectAlbum(album.id)}>
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-slate-800 mb-2">
                <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">{album.title}</p>
              <p className="text-slate-500 text-xs">{album.year}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {/* Canciones del artista */}
    {songs.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Canciones</h3>
        <div className="bg-surface border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-700/50">
              {songs.map((song, i) => {
                const isCurrent = currentSongId === song.id;
                return (
                  <tr key={song.id} className={`hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-primary/10' : ''}`}>
                    <td className="px-6 py-3 text-slate-500 w-10">
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <span className={`group-hover:hidden ${isCurrent ? 'text-primary font-bold' : ''}`}>{i + 1}</span>
                        <button onClick={() => onPlay(song)} className="absolute inset-0 hidden group-hover:flex items-center justify-center text-primary">
                          {isCurrent && isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-3 font-medium ${isCurrent ? 'text-primary' : 'text-slate-200'}`}>{song.title}</td>
                    <td className="px-6 py-3 text-slate-400 font-mono text-xs">{song.duration}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => onToggleFav(song.id)}>
                        <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"}
                          className={`${song.isFavorite ? 'text-red-500' : 'text-slate-600'} transition-colors`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

// --- DETALLE DE ALBUM ---
interface AlbumDetailProps {
  album: Album;
  songs: Song[];
  artist: Artist | null;
  allArtists: Artist[];
  allAlbums: Album[];
  onEdit: (album: Album) => void;
  onDelete: (id: string) => void;
  onDeleteSong: (id: string) => void;
  onPlay: (song: Song) => void;
  onToggleFav: (id: string) => void;
  currentSongId?: string;
  isPlaying: boolean;
  onBack: () => void;
  onSelectArtist: (id: string) => void;
}

export const AlbumDetailView: React.FC<AlbumDetailProps> = ({
  album, songs, artist, onEdit, onDelete, onDeleteSong,
  onPlay, onToggleFav, currentSongId, isPlaying, onBack, onSelectArtist
}) => {
  const totalDuration = songs.reduce((acc, s) => {
    const parts = (s.duration || '0:00').split(':');
    return acc + (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  }, 0);
  const durationMin = Math.floor(totalDuration / 60);

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /><span>Volver</span>
      </button>
      <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-8">
        <div className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Álbum</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-1">{album.title}</h1>
          <div className="flex items-center space-x-2 mt-2 text-slate-400 text-sm">
            {artist && (
              <button onClick={() => onSelectArtist(artist.id)} className="text-white font-medium hover:text-primary hover:underline transition-colors">
                {artist.name}
              </button>
            )}
            <span>&bull;</span>
            <span>{album.year}</span>
            <span>&bull;</span>
            <span>{songs.length} canciones, {durationMin} min</span>
          </div>
          {album.genre && <p className="text-slate-500 text-sm mt-1">{album.genre}</p>}
          <div className="flex items-center space-x-3 mt-4">
            {songs.length > 0 && (
              <button onClick={() => onPlay(songs[0])}
                className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                <Play size={16} fill="currentColor" /><span>Reproducir</span>
              </button>
            )}
            <button onClick={() => onEdit(album)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-full transition-colors">
              <Edit3 size={12} className="inline mr-1" />Editar
            </button>
            <button onClick={() => onDelete(album.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-full transition-colors">
              <Trash2 size={12} className="inline mr-1" />Eliminar
            </button>
          </div>
        </div>
      </div>
      {/* Lista de canciones */}
      <div className="bg-surface border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 w-10">#</th>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4 text-center"><Clock size={14} /></th>
              <th className="px-6 py-4 text-center">Fav</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {songs.map((song, i) => {
              const isCurrent = currentSongId === song.id;
              return (
                <tr key={song.id} className={`hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-primary/10' : ''}`}>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <span className={`group-hover:hidden ${isCurrent ? 'text-primary font-bold' : ''}`}>{i + 1}</span>
                      <button onClick={() => onPlay(song)} className="absolute inset-0 hidden group-hover:flex items-center justify-center text-primary">
                        {isCurrent && isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                      </button>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-medium ${isCurrent ? 'text-primary' : 'text-slate-200'}`}>{song.title}</td>
                  <td className="px-6 py-4 text-slate-400 text-center font-mono text-xs">{song.duration}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onToggleFav(song.id)}>
                      <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"}
                        className={`${song.isFavorite ? 'text-red-500' : 'text-slate-600'} transition-colors`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onDeleteSong(song.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="text-center py-12 text-slate-500">Este álbum no tiene canciones todavía</div>
        )}
      </div>
    </div>
  );
};

// --- FORMULARIO MODAL (Crear / Editar) ---
interface ModalFormProps {
  onClose: () => void;
  onSubmit: (formData: Record<string, string>) => void;
  type: 'ARTIST' | 'ALBUM' | 'SONG';
  artists: Artist[];
  albums: Album[];
  editingItem: Artist | Album | Song | null;
}

export const ModalForm: React.FC<ModalFormProps> = ({ onClose, onSubmit, type, artists, albums, editingItem }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = editingItem !== null;

  // Cargamos FileUpload de forma dinamica
  const [FileUpload, setFileUpload] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import('./FileUpload').then(mod => setFileUpload(() => mod.FileUpload));
  }, []);

  useEffect(() => {
    if (editingItem) {
      const data: Record<string, string> = {};
      Object.entries(editingItem).forEach(([key, value]) => {
        if (value !== null && value !== undefined) data[key] = String(value);
      });
      setFormData(data);
    } else {
      setFormData({});
    }
  }, [editingItem, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    onSubmit({ ...formData, type });
    onClose();
  };

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors";
  const labelClass = "block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">
          {isEditing ? 'Editar' : 'Nuevo'} {type === 'ARTIST' ? 'Artista' : type === 'ALBUM' ? 'Álbum' : 'Canción'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'ARTIST' && (
            <>
              <div>
                <label className={labelClass}>Nombre *</label>
                <input required className={inputClass} placeholder="Nombre del artista" value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Género *</label>
                <input required className={inputClass} placeholder="Ej: Rock, Pop, Electronic..." value={formData.genre || ''}
                  onChange={e => handleChange('genre', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Biografía</label>
                <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Breve descripción del artista..." value={formData.bio || ''}
                  onChange={e => handleChange('bio', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Foto del artista</label>
                {FileUpload && (
                  <FileUpload type="image"
                    currentUrl={formData.imageUrl}
                    onUploaded={(url: string) => { handleChange('imageUrl', url); setIsUploading(false); }}
                    onUploadStart={() => setIsUploading(true)} />
                )}
                <input className={`${inputClass} mt-2`} placeholder="...o pega enlace directo a imagen (JPG, PNG)" value={formData.imageUrl || ''}
                  onChange={e => handleChange('imageUrl', e.target.value)} />
              </div>
            </>
          )}
          {type === 'ALBUM' && (
            <>
              <div>
                <label className={labelClass}>Título *</label>
                <input required className={inputClass} placeholder="Título del álbum" value={formData.title || ''}
                  onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Artista *</label>
                  <select required className={inputClass} value={formData.artistId || ''}
                    onChange={e => handleChange('artistId', e.target.value)}>
                    <option value="" disabled>Selecciona Artista</option>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="w-28">
                  <label className={labelClass}>Año</label>
                  <input className={inputClass} placeholder="2024" type="number" value={formData.year || ''}
                    onChange={e => handleChange('year', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Género</label>
                <input className={inputClass} placeholder="Ej: Rock, Pop, Jazz..." value={formData.genre || ''}
                  onChange={e => handleChange('genre', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Portada del álbum</label>
                {FileUpload && (
                  <FileUpload type="image"
                    currentUrl={formData.coverUrl}
                    onUploaded={(url: string) => { handleChange('coverUrl', url); setIsUploading(false); }}
                    onUploadStart={() => setIsUploading(true)} />
                )}
                <input className={`${inputClass} mt-2`} placeholder="...o pega enlace directo a imagen (JPG, PNG)" value={formData.coverUrl || ''}
                  onChange={e => handleChange('coverUrl', e.target.value)} />
              </div>
            </>
          )}
          {type === 'SONG' && (
            <>
              <div>
                <label className={labelClass}>Título *</label>
                <input required className={inputClass} placeholder="Nombre de la canción" value={formData.title || ''}
                  onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Artista</label>
                  <select className={inputClass} value={formData.artistId || ''}
                    onChange={e => handleChange('artistId', e.target.value)}>
                    <option value="">Sin artista</option>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Álbum</label>
                  <select className={inputClass} value={formData.albumId || ''}
                    onChange={e => {
                      const selectedAlbumId = e.target.value;
                      handleChange('albumId', selectedAlbumId);
                      if (selectedAlbumId) {
                        const selectedAlbum = albums.find(a => a.id === selectedAlbumId);
                        if (selectedAlbum && selectedAlbum.artistId) {
                          handleChange('artistId', selectedAlbum.artistId);
                        }
                      }
                    }}>
                    <option value="">Sin álbum</option>
                    {(formData.artistId
                      ? albums.filter(a => a.artistId === formData.artistId)
                      : albums
                    ).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="w-32">
                <label className={labelClass}>Duración</label>
                <input className={inputClass} placeholder="3:45" value={formData.duration || ''}
                  onChange={e => handleChange('duration', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Archivo de audio</label>
                {FileUpload && (
                  <FileUpload type="audio"
                    currentUrl={formData.audioUrl}
                    onUploaded={(url: string) => { handleChange('audioUrl', url); setIsUploading(false); }}
                    onUploadStart={() => setIsUploading(true)}
                    onDurationDetected={(dur: string) => handleChange('duration', dur)} />
                )}
                <input className={`${inputClass} mt-2`} placeholder="...o pega enlace directo a MP3 (no YouTube/Spotify)" value={formData.audioUrl || ''}
                  onChange={e => handleChange('audioUrl', e.target.value)} />
                <p className="text-slate-600 text-xs mt-1">Solo enlaces directos a archivos de audio (.mp3, .wav, .ogg)</p>
              </div>
            </>
          )}
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isUploading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-bold transition-colors ${
                isUploading ? 'bg-slate-600 cursor-not-allowed' : 'bg-primary hover:bg-indigo-600'
              }`}>
              {isUploading ? 'Subiendo archivo...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
