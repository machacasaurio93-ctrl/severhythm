package com.severhythm.backend.repository;

import com.severhythm.backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, String> {
    List<Song> findByAlbumId(String albumId);
    List<Song> findByArtistId(String artistId);
    List<Song> findByIsFavoriteTrue();
    List<Song> findByTitleContainingIgnoreCase(String title);
}
