package com.findit.service;

import com.findit.dto.auth.UserSummaryDto;
import com.findit.dto.claim.ClaimResponse;
import com.findit.dto.claim.CreateClaimRequest;
import com.findit.dto.claim.UpdateClaimStatusRequest;
import com.findit.dto.item.ItemResponse;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedOperationException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemService itemService;
    private final NotificationService notificationService;

    public ClaimService(ClaimRepository claimRepository,
                        ItemRepository itemRepository,
                        UserRepository userRepository,
                        ItemService itemService,
                        NotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.itemService = itemService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ClaimResponse createClaim(CreateClaimRequest request, CustomUserDetails userDetails) {
        User claimant = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + request.getItemId()));

        // Rule 1: Only FOUND items can be claimed
        if (item.getType() != ItemType.FOUND) {
            throw new BadRequestException("Only items marked as FOUND can be claimed");
        }

        // Rule 2: Item must be ACTIVE
        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("Item is not available for claims. Current status: " + item.getStatus());
        }

        // Rule 3: Claimant cannot be the person who reported the item
        if (item.getUser().getId().equals(claimant.getId())) {
            throw new BadRequestException("You cannot claim your own found item");
        }

        // Rule 4: Duplicate active claim check
        boolean hasActiveClaim = claimRepository.existsByItemIdAndUserIdAndStatusIn(
                item.getId(),
                claimant.getId(),
                List.of(ClaimStatus.PENDING, ClaimStatus.APPROVED)
        );
        if (hasActiveClaim) {
            throw new BadRequestException("You already have an active claim for this item");
        }

        // Rule 5: Create and save claim with PENDING status
        Claim claim = new Claim(
                request.getMessage().trim(),
                ClaimStatus.PENDING,
                item,
                claimant
        );

        Claim saved = claimRepository.save(claim);

        // Notify item reporter about new claim
        notificationService.createNotification(
                item.getUser(),
                "New Claim Submitted",
                claimant.getName() + " submitted a claim for your item: \"" + item.getTitle() + "\".",
                com.findit.entity.NotificationType.NEW_CLAIM
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(CustomUserDetails userDetails) {
        List<Claim> claims = claimRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return claims.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsReceived(CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;
        List<Claim> claims;
        if (isAdmin) {
            claims = claimRepository.findAll();
        } else {
            claims = claimRepository.findByItemUserIdOrderByCreatedAtDesc(userDetails.getId());
        }
        return claims.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long claimId, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        boolean isClaimant = claim.getUser().getId().equals(userDetails.getId());
        boolean isReporter = claim.getItem().getUser().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;

        if (!isClaimant && !isReporter && !isAdmin) {
            throw new UnauthorizedOperationException("You do not have permission to view this claim");
        }

        return mapToResponse(claim);
    }

    @Transactional
    public ClaimResponse updateClaimStatus(Long claimId, UpdateClaimStatusRequest request, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        boolean isReporter = claim.getItem().getUser().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;

        // Authorization rule: Only item reporter or ADMIN can approve/reject
        if (!isReporter && !isAdmin) {
            throw new UnauthorizedOperationException("Only the item reporter or an admin can update claim status");
        }

        ClaimStatus targetStatus = request.getStatus();
        if (targetStatus != ClaimStatus.APPROVED && targetStatus != ClaimStatus.REJECTED) {
            throw new BadRequestException("Status can only be updated to APPROVED or REJECTED via this action");
        }

        // State transition rule: Only PENDING claims can transition to APPROVED or REJECTED
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Only PENDING claims can be approved or rejected. Current status: " + claim.getStatus());
        }

        Item item = claim.getItem();

        if (targetStatus == ClaimStatus.APPROVED) {
            // Verify item is still active
            if (item.getStatus() != ItemStatus.ACTIVE) {
                throw new BadRequestException("Item is no longer ACTIVE and cannot be claimed. Current status: " + item.getStatus());
            }

            // Transition claim: PENDING -> APPROVED
            claim.setStatus(ClaimStatus.APPROVED);

            // Transition item: ACTIVE -> CLAIMED
            item.setStatus(ItemStatus.CLAIMED);
            itemRepository.save(item);

            // Automatically reject other pending claims for this item
            List<Claim> otherClaims = claimRepository.findByItemIdAndStatus(item.getId(), ClaimStatus.PENDING);
            for (Claim other : otherClaims) {
                if (!other.getId().equals(claim.getId())) {
                    other.setStatus(ClaimStatus.REJECTED);
                    claimRepository.save(other);

                    // Notify other claimants that their claim was rejected
                    notificationService.createNotification(
                            other.getUser(),
                            "Claim Rejected",
                            "Your claim for \"" + item.getTitle() + "\" was not approved because another claim was accepted.",
                            com.findit.entity.NotificationType.CLAIM_REJECTED
                    );
                }
            }

            // Notify approved claimant
            notificationService.createNotification(
                    claim.getUser(),
                    "Claim Approved",
                    "Your claim for \"" + item.getTitle() + "\" has been approved! You can coordinate the return.",
                    com.findit.entity.NotificationType.CLAIM_APPROVED
            );
        } else {
            // Transition claim: PENDING -> REJECTED
            claim.setStatus(ClaimStatus.REJECTED);

            // Notify claimant about rejection
            notificationService.createNotification(
                    claim.getUser(),
                    "Claim Rejected",
                    "Your claim for \"" + item.getTitle() + "\" was rejected by the reporter.",
                    com.findit.entity.NotificationType.CLAIM_REJECTED
            );
        }

        Claim saved = claimRepository.save(claim);
        return mapToResponse(saved);
    }

    @Transactional
    public ClaimResponse completeClaim(Long claimId, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        boolean isClaimant = claim.getUser().getId().equals(userDetails.getId());
        boolean isReporter = claim.getItem().getUser().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;

        // Authorization rule: Only claimant, item reporter, or ADMIN can complete
        if (!isClaimant && !isReporter && !isAdmin) {
            throw new UnauthorizedOperationException("Only the approved claimant, item reporter, or admin can mark a claim completed");
        }

        // State transition rule: Claim must be APPROVED
        if (claim.getStatus() != ClaimStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED claims can be marked completed. Current status: " + claim.getStatus());
        }

        Item item = claim.getItem();
        if (item.getStatus() != ItemStatus.CLAIMED) {
            throw new BadRequestException("Item must be in CLAIMED status to complete recovery. Current status: " + item.getStatus());
        }

        // Transitions: Claim -> COMPLETED, Item -> RETURNED
        claim.setStatus(ClaimStatus.COMPLETED);
        item.setStatus(ItemStatus.RETURNED);

        itemRepository.save(item);
        Claim saved = claimRepository.save(claim);

        // Notify claimant
        notificationService.createNotification(
                claim.getUser(),
                "Item Returned Successfully",
                "The recovery for \"" + item.getTitle() + "\" has been completed and marked as returned.",
                com.findit.entity.NotificationType.ITEM_RETURNED
        );

        // Notify item reporter if distinct user
        if (!item.getUser().getId().equals(claim.getUser().getId())) {
            notificationService.createNotification(
                    item.getUser(),
                    "Item Returned Successfully",
                    "The item \"" + item.getTitle() + "\" has been marked as returned.",
                    com.findit.entity.NotificationType.ITEM_RETURNED
            );
        }

        return mapToResponse(saved);
    }

    public ClaimResponse mapToResponse(Claim claim) {
        User claimant = claim.getUser();
        UserSummaryDto claimantDto = new UserSummaryDto(
                claimant.getId(),
                claimant.getName(),
                claimant.getEmail(),
                claimant.getRole()
        );

        ItemResponse itemResponse = itemService.mapToResponse(claim.getItem());

        return new ClaimResponse(
                claim.getId(),
                claim.getMessage(),
                claim.getStatus(),
                claim.getCreatedAt(),
                claim.getUpdatedAt(),
                claimantDto,
                itemResponse
        );
    }
}
