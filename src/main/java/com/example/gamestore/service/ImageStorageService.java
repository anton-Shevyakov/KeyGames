package com.example.gamestore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final Path uploadDir;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeGameImage(Long gameId, MultipartFile file) throws IOException {
        validateFile(file);

        Path gamesDir = uploadDir.resolve("games");
        Files.createDirectories(gamesDir);

        String extension = resolveExtension(file);
        String filename = gameId + "_" + UUID.randomUUID() + extension;
        Path target = gamesDir.resolve(filename);

        Files.copy(file.getInputStream(), target);

        return "/uploads/games/" + filename;
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.startsWith("/uploads/")) {
            return;
        }

        Path filePath = uploadDir.resolve(imageUrl.substring("/uploads/".length()));
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл зображення не обрано");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Розмір файлу не може перевищувати 5 МБ");
        }
        if (!isAllowedImage(file.getContentType(), file.getOriginalFilename())) {
            throw new IllegalArgumentException("Дозволені формати: JPEG, PNG, WebP, GIF");
        }
    }

    private boolean isAllowedImage(String contentType, String filename) {
        if (contentType != null) {
            if (ALLOWED_CONTENT_TYPES.contains(contentType)) {
                return true;
            }
            if ("image/jpg".equals(contentType) || "image/pjpeg".equals(contentType)) {
                return true;
            }
            if ("application/octet-stream".equals(contentType) && hasAllowedExtension(filename)) {
                return true;
            }
        }
        return hasAllowedExtension(filename);
    }

    private boolean hasAllowedExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".png")
                || lower.endsWith(".webp")
                || lower.endsWith(".gif");
    }

    private String resolveExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".jpeg")) {
                return ".jpeg";
            }
            if (lower.endsWith(".jpg")) {
                return ".jpg";
            }
            if (lower.endsWith(".png")) {
                return ".png";
            }
            if (lower.endsWith(".webp")) {
                return ".webp";
            }
            if (lower.endsWith(".gif")) {
                return ".gif";
            }
        }

        String contentType = file.getContentType();
        if (contentType != null) {
            return switch (contentType) {
                case "image/jpeg", "image/jpg", "image/pjpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                case "image/gif" -> ".gif";
                default -> ".jpg";
            };
        }
        return ".jpg";
    }
}
