import type { Artist, Album, Song } from '../types';

export const musicService = {
  getStats: (artists: Artist[], albums: Album[], songs: Song[]) => ({
    totalArtists: artists.length,
    totalAlbums: albums.length,
    totalSongs: songs.length,
    favorites: songs.filter(s => s.isFavorite).length,
  }),
  getArtistName: (id: string, artists: Artist[]) => artists.find(a => a.id === id)?.name || 'Desconocido',
  getAlbumName: (id: string, albums: Album[]) => albums.find(a => a.id === id)?.title || 'Desconocido',
};
