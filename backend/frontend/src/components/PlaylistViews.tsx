import React, { useState } from 'react';
import { ListMusic, Plus, Trash2, Play, Clock, Heart, PlayCircle, PauseCircle, ArrowLeft, Edit3, Music } from 'lucide-react';
import type { Playlist, Song, Artist, Album } from '../types';

// --- UTILIDADES ---
const getArtistName = (id: string | null | undefined, artists: Artist[]) => {
  if (!id) return 'Sin artista';
  return artists.find(a => a.id === id)?.name || 'Sin artista';
};

// --- LISTA DE PLAYLISTS ---
interface PlaylistListProps {
  playlists: Playlist[];
  songs: Song[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export const PlaylistList: React.FC<PlaylistListProps> = ({ playlists, onSelect, onDelete, onCreate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mis Playlists</h2>
        <p className="text-slate-400 text-sm mt-1">{playlists.length} playlists</p>
      </div>
      <button onClick={onCreate}
        className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
        <Plus size={16} /><span>Nueva Playlist</span>
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {playlists.map(playlist => {
        const songCount = playlist.songIds?.length || 0;
        return (
          <div key={playlist.id} className="bg-surface border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all cursor-pointer group"
            onClick={() => onSelect(playlist.id)}>
            <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center mb-3 overflow-hidden">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <ListMusic size={48} className="text-primary/60" />
              )}
            </div>
            <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
            <p className="text-slate-400 text-xs mt-1">{songCount} canciones</p>
            {playlist.description && <p className="text-slate-500 text-xs mt-1 truncate">{playlist.description}</p>}
            <button onClick={(e) => { e.stopPropagation(); onDelete(playlist.id); }}
              className="mt-3 w-full px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Trash2 size={12} className="mr-1" /> Eliminar
            </button>
          </div>
        );
      })}

      {/* Tarjeta para crear nueva */}
      <div onClick={onCreate}
        className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors min-h-[200px]">
        <Plus size={32} className="text-slate-600 mb-2" />
        <p className="text-slate-500 text-sm">Crear playlist</p>
      </div>
    </div>
  </div>
);

// --- DETALLE DE PLAYLIST ---
interface PlaylistDetailProps {
  playlist: Playlist;
  songs: Song[];
  allSongs: Song[];
  artists: Artist[];
  albums: Album[];
  onEdit: (playlist: Playlist) => void;
  onDelete: (id: string) => void;
  onRemoveSong: (playlistId: string, songId: string) => void;
  onPlay: (song: Song, contextSongs: Song[]) => void;
  onToggleFav: (id: string) => void;
  currentSongId?: string;
  isPlaying: boolean;
  onBack: () => void;
  onShowAddSong: () => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailProps> = ({
  playlist, songs, artists,
  onEdit, onDelete, onRemoveSong,
  onPlay, onToggleFav, currentSongId, isPlaying,
  onBack, onShowAddSong
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
        <div className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <ListMusic size={64} className="text-primary/60" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Playlist</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-1">{playlist.name}</h1>
          {playlist.description && <p className="text-slate-400 mt-2">{playlist.description}</p>}
          <p className="text-slate-500 text-sm mt-2">{songs.length} canciones &bull; {durationMin} min</p>
          <div className="flex items-center space-x-3 mt-4">
            {songs.length > 0 && (
              <button onClick={() => onPlay(songs[0], songs)}
                className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                <Play size={16} fill="currentColor" /><span>Reproducir</span>
              </button>
            )}
            <button onClick={onShowAddSong}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-sm transition-colors">
              <Plus size={16} /><span>Añadir canción</span>
            </button>
            <button onClick={() => onEdit(playlist)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-full transition-colors">
              <Edit3 size={12} className="inline mr-1" />Editar
            </button>
            <button onClick={() => onDelete(playlist.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-full transition-colors">
              <Trash2 size={12} className="inline mr-1" />Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
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
                      <button onClick={() => onPlay(song, songs)} className="absolute inset-0 hidden group-hover:flex items-center justify-center text-primary">
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
                        className={`${song.isFavorite ? 'text-red-500' : 'text-slate-600'} transition-colors`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onRemoveSong(playlist.id, song.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Quitar de la playlist">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Music size={32} className="mx-auto mb-3 text-slate-600" />
            <p>Esta playlist está vacía</p>
            <button onClick={onShowAddSong} className="mt-3 text-primary hover:text-indigo-400 text-sm font-medium">Añadir canciones</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODAL PARA ANADIR CANCION A PLAYLIST ---
interface AddSongModalProps {
  playlists: Playlist[];
  songs: Song[];
  artists: Artist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onClose: () => void;
  targetPlaylistId?: string;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({ playlists, songs, artists, onAddToPlaylist, onClose, targetPlaylistId }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(targetPlaylistId || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getArtistName(s.artistId, artists).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const alreadyInPlaylist = new Set(selectedPlaylist?.songIds || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 max-h-[80vh] flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4">Añadir canción a playlist</h3>

        {!targetPlaylistId && (
          <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white mb-3 focus:border-primary focus:outline-none"
            value={selectedPlaylistId} onChange={e => setSelectedPlaylistId(e.target.value)}>
            <option value="" disabled>Selecciona una playlist</option>
            {playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}

        <input type="text" placeholder="Buscar canción..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white mb-3 focus:border-primary focus:outline-none"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredSongs.map(song => {
            const isAdded = alreadyInPlaylist.has(song.id);
            return (
              <div key={song.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm truncate">{song.title}</p>
                  <p className="text-slate-500 text-xs truncate">{getArtistName(song.artistId, artists)}</p>
                </div>
                <button
                  disabled={!selectedPlaylistId || isAdded}
                  onClick={() => { if (selectedPlaylistId) onAddToPlaylist(selectedPlaylistId, song.id); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ml-3 ${
                    isAdded ? 'bg-green-500/20 text-green-400 cursor-default' :
                    !selectedPlaylistId ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
                    'bg-primary/20 text-primary hover:bg-primary/30'
                  }`}>
                  {isAdded ? 'Añadida' : 'Añadir'}
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="mt-4 w-full px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
};

// --- MODAL CREAR PLAYLIST ---
interface CreatePlaylistModalProps {
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
  editingPlaylist?: Playlist | null;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onSubmit, onClose, editingPlaylist }) => {
  const [name, setName] = useState(editingPlaylist?.name || '');
  const [description, setDescription] = useState(editingPlaylist?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description);
    onClose();
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          {editingPlaylist ? 'Editar playlist' : 'Nueva playlist'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Nombre *</label>
            <input required className={inputClass} placeholder="Mi playlist favorita"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Descripción</label>
            <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Describe tu playlist..."
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-indigo-600 transition-colors">
              {editingPlaylist ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
