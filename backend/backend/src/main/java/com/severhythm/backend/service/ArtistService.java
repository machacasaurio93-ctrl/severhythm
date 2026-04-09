package com.severhythm.backend.service;

import com.severhythm.backend.exception.ResourceNotFoundException;
import com.severhythm.backend.model.Artist;
import com.severhythm.backend.repository.AlbumRepository;
import com.severhythm.backend.repository.ArtistRepository;
import com.severhythm.backend.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArtistService {

    @Autowired private ArtistRepository artistRepo;
    @Autowired private AlbumRepository albumRepo;
    @Autowired private SongRepository songRepo;

    public List<Artist> findAll() {
        return artistRepo.findAll();
    }

    public Artist findById(String id) {
        return artistRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista", id));
    }

    public List<Artist> search(String query) {
        return artistRepo.findByNameContainingIgnoreCase(query);
    }

    @Transactional
    public Artist create(Artist artist) {
        return artistRepo.save(artist);
    }

    @Transactional
    public Artist update(String id, Artist updates) {
        Artist existing = findById(id);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getGenre() != null) existing.setGenre(updates.getGenre());
        if (updates.getBio() != null) existing.setBio(updates.getBio());
        if (updates.getImageUrl() != null) existing.setImageUrl(updates.getImageUrl());
        return artistRepo.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!artistRepo.existsById(id)) {
            throw new ResourceNotFoundException("Artista", id);
        }
        // Borrado en cascada: canciones de los álbumes del artista, luego álbumes
        songRepo.deleteAll(songRepo.findByArtistId(id));
        albumRepo.deleteAll(albumRepo.findByArtistId(id));
        artistRepo.deleteById(id);
    }
}
