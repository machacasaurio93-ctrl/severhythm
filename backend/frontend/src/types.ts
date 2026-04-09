export interface Artist {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  genre: string;
}

export interface Album {
  id: string;
  artistId: string;
  title: string;
  year: number;
  coverUrl: string;
  genre: string;
}

export interface Song {
  id: string;
  albumId: string;
  artistId: string;
  title: string;
  duration: string;
  audioUrl?: string;
  isFavorite: boolean;
  plays: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  userId: string;
  songIds: string[];
  createdAt: string;
}

export type ViewState =
  | 'DASHBOARD'
  | 'ARTISTS'
  | 'ALBUMS'
  | 'SONGS'
  | 'FAVORITES'
  | 'PLAYLISTS'
  | 'PLAYLIST_DETAIL'
  | 'SEARCH_RESULTS'
  | 'ARTIST_DETAIL'
  | 'ALBUM_DETAIL';

export interface SearchFilters {
  query: string;
  type: 'ALL' | 'ARTIST' | 'ALBUM' | 'SONG';
}
