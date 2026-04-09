package com.severhythm.backend;

import com.severhythm.backend.model.*;
import com.severhythm.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private ArtistRepository artistRepo;
    @Autowired private AlbumRepository albumRepo;
    @Autowired private SongRepository songRepo;

    @Override
    public void run(String... args) throws Exception {
        if (artistRepo.count() > 0) return;

        System.out.println("--- INICIANDO CARGA DE DATOS AUTOMATICA ---");

        // Artista 1
        Artist daftPunk = new Artist();
        daftPunk.setName("Daft Punk");
        daftPunk.setGenre("Electronic");
        daftPunk.setBio("Duo frances de musica electronica formado en 1993.");
        daftPunk.setImageUrl("https://picsum.photos/400/400?random=2");
        daftPunk = artistRepo.save(daftPunk);

        Album ram = new Album();
        ram.setTitle("Random Access Memories");
        ram.setYear(2013);
        ram.setGenre("Funk / Disco");
        ram.setCoverUrl("https://picsum.photos/300/300?random=5");
        ram.setArtistId(daftPunk.getId());
        ram = albumRepo.save(ram);

        Song getLucky = new Song();
        getLucky.setTitle("Get Lucky");
        getLucky.setDuration("4:08");
        getLucky.setIsFavorite(true);
        getLucky.setPlays(5000);
        getLucky.setAlbumId(ram.getId());
        getLucky.setArtistId(daftPunk.getId());
        getLucky.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        songRepo.save(getLucky);

        Song instantCrush = new Song();
        instantCrush.setTitle("Instant Crush");
        instantCrush.setDuration("5:37");
        instantCrush.setIsFavorite(false);
        instantCrush.setPlays(3200);
        instantCrush.setAlbumId(ram.getId());
        instantCrush.setArtistId(daftPunk.getId());
        instantCrush.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3");
        songRepo.save(instantCrush);

        // Artista 2
        Artist midnight = new Artist();
        midnight.setName("The Midnight");
        midnight.setGenre("Synthwave");
        midnight.setBio("Banda de synthwave de Los Angeles.");
        midnight.setImageUrl("https://picsum.photos/400/400?random=10");
        midnight = artistRepo.save(midnight);

        Album endless = new Album();
        endless.setTitle("Endless Summer");
        endless.setYear(2016);
        endless.setGenre("Synthwave");
        endless.setCoverUrl("https://picsum.photos/300/300?random=11");
        endless.setArtistId(midnight.getId());
        endless = albumRepo.save(endless);

        Song vampires = new Song();
        vampires.setTitle("Vampires");
        vampires.setDuration("5:17");
        vampires.setIsFavorite(true);
        vampires.setPlays(1200);
        vampires.setAlbumId(endless.getId());
        vampires.setArtistId(midnight.getId());
        vampires.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
        songRepo.save(vampires);

        // Artista 3
        Artist m83 = new Artist();
        m83.setName("M83");
        m83.setGenre("Dream Pop");
        m83.setBio("Proyecto de musica electronica de Anthony Gonzalez.");
        m83.setImageUrl("https://picsum.photos/400/400?random=20");
        m83 = artistRepo.save(m83);

        Album hurryUp = new Album();
        hurryUp.setTitle("Hurry Up, We're Dreaming");
        hurryUp.setYear(2011);
        hurryUp.setGenre("Dream Pop");
        hurryUp.setCoverUrl("https://picsum.photos/300/300?random=21");
        hurryUp.setArtistId(m83.getId());
        hurryUp = albumRepo.save(hurryUp);

        Song midnightCity = new Song();
        midnightCity.setTitle("Midnight City");
        midnightCity.setDuration("4:03");
        midnightCity.setIsFavorite(false);
        midnightCity.setPlays(8500);
        midnightCity.setAlbumId(hurryUp.getId());
        midnightCity.setArtistId(m83.getId());
        midnightCity.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3");
        songRepo.save(midnightCity);

        System.out.println("--- DATOS CARGADOS CON EXITO: 3 artistas, 3 albumes, 4 canciones ---");
    }
}
