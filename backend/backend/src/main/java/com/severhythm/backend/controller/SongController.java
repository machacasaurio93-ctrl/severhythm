package com.severhythm.backend.controller;

import com.severhythm.backend.model.Song;
import com.severhythm.backend.service.SongService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired private SongService songService;

    @GetMapping
    public List<Song> getAll(
            @RequestParam(required = false) String albumId,
            @RequestParam(required = false) String artistId) {
        if (albumId != null) return songService.findByAlbumId(albumId);
        if (artistId != null) return songService.findByArtistId(artistId);
        return songService.findAll();
    }

    @GetMapping("/{id}")
    public Song getById(@PathVariable String id) {
        return songService.findById(id);
    }

    @GetMapping("/favorites")
    public List<Song> getFavorites() {
        return songService.findFavorites();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Song create(@Valid @RequestBody Song song) {
        return songService.create(song);
    }

    @PutMapping("/{id}")
    public Song update(@PathVariable String id, @RequestBody Song song) {
        return songService.update(id, song);
    }

    @PatchMapping("/{id}/favorite")
    public Song toggleFavorite(@PathVariable String id) {
        return songService.toggleFavorite(id);
    }

    @PatchMapping("/{id}/play")
    public Song incrementPlays(@PathVariable String id) {
        return songService.incrementPlays(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        songService.delete(id);
    }
}
