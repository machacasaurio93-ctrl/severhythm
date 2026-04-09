package com.severhythm.backend.controller;

import com.severhythm.backend.model.Album;
import com.severhythm.backend.service.AlbumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    @Autowired private AlbumService albumService;

    @GetMapping
    public List<Album> getAll(@RequestParam(required = false) String artistId) {
        if (artistId != null) {
            return albumService.findByArtistId(artistId);
        }
        return albumService.findAll();
    }

    @GetMapping("/{id}")
    public Album getById(@PathVariable String id) {
        return albumService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Album create(@Valid @RequestBody Album album) {
        return albumService.create(album);
    }

    @PutMapping("/{id}")
    public Album update(@PathVariable String id, @RequestBody Album album) {
        return albumService.update(id, album);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        albumService.delete(id);
    }
}
