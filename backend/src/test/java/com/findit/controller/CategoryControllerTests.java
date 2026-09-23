package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.category.CategoryRequest;
import com.findit.entity.Category;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CategoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.findit.repository.NotificationRepository notificationRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        User student = userRepository.saveAndFlush(new User("Student User", "student@test.com", "pass", "123", Role.STUDENT));
        User admin = userRepository.saveAndFlush(new User("Admin User", "admin@test.com", "pass", "123", Role.ADMIN));

        studentToken = jwtService.generateToken(student);
        adminToken = jwtService.generateToken(admin);
    }

    @Test
    void testStudentCanViewCategories() throws Exception {
        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testAdminCanCreateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest("Smart Gadgets", "Smartwatches, fitness bands");

        mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Smart Gadgets"));
    }

    @Test
    void testStudentCannotCreateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest("Hacker Category", "Unauthorized");

        mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanUpdateCategory() throws Exception {
        Category category = categoryRepository.saveAndFlush(new Category("Old Name", "Old Description"));
        CategoryRequest updateRequest = new CategoryRequest("Updated Name", "Updated Description");

        mockMvc.perform(put("/api/categories/" + category.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void testStudentCannotUpdateCategory() throws Exception {
        Category category = categoryRepository.saveAndFlush(new Category("Protected Category", "Desc"));
        CategoryRequest updateRequest = new CategoryRequest("Student Renamed", "Desc");

        mockMvc.perform(put("/api/categories/" + category.getId())
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanDeleteCategory() throws Exception {
        Category category = categoryRepository.saveAndFlush(new Category("Temp Category", "To be deleted"));

        mockMvc.perform(delete("/api/categories/" + category.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Category deleted successfully"));
    }

    @Test
    void testStudentCannotDeleteCategory() throws Exception {
        Category category = categoryRepository.saveAndFlush(new Category("Immortal Category", "Desc"));

        mockMvc.perform(delete("/api/categories/" + category.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}
