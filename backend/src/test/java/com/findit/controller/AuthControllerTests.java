package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.auth.LoginRequest;
import com.findit.dto.auth.RegisterRequest;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.findit.repository.NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Ansh Sharma", "ansh@example.com", "password123", "9876543210");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"));

        User savedUser = userRepository.findByEmail("ansh@example.com").orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("Ansh Sharma");
        assertThat(savedUser.getRole()).isEqualTo(Role.STUDENT);
        assertThat(passwordEncoder.matches("password123", savedUser.getPassword())).isTrue();
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        User existingUser = new User("Existing User", "ansh@example.com", passwordEncoder.encode("pass123"), "1234567890", Role.STUDENT);
        userRepository.saveAndFlush(existingUser);

        RegisterRequest request = new RegisterRequest("Ansh Sharma", "ansh@example.com", "password123", "9876543210");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "not-an-email", "123", "");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLoginSuccess() throws Exception {
        User user = new User("Ansh Sharma", "ansh@example.com", passwordEncoder.encode("password123"), "9876543210", Role.STUDENT);
        userRepository.saveAndFlush(user);

        LoginRequest request = new LoginRequest("ansh@example.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("ansh@example.com"))
                .andExpect(jsonPath("$.user.name").value("Ansh Sharma"))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));
    }

    @Test
    void testLoginInvalidCredentials() throws Exception {
        User user = new User("Ansh Sharma", "ansh@example.com", passwordEncoder.encode("password123"), "9876543210", Role.STUDENT);
        userRepository.saveAndFlush(user);

        LoginRequest request = new LoginRequest("ansh@example.com", "wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void testLoginUnknownEmail() throws Exception {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "anyPassword123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void testLoginAdminRolePreserved() throws Exception {
        User admin = new User("Admin User", "admin@campus.edu", passwordEncoder.encode("Admin@123"), "1122334455", Role.ADMIN);
        userRepository.saveAndFlush(admin);

        LoginRequest request = new LoginRequest("admin@campus.edu", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("admin@campus.edu"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void testProtectedEndpointRejectsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/test/protected"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized access. Token is missing, invalid, or expired."));
    }

    @Test
    void testProtectedEndpointAccessibleWithValidJwt() throws Exception {
        User user = new User("Ansh Sharma", "ansh@example.com", passwordEncoder.encode("password123"), "9876543210", Role.STUDENT);
        user = userRepository.saveAndFlush(user);

        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/test/protected")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access granted to protected resource for user: ansh@example.com"));
    }

    @Test
    void testDashboardEndpointsAccessibleWithValidJwt() throws Exception {
        User user = new User("Ansh Sharma", "ansh@example.com", passwordEncoder.encode("password123"), "9876543210", Role.STUDENT);
        user = userRepository.saveAndFlush(user);

        String token = jwtService.generateToken(user);

        // Access notifications unread count
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").exists());

        // Access my items
        mockMvc.perform(get("/api/items/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
