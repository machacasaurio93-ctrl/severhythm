package com.severhythm.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path audioPath;
    private Path imagePath;

    // Tipos MIME permitidos
    private static final Set<String> ALLOWED_AUDIO = Set.of("audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac");
    private static final Set<String> ALLOWED_IMAGE = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @PostConstruct
    public void init() {
        try {
            audioPath = Paths.get(uploadDir, "audio").toAbsolutePath().normalize();
            imagePath = Paths.get(uploadDir, "images").toAbsolutePath().normalize();
            Files.createDirectories(audioPath);
            Files.createDirectories(imagePath);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads", e);
        }
    }

    public String storeAudio(MultipartFile file) {
        validateFile(file, ALLOWED_AUDIO, 50 * 1024 * 1024); // maximo 50MB
        String filename = generateFilename(file.getOriginalFilename());
        return storeFile(file, audioPath, filename);
    }

    public String storeImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE, 10 * 1024 * 1024); // maximo 10MB
        String filename = generateFilename(file.getOriginalFilename());
        return storeFile(file, imagePath, filename);
    }

    public Path getAudioPath() { return audioPath; }
    public Path getImagePath() { return imagePath; }

    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/api/files/")) return false;
        try {
            // Convertir la URL a la ruta en disco
            String relativePath = fileUrl.replace("/api/files/", "");
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(relativePath).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSize) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("El archivo excede el tamaño máximo permitido");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido: " + contentType);
        }
    }

    private String generateFilename(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private String storeFile(MultipartFile file, Path directory, String filename) {
        try {
            Path targetLocation = directory.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            // Devolvemos la ruta relativa que usara el frontend
            String type = directory.equals(audioPath) ? "audio" : "images";
            return "/api/files/" + type + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error almacenando archivo: " + e.getMessage(), e);
        }
    }
}
