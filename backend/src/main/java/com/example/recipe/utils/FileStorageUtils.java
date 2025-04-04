package com.example.recipe.utils;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public class FileStorageUtils {

    private static final String UPLOAD_DIR = "uploads/recipe-cover-images/";

    public static String saveMultipartFileImage(MultipartFile file){
        try {
            // Ensure directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate a unique filename (to avoid overwrites)
            String originalFilename = file.getOriginalFilename();
            //String fileExtension = StringUtils.getFilenameExtension(originalFilename);
            String uniqueFileName = System.currentTimeMillis() +  "_" + originalFilename;

            // Save the file
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the accessible URL (this depends on your server setup)
            return "/uploads/recipe-cover-images/" + uniqueFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store the image", e);
        }
    }

}
