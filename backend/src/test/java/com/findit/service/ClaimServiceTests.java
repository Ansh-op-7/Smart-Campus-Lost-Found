package com.findit.service;

import com.findit.dto.claim.ClaimResponse;
import com.findit.dto.claim.CreateClaimRequest;
import com.findit.dto.claim.UpdateClaimStatusRequest;
import com.findit.entity.Category;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.UnauthorizedOperationException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimServiceTests {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    private User reporterUser;
    private User claimantUser;
    private User unrelatedUser;
    private CustomUserDetails claimantDetails;
    private CustomUserDetails reporterDetails;
    private CustomUserDetails unrelatedDetails;
    private Category category;
    private Item foundItem;
    private Item lostItem;

    @BeforeEach
    void setUp() {
        reporterUser = new User("Reporter User", "reporter@campus.edu", "pass123", "111-222-3333", Role.STUDENT);
        reporterUser.setId(1L);

        claimantUser = new User("Claimant User", "claimant@campus.edu", "pass123", "444-555-6666", Role.STUDENT);
        claimantUser.setId(2L);

        unrelatedUser = new User("Unrelated User", "unrelated@campus.edu", "pass123", "777-888-9999", Role.STUDENT);
        unrelatedUser.setId(3L);

        reporterDetails = new CustomUserDetails(reporterUser);
        claimantDetails = new CustomUserDetails(claimantUser);
        unrelatedDetails = new CustomUserDetails(unrelatedUser);

        category = new Category("Electronics", "Gadgets & phones");
        category.setId(10L);

        foundItem = new Item("Blue Backpack", "Found in library", ItemType.FOUND, "Library 2nd Floor",
                null, LocalDateTime.now(), ItemStatus.ACTIVE, reporterUser, category);
        foundItem.setId(100L);

        lostItem = new Item("Lost Glasses", "Black frame", ItemType.LOST, "Cafeteria",
                null, LocalDateTime.now(), ItemStatus.ACTIVE, reporterUser, category);
        lostItem.setId(200L);
    }

    @Test
    @DisplayName("1. Student can create claim for FOUND active item")
    void testCreateClaim_Success() {
        CreateClaimRequest request = new CreateClaimRequest(foundItem.getId(), "This is my blue backpack with a keychain inside.");

        when(userRepository.findById(claimantDetails.getId())).thenReturn(Optional.of(claimantUser));
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));
        when(claimRepository.existsByItemIdAndUserIdAndStatusIn(eq(foundItem.getId()), eq(claimantUser.getId()), any()))
                .thenReturn(false);

        Claim savedClaim = new Claim(request.getMessage(), ClaimStatus.PENDING, foundItem, claimantUser);
        savedClaim.setId(500L);
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimResponse response = claimService.createClaim(request, claimantDetails);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(ClaimStatus.PENDING, response.getStatus());
        assertEquals(claimantUser.getId(), response.getClaimant().getId());
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    @DisplayName("2. Student cannot claim LOST item")
    void testCreateClaim_FailsForLostItem() {
        CreateClaimRequest request = new CreateClaimRequest(lostItem.getId(), "I want to claim this lost item");

        when(userRepository.findById(claimantDetails.getId())).thenReturn(Optional.of(claimantUser));
        when(itemRepository.findById(lostItem.getId())).thenReturn(Optional.of(lostItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.createClaim(request, claimantDetails));

        assertTrue(ex.getMessage().contains("Only items marked as FOUND can be claimed"));
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    @DisplayName("3. Student cannot claim own FOUND item")
    void testCreateClaim_FailsForOwnItem() {
        CreateClaimRequest request = new CreateClaimRequest(foundItem.getId(), "Trying to claim my own reported item");

        when(userRepository.findById(reporterDetails.getId())).thenReturn(Optional.of(reporterUser));
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.createClaim(request, reporterDetails));

        assertTrue(ex.getMessage().contains("You cannot claim your own found item"));
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    @DisplayName("4. Duplicate active claim is rejected")
    void testCreateClaim_FailsForDuplicateActiveClaim() {
        CreateClaimRequest request = new CreateClaimRequest(foundItem.getId(), "Second claim for same item");

        when(userRepository.findById(claimantDetails.getId())).thenReturn(Optional.of(claimantUser));
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));
        when(claimRepository.existsByItemIdAndUserIdAndStatusIn(eq(foundItem.getId()), eq(claimantUser.getId()), any()))
                .thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.createClaim(request, claimantDetails));

        assertTrue(ex.getMessage().contains("You already have an active claim for this item"));
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    @DisplayName("5. Claimant can view own claim")
    void testGetClaimById_ClaimantCanView() {
        Claim claim = new Claim("My backpack proof", ClaimStatus.PENDING, foundItem, claimantUser);
        claim.setId(501L);

        when(claimRepository.findById(501L)).thenReturn(Optional.of(claim));

        ClaimResponse response = claimService.getClaimById(501L, claimantDetails);

        assertNotNull(response);
        assertEquals(501L, response.getId());
    }

    @Test
    @DisplayName("6. Item reporter can view received claims")
    void testGetClaimsReceived_ReporterCanView() {
        Claim claim = new Claim("Proof message", ClaimStatus.PENDING, foundItem, claimantUser);
        claim.setId(502L);

        when(claimRepository.findByItemUserIdOrderByCreatedAtDesc(reporterDetails.getId()))
                .thenReturn(List.of(claim));

        List<ClaimResponse> responseList = claimService.getClaimsReceived(reporterDetails);

        assertNotNull(responseList);
        assertEquals(1, responseList.size());
        assertEquals(502L, responseList.get(0).getId());
    }

    @Test
    @DisplayName("7. Unrelated student cannot view claim")
    void testGetClaimById_UnrelatedUserForbidden() {
        Claim claim = new Claim("Proof message", ClaimStatus.PENDING, foundItem, claimantUser);
        claim.setId(503L);

        when(claimRepository.findById(503L)).thenReturn(Optional.of(claim));

        UnauthorizedOperationException ex = assertThrows(UnauthorizedOperationException.class, () ->
                claimService.getClaimById(503L, unrelatedDetails));

        assertTrue(ex.getMessage().contains("You do not have permission to view this claim"));
    }

    @Test
    @DisplayName("8 & 10. Item reporter can approve claim and item changes to CLAIMED")
    void testApproveClaim_SuccessAndTransitions() {
        Claim claim = new Claim("Proof message", ClaimStatus.PENDING, foundItem, claimantUser);
        claim.setId(504L);

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        when(claimRepository.findById(504L)).thenReturn(Optional.of(claim));
        when(claimRepository.findByItemIdAndStatus(foundItem.getId(), ClaimStatus.PENDING))
                .thenReturn(List.of(claim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));

        ClaimResponse response = claimService.updateClaimStatus(504L, request, reporterDetails);

        assertNotNull(response);
        assertEquals(ClaimStatus.APPROVED, response.getStatus());
        assertEquals(ItemStatus.CLAIMED, foundItem.getStatus());
        verify(itemRepository, times(1)).save(foundItem);
    }

    @Test
    @DisplayName("9. Unrelated student cannot approve claim")
    void testApproveClaim_UnrelatedForbidden() {
        Claim claim = new Claim("Proof message", ClaimStatus.PENDING, foundItem, claimantUser);
        claim.setId(505L);

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        when(claimRepository.findById(505L)).thenReturn(Optional.of(claim));

        UnauthorizedOperationException ex = assertThrows(UnauthorizedOperationException.class, () ->
                claimService.updateClaimStatus(505L, request, unrelatedDetails));

        assertTrue(ex.getMessage().contains("Only the item reporter or an admin can update claim status"));
        assertEquals(ItemStatus.ACTIVE, foundItem.getStatus());
    }

    @Test
    @DisplayName("11. Other pending claims are automatically rejected when one is approved")
    void testApproveClaim_AutoRejectsOtherPendingClaims() {
        Claim claim1 = new Claim("Claimant 1 proof", ClaimStatus.PENDING, foundItem, claimantUser);
        claim1.setId(506L);

        Claim claim2 = new Claim("Claimant 2 proof", ClaimStatus.PENDING, foundItem, unrelatedUser);
        claim2.setId(507L);

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        when(claimRepository.findById(506L)).thenReturn(Optional.of(claim1));
        when(claimRepository.findByItemIdAndStatus(foundItem.getId(), ClaimStatus.PENDING))
                .thenReturn(List.of(claim1, claim2));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));

        claimService.updateClaimStatus(506L, request, reporterDetails);

        assertEquals(ClaimStatus.APPROVED, claim1.getStatus());
        assertEquals(ClaimStatus.REJECTED, claim2.getStatus());
        assertEquals(ItemStatus.CLAIMED, foundItem.getStatus());
    }

    @Test
    @DisplayName("12. Rejected claim cannot be approved through invalid transition")
    void testUpdateClaimStatus_CannotApproveRejectedClaim() {
        Claim claim = new Claim("Proof message", ClaimStatus.REJECTED, foundItem, claimantUser);
        claim.setId(508L);

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        when(claimRepository.findById(508L)).thenReturn(Optional.of(claim));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.updateClaimStatus(508L, request, reporterDetails));

        assertTrue(ex.getMessage().contains("Only PENDING claims can be approved or rejected"));
    }

    @Test
    @DisplayName("13 & 14. Approved claim can be completed and item changes to RETURNED")
    void testCompleteClaim_SuccessAndItemReturned() {
        foundItem.setStatus(ItemStatus.CLAIMED);
        Claim claim = new Claim("Proof message", ClaimStatus.APPROVED, foundItem, claimantUser);
        claim.setId(509L);

        when(claimRepository.findById(509L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));

        ClaimResponse response = claimService.completeClaim(509L, reporterDetails);

        assertNotNull(response);
        assertEquals(ClaimStatus.COMPLETED, response.getStatus());
        assertEquals(ItemStatus.RETURNED, foundItem.getStatus());
        verify(itemRepository, times(1)).save(foundItem);
    }

    @Test
    @DisplayName("15. Unauthorized user cannot complete claim")
    void testCompleteClaim_UnauthorizedForbidden() {
        foundItem.setStatus(ItemStatus.CLAIMED);
        Claim claim = new Claim("Proof message", ClaimStatus.APPROVED, foundItem, claimantUser);
        claim.setId(510L);

        when(claimRepository.findById(510L)).thenReturn(Optional.of(claim));

        UnauthorizedOperationException ex = assertThrows(UnauthorizedOperationException.class, () ->
                claimService.completeClaim(510L, unrelatedDetails));

        assertTrue(ex.getMessage().contains("Only the approved claimant, item reporter, or admin can mark a claim completed"));
        assertEquals(ItemStatus.CLAIMED, foundItem.getStatus());
    }
}
