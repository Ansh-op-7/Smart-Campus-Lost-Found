package com.findit.repository;

import com.findit.entity.Category;
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
class ItemRepositoryTests {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void testSaveAndQueryItems() {
        User user = userRepository.saveAndFlush(new User("Jane Doe", "jane@campus.edu", "pass123", "555-1234", Role.STUDENT));
        Category category = categoryRepository.saveAndFlush(new Category("Electronics", "Gadgets, laptops, headphones"));

        Item lostLaptop = new Item(
                "Dell XPS 15",
                "Silver Dell laptop left in Science Hall Room 302",
                ItemType.LOST,
                "Science Hall Rm 302",
                "https://images.unsplash.com/photo-laptop",
                LocalDateTime.now().minusDays(1),
                ItemStatus.ACTIVE,
                user,
                category
        );

        Item savedItem = itemRepository.saveAndFlush(lostLaptop);

        assertThat(savedItem.getId()).isNotNull();
        assertThat(savedItem.getCreatedAt()).isNotNull();
        assertThat(savedItem.getStatus()).isEqualTo(ItemStatus.ACTIVE);

        List<Item> lostItems = itemRepository.findByType(ItemType.LOST);
        assertThat(lostItems).hasSize(1);
        assertThat(lostItems.get(0).getTitle()).isEqualTo("Dell XPS 15");

        List<Item> userItems = itemRepository.findByUserId(user.getId());
        assertThat(userItems).hasSize(1);

        List<Item> categoryItems = itemRepository.findByCategoryId(category.getId());
        assertThat(categoryItems).hasSize(1);
    }
}
