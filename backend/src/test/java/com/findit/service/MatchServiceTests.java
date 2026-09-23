package com.findit.service;

import com.findit.dto.match.MatchResponse;
import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MatchServiceTests {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private MatchService matchService;

    private User user1;
    private User user2;
    private Category walletCategory;
    private Category keysCategory;

    @BeforeEach
    void setUp() {
        user1 = new User("Alice", "alice@findit.edu", "pass", "111", Role.STUDENT);
        user1.setId(1L);

        user2 = new User("Bob", "bob@findit.edu", "pass", "222", Role.STUDENT);
        user2.setId(2L);

        walletCategory = new Category("Wallet", "Wallets and purses");
        walletCategory.setId(10L);

        keysCategory = new Category("Keys", "Room and car keys");
        keysCategory.setId(20L);
    }

    @Test
    @DisplayName("LOST item matches FOUND item with same category, location, title, and date proximity")
    void testLostItemMatchesFoundItem_HighSimilarity() {
        LocalDateTime now = LocalDateTime.now();

        Item lostItem = new Item("Black Leather Wallet", "Lost my black leather wallet with student ID",
                ItemType.LOST, "Main Library 2nd Floor", null, now, ItemStatus.ACTIVE, user1, walletCategory);
        lostItem.setId(100L);

        Item foundItem = new Item("Black Leather Wallet", "Found a black leather wallet near study desks with ID",
                ItemType.FOUND, "Main Library 2nd Floor", null, now.plusHours(2), ItemStatus.ACTIVE, user2, walletCategory);
        foundItem.setId(200L);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByType(ItemType.FOUND)).thenReturn(List.of(foundItem));

        List<MatchResponse> matches = matchService.getMatchesForItem(100L);

        assertNotNull(matches);
        assertEquals(1, matches.size());
        MatchResponse match = matches.get(0);
        assertEquals(200L, match.getItemId());
        assertTrue(match.getMatchScore() >= 80);
        assertTrue(match.getMatchReasons().stream().anyMatch(r -> r.contains("Same category")));
        assertTrue(match.getMatchReasons().stream().anyMatch(r -> r.contains("location")));
        assertTrue(match.getMatchReasons().stream().anyMatch(r -> r.contains("title")));
    }

    @Test
    @DisplayName("FOUND item matches LOST item")
    void testFoundItemMatchesLostItem() {
        LocalDateTime now = LocalDateTime.now();

        Item foundKey = new Item("Silver Key Set", "Found silver key with blue lanyard",
                ItemType.FOUND, "Cafeteria", null, now, ItemStatus.ACTIVE, user1, keysCategory);
        foundKey.setId(300L);

        Item lostKey = new Item("Silver Dorm Keys", "Lost my silver dorm keys with blue lanyard",
                ItemType.LOST, "Cafeteria Entrance", null, now, ItemStatus.ACTIVE, user2, keysCategory);
        lostKey.setId(400L);

        when(itemRepository.findById(300L)).thenReturn(Optional.of(foundKey));
        when(itemRepository.findByType(ItemType.LOST)).thenReturn(List.of(lostKey));

        List<MatchResponse> matches = matchService.getMatchesForItem(300L);

        assertEquals(1, matches.size());
        assertEquals(400L, matches.get(0).getItemId());
        assertTrue(matches.get(0).getMatchScore() >= 60);
    }

    @Test
    @DisplayName("Items with different category, different location, and different keywords score below threshold")
    void testLowScoreFilteredOut() {
        LocalDateTime now = LocalDateTime.now();

        Item lostWallet = new Item("Black Wallet", "Lost wallet",
                ItemType.LOST, "Library", null, now, ItemStatus.ACTIVE, user1, walletCategory);
        lostWallet.setId(100L);

        Item foundUmbrella = new Item("Red Umbrella", "Found umbrella in gym",
                ItemType.FOUND, "Gymnasium", null, now.minusDays(20), ItemStatus.ACTIVE, user2, keysCategory);
        foundUmbrella.setId(500L);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(lostWallet));
        when(itemRepository.findByType(ItemType.FOUND)).thenReturn(List.of(foundUmbrella));

        List<MatchResponse> matches = matchService.getMatchesForItem(100L);

        assertTrue(matches.isEmpty());
    }

    @Test
    @DisplayName("Matches are sorted by match score descending and limit to 10")
    void testMatchesSortedDescendingAndLimited() {
        LocalDateTime now = LocalDateTime.now();

        Item lostItem = new Item("MacBook Pro 14", "Silver laptop in black sleeve",
                ItemType.LOST, "Computer Lab", null, now, ItemStatus.ACTIVE, user1, walletCategory);
        lostItem.setId(100L);

        Item bestMatch = new Item("MacBook Pro 14", "Found silver laptop in black sleeve",
                ItemType.FOUND, "Computer Lab", null, now, ItemStatus.ACTIVE, user2, walletCategory);
        bestMatch.setId(201L);

        Item mediumMatch = new Item("Apple MacBook", "Found apple laptop",
                ItemType.FOUND, "Library", null, now.minusDays(1), ItemStatus.ACTIVE, user2, walletCategory);
        mediumMatch.setId(202L);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByType(ItemType.FOUND)).thenReturn(List.of(mediumMatch, bestMatch));

        List<MatchResponse> matches = matchService.getMatchesForItem(100L);

        assertEquals(2, matches.size());
        assertEquals(201L, matches.get(0).getItemId());
        assertEquals(202L, matches.get(1).getItemId());
        assertTrue(matches.get(0).getMatchScore() >= matches.get(1).getMatchScore());
    }

    @Test
    @DisplayName("Same item is excluded from matches")
    void testSameItemExcluded() {
        Item item = new Item("Test Item", "Desc", ItemType.LOST, "Location", null, LocalDateTime.now(), ItemStatus.ACTIVE, user1, walletCategory);
        item.setId(100L);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(item));
        when(itemRepository.findByType(ItemType.FOUND)).thenReturn(List.of(item));

        List<MatchResponse> matches = matchService.getMatchesForItem(100L);

        assertTrue(matches.isEmpty());
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when item does not exist")
    void testItemNotFoundThrowsException() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> matchService.getMatchesForItem(999L));
    }
}
