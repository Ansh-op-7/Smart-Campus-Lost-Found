package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.entity.Category;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MatchControllerTests {

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

    private User student1;
    private User student2;
    private String student1Token;
    private Category walletCategory;
    private Item lostWallet;
    private Item foundWallet;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        student1 = userRepository.saveAndFlush(new User("Alice Student", "alice@campus.edu", "pass123", "111", Role.STUDENT));
        student2 = userRepository.saveAndFlush(new User("Bob Student", "bob@campus.edu", "pass123", "222", Role.STUDENT));

        student1Token = jwtService.generateToken(student1);

        walletCategory = categoryRepository.findByName("Wallet")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Wallet", "Wallets")));

        lostWallet = itemRepository.saveAndFlush(new Item(
                "Black Leather Wallet",
                "Lost my black leather wallet with student card",
                ItemType.LOST,
                "University Library 2nd Floor",
                null,
                LocalDateTime.now(),
                ItemStatus.ACTIVE,
                student1,
                walletCategory
        ));

        foundWallet = itemRepository.saveAndFlush(new Item(
                "Black Leather Wallet",
                "Found a black wallet with student card inside",
                ItemType.FOUND,
                "University Library 2nd Floor",
                null,
                LocalDateTime.now().plusHours(1),
                ItemStatus.ACTIVE,
                student2,
                walletCategory
        ));
    }

    @Test
    @DisplayName("Unauthenticated request to matches returns 401 Unauthorized")
    void testGetMatchesUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/items/" + lostWallet.getId() + "/matches"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Authenticated user receives matches for lost item")
    void testGetMatchesAuthenticatedSuccess() throws Exception {
        mockMvc.perform(get("/api/items/" + lostWallet.getId() + "/matches")
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].itemId").value(foundWallet.getId()))
                .andExpect(jsonPath("$[0].title").value("Black Leather Wallet"))
                .andExpect(jsonPath("$[0].type").value("FOUND"))
                .andExpect(jsonPath("$[0].matchScore").isNumber())
                .andExpect(jsonPath("$[0].matchReasons").isArray());
    }

    @Test
    @DisplayName("Matches endpoint returns 404 for non-existent item")
    void testGetMatchesItemNotFound() throws Exception {
        mockMvc.perform(get("/api/items/99999/matches")
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isNotFound());
    }
}
