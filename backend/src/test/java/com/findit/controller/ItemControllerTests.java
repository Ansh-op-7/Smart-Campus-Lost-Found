package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.item.CreateItemRequest;
import com.findit.dto.item.UpdateItemRequest;
import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.CategoryRepository;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemControllerTests {

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
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User user1;
    private User user2;
    private User adminUser;
    private Category category;

    private String user1Token;
    private String user2Token;
    private String adminToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.saveAndFlush(new User("Ansh Sharma", "ansh@example.com", "pass", "9876543210", Role.STUDENT));
        user2 = userRepository.saveAndFlush(new User("Other Student", "other@example.com", "pass", "1234567890", Role.STUDENT));
        adminUser = userRepository.saveAndFlush(new User("Campus Admin", "admin@findit.edu", "pass", "0000000000", Role.ADMIN));

        user1Token = jwtService.generateToken(user1);
        user2Token = jwtService.generateToken(user2);
        adminToken = jwtService.generateToken(adminUser);

        category = categoryRepository.findByName("Wallet")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Wallet", "Wallets and cardholders")));
    }

    @Test
    void testAuthenticatedUserCanCreateItem() throws Exception {
        CreateItemRequest request = new CreateItemRequest(
                "Black Leather Wallet",
                "Black leather wallet with a student ID inside",
                ItemType.LOST,
                "University Library",
                "/uploads/items/sample-wallet.jpg",
                category.getId(),
                LocalDateTime.now().minusHours(2)
        );

        mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Black Leather Wallet"))
                .andExpect(jsonPath("$.type").value("LOST"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.imageUrl").value("/uploads/items/sample-wallet.jpg"))
                .andExpect(jsonPath("$.category.name").value("Wallet"))
                .andExpect(jsonPath("$.reportedBy.email").value("ansh@example.com"));

        assertThat(itemRepository.count()).isEqualTo(1);
    }

    @Test
    void testItemCanBeCreatedWithoutImage() throws Exception {
        CreateItemRequest request = new CreateItemRequest(
                "Blue Backpack",
                "Navy blue Jansport backpack",
                ItemType.LOST,
                "Student Center",
                null,
                category.getId(),
                LocalDateTime.now()
        );

        mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl").isEmpty());
    }

    @Test
    void testMultipartItemCreationWithImage() throws Exception {
        CreateItemRequest itemDto = new CreateItemRequest(
                "Scientific Calculator",
                "Casio fx-991EX calculator",
                ItemType.FOUND,
                "Math Building 101",
                null,
                category.getId(),
                LocalDateTime.now()
        );

        MockMultipartFile itemPart = new MockMultipartFile(
                "item",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(itemDto)
        );

        MockMultipartFile imagePart = new MockMultipartFile(
                "image",
                "calc.png",
                "image/png",
                "IMAGE_PNG_BYTES".getBytes()
        );

        mockMvc.perform(multipart("/api/items/with-image")
                        .file(itemPart)
                        .file(imagePart)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Scientific Calculator"))
                .andExpect(jsonPath("$.imageUrl").isNotEmpty());
    }

    @Test
    void testUnauthenticatedUserCannotCreateItem() throws Exception {
        CreateItemRequest request = new CreateItemRequest(
                "Black Leather Wallet",
                "Description",
                ItemType.LOST,
                "Library",
                null,
                category.getId(),
                LocalDateTime.now()
        );

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUserCanViewAllItems() throws Exception {
        itemRepository.saveAndFlush(new Item("Dell Laptop", "Silver laptop", ItemType.LOST, "Science Hall", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));
        itemRepository.saveAndFlush(new Item("Keys", "Room keys", ItemType.FOUND, "Cafeteria", null, LocalDateTime.now(), ItemStatus.ACTIVE, user2, category));

        mockMvc.perform(get("/api/items")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testUserCanFilterAndSearchItems() throws Exception {
        itemRepository.saveAndFlush(new Item("Black Leather Wallet", "Found in library", ItemType.FOUND, "Library 2nd floor", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));
        itemRepository.saveAndFlush(new Item("MacBook Pro", "Space Gray", ItemType.LOST, "Engineering Lab", null, LocalDateTime.now(), ItemStatus.ACTIVE, user2, category));

        mockMvc.perform(get("/api/items?type=FOUND&search=wallet")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Black Leather Wallet"));
    }

    @Test
    void testUserCanViewSingleItemById() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("Black Wallet", "Leather wallet", ItemType.LOST, "Library", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        mockMvc.perform(get("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(item.getId()))
                .andExpect(jsonPath("$.title").value("Black Wallet"));
    }

    @Test
    void testMissingItemReturns404() throws Exception {
        mockMvc.perform(get("/api/items/99999")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Item not found with id: 99999"));
    }

    @Test
    void testUserCanViewMyItems() throws Exception {
        itemRepository.saveAndFlush(new Item("User1 Item 1", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));
        itemRepository.saveAndFlush(new Item("User1 Item 2", "Desc", ItemType.FOUND, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));
        itemRepository.saveAndFlush(new Item("User2 Item", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user2, category));

        mockMvc.perform(get("/api/items/my")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].reportedBy.email").value("ansh@example.com"));
    }

    @Test
    void testUserCanUpdateTheirOwnItemAndReplaceImage() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("Old Title", "Old Desc", ItemType.LOST, "Old Loc", "/uploads/items/old-image.jpg", LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        UpdateItemRequest updateRequest = new UpdateItemRequest(
                "Updated Title",
                "Updated Desc",
                ItemType.LOST,
                "New Loc",
                "/uploads/items/new-image.jpg",
                null,
                null,
                ItemStatus.CLAIMED
        );

        mockMvc.perform(put("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.imageUrl").value("/uploads/items/new-image.jpg"))
                .andExpect(jsonPath("$.status").value("CLAIMED"));
    }

    @Test
    void testUserCannotUpdateAnotherUsersItem() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("User1 Item", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        UpdateItemRequest updateRequest = new UpdateItemRequest("Hacked Title", null, null, null, null, null, null, null);

        mockMvc.perform(put("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + user2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You are not allowed to modify this item"));
    }

    @Test
    void testUserCanDeleteTheirOwnItem() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("To Delete", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        mockMvc.perform(delete("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Item deleted successfully"));

        assertThat(itemRepository.existsById(item.getId())).isFalse();
    }

    @Test
    void testUserCannotDeleteAnotherUsersItem() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("User1 Item", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        mockMvc.perform(delete("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You are not allowed to delete this item"));

        assertThat(itemRepository.existsById(item.getId())).isTrue();
    }

    @Test
    void testAdminCanUpdateAndDeleteAnyItem() throws Exception {
        Item item = itemRepository.saveAndFlush(new Item("Student Item", "Desc", ItemType.LOST, "Loc", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, category));

        UpdateItemRequest updateRequest = new UpdateItemRequest("Admin Updated", null, null, null, null, null, null, ItemStatus.RETURNED);

        mockMvc.perform(put("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Admin Updated"))
                .andExpect(jsonPath("$.status").value("RETURNED"));

        mockMvc.perform(delete("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Item deleted successfully"));

        assertThat(itemRepository.existsById(item.getId())).isFalse();
    }
}
