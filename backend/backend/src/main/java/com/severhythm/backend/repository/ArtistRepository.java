package com.severhythm.backend.repository;

import com.severhythm.backend.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, String> {
    List<Artist> findByNameContainingIgnoreCase(String name);
    List<Artist> findByGenreIgnoreCase(String genre);
}
