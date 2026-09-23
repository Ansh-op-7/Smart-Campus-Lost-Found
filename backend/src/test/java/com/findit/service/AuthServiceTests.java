package com.findit.service;

import com.findit.dto.ApiResponse;
import com.findit.dto.auth.AuthResponse;
import com.findit.dto.auth.LoginRequest;
import com.findit.dto.auth.RegisterRequest;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.DuplicateResourceException;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, authenticationManager);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("Sam Adams", "sam@campus.edu", "plainPassword123", "9876543210");

        when(userRepository.existsByEmail("sam@campus.edu")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword123")).thenReturn("$2a$10$encodedPasswordHash");

        ApiResponse response = authService.register(request);

        assertThat(response.getMessage()).isEqualTo("Registration successful");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getName()).isEqualTo("Sam Adams");
        assertThat(savedUser.getEmail()).isEqualTo("sam@campus.edu");
        assertThat(savedUser.getPassword()).isEqualTo("$2a$10$encodedPasswordHash");
        assertThat(savedUser.getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Sam Adams", "sam@campus.edu", "plainPassword123", "9876543210");
        when(userRepository.existsByEmail("sam@campus.edu")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("An account with this email already exists");
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("sam@campus.edu", "password123");
        User user = new User("Sam Adams", "sam@campus.edu", "hashedPassword", "9876543210", Role.STUDENT);
        user.setId(5L);

        when(userRepository.findByEmail("sam@campus.edu")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getId()).isEqualTo(5L);
        assertThat(response.getUser().getEmail()).isEqualTo("sam@campus.edu");
        assertThat(response.getUser().getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("sam@campus.edu", "wrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
