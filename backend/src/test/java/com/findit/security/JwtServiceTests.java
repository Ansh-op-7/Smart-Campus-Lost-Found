package com.findit.security;

import com.findit.entity.Role;
import com.findit.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTests {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = new User("Test Student", "student@campus.edu", "hashedPassword", "1234567890", Role.STUDENT);
        user.setId(100L);

        String token = jwtService.generateToken(user);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3);

        String email = jwtService.extractEmail(token);
        assertThat(email).isEqualTo("student@campus.edu");

        Long userId = jwtService.extractUserId(token);
        assertThat(userId).isEqualTo(100L);

        String role = jwtService.extractRole(token);
        assertThat(role).isEqualTo("STUDENT");

        CustomUserDetails userDetails = new CustomUserDetails(user);
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
        assertThat(jwtService.isTokenExpired(token)).isFalse();
    }
}
