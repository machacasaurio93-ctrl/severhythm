package com.severhythm.backend.controller;

import com.severhythm.backend.model.Playlist;
import com.severhythm.backend.service.PlaylistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired private PlaylistService playlistService;

    @GetMapping
    public List<Playlist> getMyPlaylists(Authentication auth) {
        return playlistService.findByUserId(auth.getPrincipal().toString());
    }

    @GetMapping("/{id}")
    public Playlist getById(@PathVariable String id) {
        return playlistService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Playlist create(Authentication auth, @Valid @RequestBody Playlist playlist) {
        return playlistService.create(auth.getPrincipal().toString(), playlist);
    }

    @PutMapping("/{id}")
    public Playlist update(Authentication auth, @PathVariable String id, @RequestBody Playlist playlist) {
        return playlistService.update(id, auth.getPrincipal().toString(), playlist);
    }

    @PostMapping("/{id}/songs")
    public Playlist addSong(Authentication auth, @PathVariable String id, @RequestBody Map<String, String> body) {
        return playlistService.addSong(id, auth.getPrincipal().toString(), body.get("songId"));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public Playlist removeSong(Authentication auth, @PathVariable String id, @PathVariable String songId) {
        return playlistService.removeSong(id, auth.getPrincipal().toString(), songId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth, @PathVariable String id) {
        playlistService.delete(id, auth.getPrincipal().toString());
    }
}
