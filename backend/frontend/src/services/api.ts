import type { Artist, Album, Song, Playlist } from '../types';

// Si el frontend se sirve desde el mismo servidor (JAR), usa ruta relativa.
// Si se ejecuta con Vite en dev (puerto 5173), apunta al backend en 8080.
const API_URL = window.location.port === '5173'
  ? 'http://localhost:8080/api'
  : `${window.location.origin}/api`;

// --- GESTION DEL TOKEN ---
const getToken = (): string | null => localStorage.getItem('severhythm_token');

const setToken = (token: string) => localStorage.setItem('severhythm_token', token);

export const clearAuth = () => {
  localStorage.removeItem('severhythm_token');
  localStorage.removeItem('severhythm_user');
};

export const getStoredUser = () => {
  const data = localStorage.getItem('severhythm_user');
  return data ? JSON.parse(data) : null;
};

const setStoredUser = (user: AuthUser) => {
  localStorage.setItem('severhythm_user', JSON.stringify(user));
};

export const isAuthenticated = (): boolean => !!getToken();

// --- TIPOS ---
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

// --- FUNCIONES HTTP ---
const authHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleFetch = async (endpoint: string, options?: RequestInit) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...authHeaders(), ...options?.headers },
    });

    if (res.status === 401 || res.status === 403) {
      clearAuth();
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Error del servidor: ${res.status}`);
    }
    if (res.status === 204 || res.headers.get('content-length') === '0') return null;
    return res.json();
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("CONNECTION_REFUSED");
    }
    throw error;
  }
};

// --- API DE AUTENTICACION ---
export const authApi = {
  register: async (username: string, email: string, password: string, displayName?: string): Promise<{ user: AuthUser; token: string }> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en el registro');
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  login: async (username: string, password: string): Promise<{ user: AuthUser; token: string }> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en el login');
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  getMe: async (): Promise<AuthUser> => {
    return handleFetch('/auth/me');
  },

  logout: () => {
    clearAuth();
    window.dispatchEvent(new Event('auth:logout'));
  }
};

// --- API DE MUSICA ---
export const api = {
  artists: {
    getAll: async (): Promise<Artist[]> => handleFetch('/artists'),
    getById: async (id: string): Promise<Artist> => handleFetch(`/artists/${id}`),
    search: async (query: string): Promise<Artist[]> => handleFetch(`/artists/search?q=${encodeURIComponent(query)}`),
    create: async (artist: Omit<Artist, 'id'>): Promise<Artist> => {
      return handleFetch('/artists', { method: 'POST', body: JSON.stringify(artist) });
    },
    update: async (id: string, updates: Partial<Artist>): Promise<Artist> => {
      return handleFetch(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    delete: async (id: string): Promise<void> => {
      await handleFetch(`/artists/${id}`, { method: 'DELETE' });
    }
  },

  albums: {
    getAll: async (artistId?: string): Promise<Album[]> => {
      const query = artistId ? `?artistId=${artistId}` : '';
      return handleFetch(`/albums${query}`);
    },
    getById: async (id: string): Promise<Album> => handleFetch(`/albums/${id}`),
    create: async (album: Omit<Album, 'id'>): Promise<Album> => {
      return handleFetch('/albums', { method: 'POST', body: JSON.stringify(album) });
    },
    update: async (id: string, updates: Partial<Album>): Promise<Album> => {
      return handleFetch(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    delete: async (id: string): Promise<void> => {
      await handleFetch(`/albums/${id}`, { method: 'DELETE' });
    }
  },

  songs: {
    getAll: async (params?: { albumId?: string; artistId?: string }): Promise<Song[]> => {
      const searchParams = new URLSearchParams();
      if (params?.albumId) searchParams.set('albumId', params.albumId);
      if (params?.artistId) searchParams.set('artistId', params.artistId);
      const query = searchParams.toString() ? `?${searchParams}` : '';
      return handleFetch(`/songs${query}`);
    },
    getById: async (id: string): Promise<Song> => handleFetch(`/songs/${id}`),
    getFavorites: async (): Promise<Song[]> => handleFetch('/songs/favorites'),
    create: async (song: Omit<Song, 'id'>): Promise<Song> => {
      return handleFetch('/songs', { method: 'POST', body: JSON.stringify(song) });
    },
    update: async (id: string, updates: Partial<Song>): Promise<Song> => {
      return handleFetch(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    toggleFavorite: async (id: string): Promise<Song> => {
      return handleFetch(`/songs/${id}/favorite`, { method: 'PATCH' });
    },
    incrementPlays: async (id: string): Promise<Song> => {
      return handleFetch(`/songs/${id}/play`, { method: 'PATCH' });
    },
    delete: async (id: string): Promise<void> => {
      await handleFetch(`/songs/${id}`, { method: 'DELETE' });
    }
  },

  files: {
    uploadAudio: async (file: File, onProgress?: (percent: number) => void): Promise<{ url: string; filename: string }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/files/audio`);
        const token = getToken();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({ url: `${API_URL.replace('/api', '')}${data.url}`, filename: data.filename });
          } else {
            reject(new Error('Error subiendo archivo de audio'));
          }
        };

        xhr.onerror = () => reject(new Error('Error de conexión al subir archivo'));

        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
      });
    },

    uploadImage: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/files/image`, { method: 'POST', headers, body: formData });
      if (!res.ok) throw new Error('Error subiendo imagen');
      const data = await res.json();
      return { url: `${API_URL.replace('/api', '')}${data.url}` };
    }
  },

  playlists: {
    getAll: async (): Promise<Playlist[]> => handleFetch('/playlists'),
    getById: async (id: string): Promise<Playlist> => handleFetch(`/playlists/${id}`),
    create: async (playlist: { name: string; description?: string }): Promise<Playlist> => {
      return handleFetch('/playlists', { method: 'POST', body: JSON.stringify(playlist) });
    },
    update: async (id: string, updates: Partial<Playlist>): Promise<Playlist> => {
      return handleFetch(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    addSong: async (id: string, songId: string): Promise<Playlist> => {
      return handleFetch(`/playlists/${id}/songs`, { method: 'POST', body: JSON.stringify({ songId }) });
    },
    removeSong: async (id: string, songId: string): Promise<Playlist> => {
      return handleFetch(`/playlists/${id}/songs/${songId}`, { method: 'DELETE' });
    },
    delete: async (id: string): Promise<void> => {
      await handleFetch(`/playlists/${id}`, { method: 'DELETE' });
    }
  }
};
