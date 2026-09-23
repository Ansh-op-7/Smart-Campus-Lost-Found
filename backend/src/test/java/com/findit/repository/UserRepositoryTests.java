package com.findit.repository;

import com.findit.entity.Role;
import com.findit.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindUser() {
        User user = new User("Alex Rivera", "alex@campus.edu", "secret123", "+1234567890", Role.STUDENT);
        User savedUser = userRepository.saveAndFlush(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getCreatedAt()).isNotNull();
        assertThat(savedUser.getUpdatedAt()).isNotNull();

        Optional<User> found = userRepository.findByEmail("alex@campus.edu");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Alex Rivera");
        assertThat(found.get().getRole()).isEqualTo(Role.STUDENT);
        assertThat(userRepository.existsByEmail("alex@campus.edu")).isTrue();
    }
}
