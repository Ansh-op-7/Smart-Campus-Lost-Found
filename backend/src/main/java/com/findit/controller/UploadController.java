package com.findit.controller;

import com.findit.dto.item.UploadImageResponse;
import com.findit.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService fileStorageService;

    public UploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/items")
    public ResponseEntity<UploadImageResponse> uploadItemImage(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        MultipartFile uploadFile = file != null ? file : image;
        String imageUrl = fileStorageService.storeImage(uploadFile);
        return ResponseEntity.ok(new UploadImageResponse(imageUrl));
    }
}
