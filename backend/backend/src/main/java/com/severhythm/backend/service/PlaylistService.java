package com.severhythm.backend.service;

import com.severhythm.backend.exception.ResourceNotFoundException;
import com.severhythm.backend.model.Playlist;
import com.severhythm.backend.repository.PlaylistRepository;
import com.severhythm.backend.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistService {

    @Autowired private PlaylistRepository playlistRepo;
    @Autowired private SongRepository songRepo;

    public List<Playlist> findByUserId(String userId) {
        return playlistRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Playlist findById(String id) {
        return playlistRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist", id));
    }

    @Transactional
    public Playlist create(String userId, Playlist playlist) {
        playlist.setUserId(userId);
        return playlistRepo.save(playlist);
    }

    @Transactional
    public Playlist update(String id, String userId, Playlist updates) {
        Playlist existing = findByIdAndUser(id, userId);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCoverUrl() != null) existing.setCoverUrl(updates.getCoverUrl());
        return playlistRepo.save(existing);
    }

    @Transactional
    public Playlist addSong(String id, String userId, String songId) {
        Playlist playlist = findByIdAndUser(id, userId);
        if (!songRepo.existsById(songId)) {
            throw new ResourceNotFoundException("Canción", songId);
        }
        if (!playlist.getSongIds().contains(songId)) {
            playlist.getSongIds().add(songId);
            playlistRepo.save(playlist);
        }
        return playlist;
    }

    @Transactional
    public Playlist removeSong(String id, String userId, String songId) {
        Playlist playlist = findByIdAndUser(id, userId);
        playlist.getSongIds().remove(songId);
        return playlistRepo.save(playlist);
    }

    @Transactional
    public void delete(String id, String userId) {
        Playlist playlist = findByIdAndUser(id, userId);
        playlistRepo.delete(playlist);
    }

    private Playlist findByIdAndUser(String id, String userId) {
        Playlist playlist = findById(id);
        if (!playlist.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Playlist", id);
        }
        return playlist;
    }
}
