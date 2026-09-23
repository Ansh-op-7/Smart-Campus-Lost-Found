package com.findit.repository;

import com.findit.entity.Category;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ClaimRepositoryTests {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void testSaveAndQueryClaims() {
        User finder = userRepository.saveAndFlush(new User("Finder Sam", "sam@campus.edu", "pass1", "555-0001", Role.STUDENT));
        User claimant = userRepository.saveAndFlush(new User("Claimant Bob", "bob@campus.edu", "pass2", "555-0002", Role.STUDENT));
        Category category = categoryRepository.saveAndFlush(new Category("Keys", "Campus room & vehicle keys"));

        Item foundKeys = itemRepository.saveAndFlush(new Item(
                "Car Key Fob",
                "Found near campus library entrance with blue lanyard",
                ItemType.FOUND,
                "Library Entrance",
                null,
                LocalDateTime.now(),
                ItemStatus.ACTIVE,
                finder,
                category
        ));

        Claim claim = new Claim(
                "It is my Honda key with a blue lanyard and a small cat keychain.",
                ClaimStatus.PENDING,
                foundKeys,
                claimant
        );

        Claim savedClaim = claimRepository.saveAndFlush(claim);

        assertThat(savedClaim.getId()).isNotNull();
        assertThat(savedClaim.getCreatedAt()).isNotNull();
        assertThat(savedClaim.getStatus()).isEqualTo(ClaimStatus.PENDING);

        List<Claim> itemClaims = claimRepository.findByItemId(foundKeys.getId());
        assertThat(itemClaims).hasSize(1);
        assertThat(itemClaims.get(0).getUser().getEmail()).isEqualTo("bob@campus.edu");

        boolean exists = claimRepository.existsByItemIdAndUserId(foundKeys.getId(), claimant.getId());
        assertThat(exists).isTrue();
    }
}
