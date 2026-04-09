package com.severhythm.backend.repository;

import com.severhythm.backend.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, String> {
    List<Album> findByArtistId(String artistId);
    List<Album> findByTitleContainingIgnoreCase(String title);
}
