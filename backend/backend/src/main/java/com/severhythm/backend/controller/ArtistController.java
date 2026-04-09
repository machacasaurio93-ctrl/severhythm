package com.severhythm.backend.controller;

import com.severhythm.backend.model.Artist;
import com.severhythm.backend.service.ArtistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    @Autowired private ArtistService artistService;

    @GetMapping
    public List<Artist> getAll() {
        return artistService.findAll();
    }

    @GetMapping("/{id}")
    public Artist getById(@PathVariable String id) {
        return artistService.findById(id);
    }

    @GetMapping("/search")
    public List<Artist> search(@RequestParam String q) {
        return artistService.search(q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Artist create(@Valid @RequestBody Artist artist) {
        return artistService.create(artist);
    }

    @PutMapping("/{id}")
    public Artist update(@PathVariable String id, @RequestBody Artist artist) {
        return artistService.update(id, artist);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        artistService.delete(id);
    }
}
