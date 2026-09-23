package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.admin.UpdateUserRoleRequest;
import com.findit.entity.Category;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.NotificationRepository;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AdminControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User studentUser;
    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = userRepository.saveAndFlush(new User("Admin Master", "admin@campus.edu", "pass123", "1112223333", Role.ADMIN));
        studentUser = userRepository.saveAndFlush(new User("Rahul Student", "rahul@campus.edu", "pass123", "9998887777", Role.STUDENT));

        adminToken = jwtService.generateToken(adminUser);
        studentToken = jwtService.generateToken(studentUser);
    }

    @Test
    @DisplayName("1. Student cannot access admin dashboard -> 403 Forbidden")
    void testStudentCannotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("2. Admin can access admin dashboard -> 200 OK")
    void testAdminCanAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(2))
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.pendingClaims").value(0));
    }

    @Test
    @DisplayName("3. Student cannot list users -> 403 Forbidden")
    void testStudentCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Admin can list all users and search by name/email")
    void testAdminCanListAndSearchUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/admin/users")
                        .param("search", "rahul")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Rahul Student"));
    }

    @Test
    @DisplayName("5. Student cannot update user roles -> 403 Forbidden")
    void testStudentCannotChangeRole() throws Exception {
        UpdateUserRoleRequest request = new UpdateUserRoleRequest(Role.ADMIN);

        mockMvc.perform(put("/api/admin/users/" + studentUser.getId() + "/role")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Admin can promote student to ADMIN")
    void testAdminCanPromoteStudent() throws Exception {
        UpdateUserRoleRequest request = new UpdateUserRoleRequest(Role.ADMIN);

        mockMvc.perform(put("/api/admin/users/" + studentUser.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        User updated = userRepository.findById(studentUser.getId()).orElseThrow();
        assertThat(updated.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("7. Demoting the only admin is rejected -> 400 Bad Request")
    void testDemoteLastAdminRejected() throws Exception {
        UpdateUserRoleRequest request = new UpdateUserRoleRequest(Role.STUDENT);

        mockMvc.perform(put("/api/admin/users/" + adminUser.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot demote the last administrator account. At least one admin must remain in the system."));
    }

    @Test
    @DisplayName("8. Student cannot access admin items -> 403 Forbidden")
    void testStudentCannotAccessAdminItems() throws Exception {
        mockMvc.perform(get("/api/admin/items")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9. Admin can access admin items list with filters")
    void testAdminCanAccessAdminItems() throws Exception {
        Category cat = categoryRepository.findByName("Electronics")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Electronics", "Gadgets")));
        itemRepository.saveAndFlush(new Item("Lost Headphones", "Lost at cafeteria", ItemType.LOST, "Cafeteria", null, LocalDateTime.now(), ItemStatus.ACTIVE, studentUser, cat));

        mockMvc.perform(get("/api/admin/items")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Lost Headphones"));
    }

    @Test
    @DisplayName("10. Student cannot access admin claims -> 403 Forbidden")
    void testStudentCannotAccessAdminClaims() throws Exception {
        mockMvc.perform(get("/api/admin/claims")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. Admin can access admin claims list")
    void testAdminCanAccessAdminClaims() throws Exception {
        Category cat = categoryRepository.findByName("Keys")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Keys", "Campus Keys")));
        Item item = itemRepository.saveAndFlush(new Item("Found Room Key", "Found in library", ItemType.FOUND, "Library", null, LocalDateTime.now(), ItemStatus.ACTIVE, adminUser, cat));
        claimRepository.saveAndFlush(new Claim("My room key", ClaimStatus.PENDING, item, studentUser));

        mockMvc.perform(get("/api/admin/claims")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].message").value("My room key"));
    }

    @Test
    @DisplayName("12. Admin dashboard statistics are accurate")
    void testAdminDashboardStatsAccurate() throws Exception {
        Category cat = categoryRepository.findByName("Electronics")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Electronics", "Gadgets")));
        itemRepository.saveAndFlush(new Item("Lost Phone", "Lost", ItemType.LOST, "Library", null, LocalDateTime.now(), ItemStatus.ACTIVE, studentUser, cat));
        Item found = itemRepository.saveAndFlush(new Item("Found Wallet", "Found", ItemType.FOUND, "Gym", null, LocalDateTime.now(), ItemStatus.CLAIMED, adminUser, cat));
        claimRepository.saveAndFlush(new Claim("Claim 1", ClaimStatus.PENDING, found, studentUser));

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(2))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.lostItems").value(1))
                .andExpect(jsonPath("$.foundItems").value(1))
                .andExpect(jsonPath("$.activeItems").value(1))
                .andExpect(jsonPath("$.claimedItems").value(1))
                .andExpect(jsonPath("$.pendingClaims").value(1));
    }

    @Test
    @DisplayName("13. Passwords are never returned in AdminUserResponse")
    void testPasswordNeverReturned() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[1].password").doesNotExist());
    }
}
