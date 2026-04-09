import { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DashboardView, ArtistList, AlbumList, SongList, ModalForm, ArtistDetailView, AlbumDetailView } from './components/Views';
import { PlaylistList, PlaylistDetailView, AddSongModal, CreatePlaylistModal } from './components/PlaylistViews';
import { AuthPage } from './components/AuthPage';
import type { Artist, Album, Song, Playlist, ViewState } from './types';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { api, getStoredUser, clearAuth, type AuthUser } from './services/api';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ARTIST' | 'ALBUM' | 'SONG'>('ARTIST');
  const [editingItem, setEditingItem] = useState<Artist | Album | Song | null>(null);

  // Modales de playlists
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [showAddSongToPlaylist, setShowAddSongToPlaylist] = useState(false);

  // --- ESTADO DEL REPRODUCTOR ---
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Cargar datos solo si el usuario está autenticado
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Escuchar eventos de logout (token expirado, 401, etc.)
  useEffect(() => {
    const handleLogout = () => { setUser(null); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setArtists([]); setAlbums([]); setSongs([]); setPlaylists([]);
    setCurrentSongId(null); setIsPlaying(false);
  };

  const loadData = async () => {
    setIsLoading(true); setError(null);
    try {
      const [artistsData, albumsData, songsData, playlistsData] = await Promise.all([
        api.artists.getAll(), api.albums.getAll(), api.songs.getAll(), api.playlists.getAll()
      ]);
      setArtists(artistsData); setAlbums(albumsData); setSongs(songsData); setPlaylists(playlistsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'UNAUTHORIZED') return; // Se redirige al login automáticamente
      if (message === "CONNECTION_REFUSED") {
        setError("No se pudo conectar con el Backend. Revisa que esté corriendo en el puerto 8080.");
      } else {
        setError("Ocurrió un error inesperado cargando los datos.");
      }
    } finally { setIsLoading(false); }
  };

  const getSongMeta = useCallback((song: Song) => {
    const album = albums.find(a => a.id === song.albumId);
    const artist = artists.find(a => a.id === song.artistId);
    return {
      artistName: artist?.name || 'Sin artista',
      coverUrl: album?.coverUrl || 'https://picsum.photos/200'
    };
  }, [albums, artists]);

  const currentSong = useMemo(() => songs.find(s => s.id === currentSongId) || null, [songs, currentSongId]);

  // --- NAVEGACION ---
  const navigateToArtist = (artistId: string) => {
    setSelectedArtistId(artistId);
    setView('ARTIST_DETAIL');
  };

  const navigateToAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setView('ALBUM_DETAIL');
  };

  // --- LOGICA DEL REPRODUCTOR ---
  const handlePlaySong = (song: Song, contextSongs: Song[]) => {
    if (currentSongId === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setQueue(contextSongs);
      setCurrentSongId(song.id);
      setIsPlaying(true);
      api.songs.incrementPlays(song.id).catch(() => {});
    }
  };

  const handlePlayFromQueue = (song: Song) => {
    if (currentSongId === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(song.id);
      setIsPlaying(true);
      api.songs.incrementPlays(song.id).catch(() => {});
    }
  };

  const handleTogglePlay = () => { if (currentSongId) setIsPlaying(!isPlaying); };

  const handleNext = useCallback(() => {
    if (!currentSongId || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSongId);

    if (shuffleMode) {
      // Elegir una canción aleatoria diferente a la actual
      const otherSongs = queue.filter(s => s.id !== currentSongId);
      if (otherSongs.length > 0) {
        const randomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
        setCurrentSongId(randomSong.id);
        setIsPlaying(true);
        api.songs.incrementPlays(randomSong.id).catch(() => {});
      }
      return;
    }

    if (currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      setCurrentSongId(nextSong.id);
      setIsPlaying(true);
      api.songs.incrementPlays(nextSong.id).catch(() => {});
    } else if (repeatMode === 'all') {
      // Volver al principio de la cola
      const firstSong = queue[0];
      setCurrentSongId(firstSong.id);
      setIsPlaying(true);
      api.songs.incrementPlays(firstSong.id).catch(() => {});
    } else {
      setIsPlaying(false);
      setCurrentSongId(null);
    }
  }, [currentSongId, queue, shuffleMode, repeatMode]);

  const handlePrev = () => {
    if (!currentSongId || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSongId);
    if (currentIndex > 0) {
      setCurrentSongId(queue[currentIndex - 1].id);
      setIsPlaying(true);
    }
  };

  const handleToggleShuffle = () => setShuffleMode(prev => !prev);
  const handleToggleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  // --- ELIMINACION ---
  const handleDeleteArtist = async (id: string) => {
    if (!confirm('¿Eliminar artista? Esto borrará también sus álbumes y canciones.')) return;
    try {
      await api.artists.delete(id);
      setArtists(prev => prev.filter(a => a.id !== id));
      setAlbums(prev => prev.filter(a => a.artistId !== id));
      setSongs(prev => prev.filter(s => s.artistId !== id));
      if (currentSongId && songs.find(s => s.id === currentSongId)?.artistId === id) {
        setCurrentSongId(null); setIsPlaying(false);
      }
      if (view === 'ARTIST_DETAIL' && selectedArtistId === id) setView('ARTISTS');
    } catch { alert('Error eliminando artista'); }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('¿Eliminar álbum? Esto borrará también sus canciones.')) return;
    try {
      await api.albums.delete(id);
      setAlbums(prev => prev.filter(a => a.id !== id));
      setSongs(prev => prev.filter(s => s.albumId !== id));
      if (currentSongId && songs.find(s => s.id === currentSongId)?.albumId === id) {
        setCurrentSongId(null); setIsPlaying(false);
      }
      if (view === 'ALBUM_DETAIL' && selectedAlbumId === id) setView('ALBUMS');
    } catch { alert('Error eliminando álbum'); }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm('¿Eliminar canción?')) return;
    try {
      await api.songs.delete(id);
      setSongs(prev => prev.filter(s => s.id !== id));
      if (currentSongId === id) { setCurrentSongId(null); setIsPlaying(false); }
    } catch { alert('Error eliminando canción'); }
  };

  // --- FAVORITOS ---
  const handleToggleFavorite = async (id: string) => {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    const newStatus = !song.isFavorite;
    setSongs(prev => prev.map(s => s.id === id ? { ...s, isFavorite: newStatus } : s));
    try {
      await api.songs.toggleFavorite(id);
    } catch {
      setSongs(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !newStatus } : s));
    }
  };

  // --- ABRIR MODAL ---
  const handleOpenAddModal = () => {
    setEditingItem(null);
    if (view === 'ALBUMS' || view === 'ALBUM_DETAIL') setModalType('ALBUM');
    else if (view === 'SONGS' || view === 'FAVORITES') setModalType('SONG');
    else if (view === 'ARTIST_DETAIL') setModalType('ALBUM');
    else setModalType('ARTIST');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (type: 'ARTIST' | 'ALBUM' | 'SONG', item: Artist | Album | Song) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // --- CREAR / ACTUALIZAR ---
  const handleSubmitEntity = async (formData: Record<string, string>) => {
    const type = formData.type;
    try {
      if (editingItem) {
        if (type === 'ARTIST') {
          const updated = await api.artists.update(editingItem.id, {
            name: formData.name, genre: formData.genre,
            bio: formData.bio || '', imageUrl: formData.imageUrl || (editingItem as Artist).imageUrl
          });
          setArtists(prev => prev.map(a => a.id === updated.id ? updated : a));
        } else if (type === 'ALBUM') {
          const updated = await api.albums.update(editingItem.id, {
            title: formData.title, year: parseInt(formData.year) || new Date().getFullYear(),
            genre: formData.genre || '', artistId: formData.artistId,
            coverUrl: formData.coverUrl || (editingItem as Album).coverUrl
          });
          setAlbums(prev => prev.map(a => a.id === updated.id ? updated : a));
        } else if (type === 'SONG') {
          const updated = await api.songs.update(editingItem.id, {
            title: formData.title, duration: formData.duration || '3:00',
            albumId: formData.albumId, audioUrl: formData.audioUrl || ''
          });
          setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
        }
      } else {
        if (type === 'ARTIST') {
          const newArtist = await api.artists.create({
            name: formData.name, genre: formData.genre, bio: formData.bio || '',
            imageUrl: formData.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`
          });
          setArtists(prev => [...prev, newArtist]);
        } else if (type === 'ALBUM') {
          const newAlbum = await api.albums.create({
            title: formData.title, year: parseInt(formData.year) || new Date().getFullYear(),
            genre: formData.genre || '', artistId: formData.artistId,
            coverUrl: formData.coverUrl || `https://picsum.photos/300/300?random=${Date.now()}`
          });
          setAlbums(prev => [...prev, newAlbum]);
        } else if (type === 'SONG') {
          // Determinar artistId: si hay álbum, heredar su artista; si no, usar el seleccionado
          let artistId = formData.artistId || '';
          if (formData.albumId) {
            const parentAlbum = albums.find(a => a.id === formData.albumId);
            if (parentAlbum?.artistId) artistId = parentAlbum.artistId;
          }
          const newSong = await api.songs.create({
            title: formData.title, duration: formData.duration || '3:00',
            albumId: formData.albumId || '', artistId: artistId,
            isFavorite: false, plays: 0, audioUrl: formData.audioUrl || ''
          });
          setSongs(prev => [...prev, newSong]);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error guardando datos");
    }
  };

  // --- LOGICA DE PLAYLISTS ---
  const navigateToPlaylist = (id: string) => { setSelectedPlaylistId(id); setView('PLAYLIST_DETAIL'); };

  const handleCreatePlaylist = async (name: string, description: string) => {
    try {
      const newPlaylist = await api.playlists.create({ name, description });
      setPlaylists(prev => [newPlaylist, ...prev]);
    } catch { alert('Error creando playlist'); }
  };

  const handleUpdatePlaylist = async (name: string, description: string) => {
    if (!editingPlaylist) return;
    try {
      const updated = await api.playlists.update(editingPlaylist.id, { name, description });
      setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch { alert('Error actualizando playlist'); }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('¿Eliminar playlist?')) return;
    try {
      await api.playlists.delete(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (view === 'PLAYLIST_DETAIL' && selectedPlaylistId === id) setView('PLAYLISTS');
    } catch { alert('Error eliminando playlist'); }
  };

  const handleAddSongToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const updated = await api.playlists.addSong(playlistId, songId);
      setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch { alert('Error añadiendo canción'); }
  };

  const handleRemoveSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const updated = await api.playlists.removeSong(playlistId, songId);
      setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch { alert('Error quitando canción'); }
  };

  // --- BUSQUEDA ---
  const filteredArtists = useMemo(() =>
    artists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [artists, searchQuery]
  );
  const filteredAlbums = useMemo(() =>
    albums.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [albums, searchQuery]
  );
  const filteredSongs = useMemo(() =>
    songs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [songs, searchQuery]
  );

  // --- RENDERIZADO ---
  const renderContent = () => {
    if (isLoading) return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" size={48}/>
      </div>
    );
    if (error) return (
      <div className="text-center p-10 text-red-400">
        <AlertTriangle size={48} className="mx-auto mb-4"/>
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 bg-slate-700 px-4 py-2 rounded text-white">Reintentar</button>
      </div>
    );

    if (view === 'SEARCH_RESULTS') {
      return (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Search className="mr-2 text-primary" /> Resultados para &quot;{searchQuery}&quot;
          </h2>
          {filteredArtists.length > 0 && (
            <ArtistList artists={filteredArtists} onDelete={handleDeleteArtist}
              onEdit={(a: Artist) => handleOpenEditModal('ARTIST', a)}
              onSelect={navigateToArtist} />
          )}
          {filteredAlbums.length > 0 && (
            <AlbumList albums={filteredAlbums} artists={artists}
              onDelete={handleDeleteAlbum}
              onSelect={navigateToAlbum} />
          )}
          {filteredSongs.length > 0 && (
            <SongList songs={filteredSongs} albums={albums} artists={artists}
              onToggleFav={handleToggleFavorite}
              onPlay={(s: Song) => handlePlaySong(s, filteredSongs)}
              onDelete={handleDeleteSong}
              currentSongId={currentSongId || undefined}
              isPlaying={isPlaying} />
          )}
          {filteredArtists.length === 0 && filteredAlbums.length === 0 && filteredSongs.length === 0 && (
            <div className="text-center py-20 text-slate-500"><p>No se encontraron resultados.</p></div>
          )}
        </div>
      );
    }

    if (view === 'ARTIST_DETAIL' && selectedArtistId) {
      const artist = artists.find(a => a.id === selectedArtistId);
      if (!artist) return null;
      const artistAlbums = albums.filter(a => a.artistId === selectedArtistId);
      const artistSongs = songs.filter(s => s.artistId === selectedArtistId);
      return (
        <ArtistDetailView
          artist={artist} albums={artistAlbums} songs={artistSongs} allArtists={artists}
          onEdit={(a: Artist) => handleOpenEditModal('ARTIST', a)}
          onDelete={handleDeleteArtist}
          onSelectAlbum={navigateToAlbum}
          onPlay={(s: Song) => handlePlaySong(s, artistSongs)}
          onToggleFav={handleToggleFavorite}
          currentSongId={currentSongId || undefined}
          isPlaying={isPlaying}
          onBack={() => setView('ARTISTS')}
        />
      );
    }

    if (view === 'ALBUM_DETAIL' && selectedAlbumId) {
      const album = albums.find(a => a.id === selectedAlbumId);
      if (!album) return null;
      const albumSongs = songs.filter(s => s.albumId === selectedAlbumId);
      const artist = artists.find(a => a.id === album.artistId);
      return (
        <AlbumDetailView
          album={album} songs={albumSongs} artist={artist || null} allArtists={artists} allAlbums={albums}
          onEdit={(a: Album) => handleOpenEditModal('ALBUM', a)}
          onDelete={handleDeleteAlbum}
          onDeleteSong={handleDeleteSong}
          onPlay={(s: Song) => handlePlaySong(s, albumSongs)}
          onToggleFav={handleToggleFavorite}
          currentSongId={currentSongId || undefined}
          isPlaying={isPlaying}
          onBack={() => setView('ALBUMS')}
          onSelectArtist={navigateToArtist}
        />
      );
    }

    if (view === 'PLAYLIST_DETAIL' && selectedPlaylistId) {
      const playlist = playlists.find(p => p.id === selectedPlaylistId);
      if (!playlist) return null;
      const playlistSongs = (playlist.songIds || [])
        .map(id => songs.find(s => s.id === id))
        .filter((s): s is Song => s !== undefined);
      return (
        <PlaylistDetailView
          playlist={playlist} songs={playlistSongs} allSongs={songs} artists={artists} albums={albums}
          onEdit={(p: Playlist) => { setEditingPlaylist(p); setShowCreatePlaylist(true); }}
          onDelete={handleDeletePlaylist}
          onRemoveSong={handleRemoveSongFromPlaylist}
          onPlay={(s: Song, ctx: Song[]) => handlePlaySong(s, ctx)}
          onToggleFav={handleToggleFavorite}
          currentSongId={currentSongId || undefined}
          isPlaying={isPlaying}
          onBack={() => setView('PLAYLISTS')}
          onShowAddSong={() => setShowAddSongToPlaylist(true)}
        />
      );
    }

    switch (view) {
      case 'DASHBOARD':
        return <DashboardView artists={artists} albums={albums} songs={songs} onNavigate={setView} />;
      case 'ARTISTS':
        return <ArtistList artists={artists} onDelete={handleDeleteArtist}
          onEdit={(a: Artist) => handleOpenEditModal('ARTIST', a)}
          onSelect={navigateToArtist} />;
      case 'ALBUMS':
        return <AlbumList albums={albums} artists={artists}
          onDelete={handleDeleteAlbum}
          onSelect={navigateToAlbum} />;
      case 'SONGS':
        return (
          <SongList songs={songs} albums={albums} artists={artists}
            onToggleFav={handleToggleFavorite}
            onPlay={(s: Song) => handlePlaySong(s, songs)}
            onDelete={handleDeleteSong}
            currentSongId={currentSongId || undefined}
            isPlaying={isPlaying} />
        );
      case 'FAVORITES':
        const favSongs = songs.filter(s => s.isFavorite);
        return (
          <SongList songs={favSongs} albums={albums} artists={artists}
            onToggleFav={handleToggleFavorite}
            onPlay={(s: Song) => handlePlaySong(s, favSongs)}
            onDelete={handleDeleteSong}
            currentSongId={currentSongId || undefined}
            isPlaying={isPlaying}
            title="Canciones Favoritas"
            subtitle="Tus canciones marcadas con corazón" />
        );
      case 'PLAYLISTS':
        return (
          <PlaylistList playlists={playlists} songs={songs}
            onSelect={navigateToPlaylist}
            onDelete={handleDeletePlaylist}
            onCreate={() => { setEditingPlaylist(null); setShowCreatePlaylist(true); }} />
        );
      default: return null;
    }
  };

  // Si no hay usuario logueado, mostrar pantalla de login
  if (!user) {
    return <AuthPage onAuthenticated={(u) => setUser(u)} />;
  }

  return (
    <Layout
      currentView={view}
      onNavigate={setView}
      onSearch={setSearchQuery}
      onAddClick={handleOpenAddModal}
      currentSong={currentSong}
      isPlaying={isPlaying}
      onTogglePlay={handleTogglePlay}
      getSongMeta={getSongMeta}
      onNext={handleNext}
      onPrev={handlePrev}
      onToggleFavorite={currentSong ? () => handleToggleFavorite(currentSong.id) : undefined}
      queue={queue}
      onPlayFromQueue={handlePlayFromQueue}
      shuffleMode={shuffleMode}
      repeatMode={repeatMode}
      onToggleShuffle={handleToggleShuffle}
      onToggleRepeat={handleToggleRepeat}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
      {isModalOpen && (
        <ModalForm
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSubmit={handleSubmitEntity}
          type={modalType}
          artists={artists}
          albums={albums}
          editingItem={editingItem}
        />
      )}
      {showCreatePlaylist && (
        <CreatePlaylistModal
          editingPlaylist={editingPlaylist}
          onSubmit={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
          onClose={() => { setShowCreatePlaylist(false); setEditingPlaylist(null); }}
        />
      )}
      {showAddSongToPlaylist && (
        <AddSongModal
          playlists={playlists}
          songs={songs}
          artists={artists}
          targetPlaylistId={selectedPlaylistId || undefined}
          onAddToPlaylist={handleAddSongToPlaylist}
          onClose={() => setShowAddSongToPlaylist(false)}
        />
      )}
    </Layout>
  );
}
