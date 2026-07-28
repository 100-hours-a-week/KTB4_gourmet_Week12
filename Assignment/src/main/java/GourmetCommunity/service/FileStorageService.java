package GourmetCommunity.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp"
    );

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final Path uploadRootPath = Paths.get("uploads")
            .toAbsolutePath()
            .normalize();

    public String saveFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        validateFile(file);
        validateFolderName(folderName);

        try {
            Path folderPath = uploadRootPath.resolve(folderName).normalize();

            if (!folderPath.startsWith(uploadRootPath)) {
                throw new IllegalArgumentException("잘못된 저장 경로입니다.");
            }

            Files.createDirectories(folderPath);

            String originalFileName = file.getOriginalFilename();
            String extension = getExtension(originalFileName);
            String storedFileName = UUID.randomUUID() + extension;

            Path filePath = folderPath.resolve(storedFileName).normalize();

            if (!filePath.startsWith(folderPath)) {
                throw new IllegalArgumentException("잘못된 파일 경로입니다.");
            }

            file.transferTo(filePath.toFile());

            return "/uploads/" + folderName + "/" + storedFileName;
        } catch (IOException error) {
            throw new IllegalStateException("파일 저장에 실패했습니다.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 5MB 이하만 가능합니다.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        String extension = getExtension(file.getOriginalFilename());

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않는 이미지 확장자입니다.");
        }
    }

    private void validateFolderName(String folderName) {
        if (folderName == null || folderName.isBlank()) {
            throw new IllegalArgumentException("저장 폴더명이 필요합니다.");
        }

        if (folderName.contains("..") || folderName.contains("/") || folderName.contains("\\")) {
            throw new IllegalArgumentException("잘못된 저장 폴더명입니다.");
        }
    }

    private String getExtension(String originalFileName) {
        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new IllegalArgumentException("파일 확장자가 필요합니다.");
        }

        return originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
    }

}
