package com.severhythm.backend.service;

import com.severhythm.backend.exception.ResourceNotFoundException;
import com.severhythm.backend.model.Song;
import com.severhythm.backend.repository.AlbumRepository;
import com.severhythm.backend.repository.ArtistRepository;
import com.severhythm.backend.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SongService {

    @Autowired private SongRepository songRepo;
    @Autowired private AlbumRepository albumRepo;
    @Autowired private ArtistRepository artistRepo;

    public List<Song> findAll() {
        return songRepo.findAll();
    }

    public Song findById(String id) {
        return songRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canción", id));
    }

    public List<Song> findByAlbumId(String albumId) {
        return songRepo.findByAlbumId(albumId);
    }

    public List<Song> findByArtistId(String artistId) {
        return songRepo.findByArtistId(artistId);
    }

    public List<Song> findFavorites() {
        return songRepo.findByIsFavoriteTrue();
    }

    @Transactional
    public Song create(Song song) {
        // Verificar referencias solo si se proporcionan
        if (song.getAlbumId() != null && !song.getAlbumId().isEmpty()) {
            if (!albumRepo.existsById(song.getAlbumId())) {
                throw new ResourceNotFoundException("Álbum", song.getAlbumId());
            }
        } else {
            song.setAlbumId(null);
        }
        if (song.getArtistId() != null && !song.getArtistId().isEmpty()) {
            if (!artistRepo.existsById(song.getArtistId())) {
                throw new ResourceNotFoundException("Artista", song.getArtistId());
            }
        } else {
            song.setArtistId(null);
        }
        if (song.getIsFavorite() == null) song.setIsFavorite(false);
        if (song.getPlays() == null) song.setPlays(0);
        return songRepo.save(song);
    }

    @Transactional
    public Song update(String id, Song updates) {
        Song existing = findById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDuration() != null) existing.setDuration(updates.getDuration());
        if (updates.getIsFavorite() != null) existing.setIsFavorite(updates.getIsFavorite());
        if (updates.getPlays() != null) existing.setPlays(updates.getPlays());
        if (updates.getAudioUrl() != null) existing.setAudioUrl(updates.getAudioUrl());
        if (updates.getAlbumId() != null) existing.setAlbumId(updates.getAlbumId());
        if (updates.getArtistId() != null) existing.setArtistId(updates.getArtistId());
        return songRepo.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!songRepo.existsById(id)) {
            throw new ResourceNotFoundException("Canción", id);
        }
        songRepo.deleteById(id);
    }

    @Transactional
    public Song toggleFavorite(String id) {
        Song song = findById(id);
        song.setIsFavorite(!song.getIsFavorite());
        return songRepo.save(song);
    }

    @Transactional
    public Song incrementPlays(String id) {
        Song song = findById(id);
        song.setPlays(song.getPlays() + 1);
        return songRepo.save(song);
    }
}
