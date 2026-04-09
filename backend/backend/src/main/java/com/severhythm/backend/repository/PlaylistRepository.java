package com.severhythm.backend.repository;

import com.severhythm.backend.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {
    List<Playlist> findByUserId(String userId);
    List<Playlist> findByUserIdOrderByCreatedAtDesc(String userId);
}
