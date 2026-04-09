package com.severhythm.backend.service;

import com.severhythm.backend.exception.ResourceNotFoundException;
import com.severhythm.backend.model.Album;
import com.severhythm.backend.repository.AlbumRepository;
import com.severhythm.backend.repository.ArtistRepository;
import com.severhythm.backend.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlbumService {

    @Autowired private AlbumRepository albumRepo;
    @Autowired private ArtistRepository artistRepo;
    @Autowired private SongRepository songRepo;

    public List<Album> findAll() {
        return albumRepo.findAll();
    }

    public Album findById(String id) {
        return albumRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", id));
    }

    public List<Album> findByArtistId(String artistId) {
        return albumRepo.findByArtistId(artistId);
    }

    @Transactional
    public Album create(Album album) {
        // Verificar que el artista existe
        if (!artistRepo.existsById(album.getArtistId())) {
            throw new ResourceNotFoundException("Artista", album.getArtistId());
        }
        return albumRepo.save(album);
    }

    @Transactional
    public Album update(String id, Album updates) {
        Album existing = findById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getYear() != null) existing.setYear(updates.getYear());
        if (updates.getGenre() != null) existing.setGenre(updates.getGenre());
        if (updates.getCoverUrl() != null) existing.setCoverUrl(updates.getCoverUrl());
        if (updates.getArtistId() != null) {
            if (!artistRepo.existsById(updates.getArtistId())) {
                throw new ResourceNotFoundException("Artista", updates.getArtistId());
            }
            existing.setArtistId(updates.getArtistId());
        }
        return albumRepo.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!albumRepo.existsById(id)) {
            throw new ResourceNotFoundException("Álbum", id);
        }
        // Borrado en cascada: canciones del álbum
        songRepo.deleteAll(songRepo.findByAlbumId(id));
        albumRepo.deleteById(id);
    }
}
