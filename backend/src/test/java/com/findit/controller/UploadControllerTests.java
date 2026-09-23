package com.findit.controller;

import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UploadControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private com.findit.repository.NotificationRepository notificationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String userToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();
        User user = userRepository.saveAndFlush(new User("Test Student", "uploader@campus.edu", "pass", "123", Role.STUDENT));
        userToken = jwtService.generateToken(user);
    }

    @Test
    void testAuthenticatedImageUploadSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "campus_photo.jpg",
                "image/jpeg",
                "dummy image content bytes".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/uploads/items")
                        .file(file)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").isNotEmpty())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("/uploads/items/");
        assertThat(responseBody).endsWith(".jpg\"}");
    }

    @Test
    void testUnauthenticatedUploadFailsWith401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                "bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads/items")
                        .file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testEmptyFileRejected() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/uploads/items")
                        .file(emptyFile)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Please select an image file to upload"));
    }

    @Test
    void testUnsupportedFormatRejected() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "%PDF-1.4 dummy pdf bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads/items")
                        .file(pdfFile)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only JPG, JPEG, PNG and WEBP images up to 5MB are allowed"));
    }

    @Test
    void testFileTooLargeRejected() throws Exception {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6 MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeBytes
        );

        mockMvc.perform(multipart("/api/uploads/items")
                        .file(largeFile)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUploadedFileCanBeAccessedThroughStaticResource() throws Exception {
        byte[] sampleImage = "PNG_SAMPLE_DATA".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.png",
                "image/png",
                sampleImage
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/uploads/items")
                        .file(file)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = uploadResult.getResponse().getContentAsString();
        String imageUrl = responseContent.substring(responseContent.indexOf("/uploads/items/"), responseContent.lastIndexOf("\""));

        mockMvc.perform(get(imageUrl))
                .andExpect(status().isOk());
    }
}
