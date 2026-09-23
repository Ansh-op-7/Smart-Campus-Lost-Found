package com.findit.service;

import com.findit.dto.admin.AdminDashboardResponse;
import com.findit.dto.admin.AdminUserResponse;
import com.findit.dto.admin.UpdateUserRoleRequest;
import com.findit.dto.claim.ClaimResponse;
import com.findit.dto.item.ItemResponse;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final ItemService itemService;
    private final ClaimService claimService;

    public AdminService(UserRepository userRepository,
                        ItemRepository itemRepository,
                        ClaimRepository claimRepository,
                        ItemService itemService,
                        ClaimService claimService) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.itemService = itemService;
        this.claimService = claimService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        long lostItems = itemRepository.countByType(ItemType.LOST);
        long foundItems = itemRepository.countByType(ItemType.FOUND);
        long activeItems = itemRepository.countByStatus(ItemStatus.ACTIVE);
        long claimedItems = itemRepository.countByStatus(ItemStatus.CLAIMED);
        long returnedItems = itemRepository.countByStatus(ItemStatus.RETURNED);
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.PENDING);

        return new AdminDashboardResponse(
                totalUsers,
                totalItems,
                lostItems,
                foundItems,
                activeItems,
                claimedItems,
                returnedItems,
                pendingClaims
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(String search) {
        List<User> users;
        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim();
            users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(term, term);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(AdminUserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Safeguard: Do not allow demoting the last admin
        if (user.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot demote the last administrator account. At least one admin must remain in the system.");
            }
        }

        user.setRole(request.getRole());
        User updated = userRepository.save(user);
        return AdminUserResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getItems(ItemType type, ItemStatus status, Long categoryId, String location, String search) {
        return itemService.getAllItems(type, categoryId, location, status, search);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaims(ClaimStatus status, String search) {
        List<Claim> claims;
        if (status != null) {
            claims = claimRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            claims = claimRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim().toLowerCase();
            claims = claims.stream()
                    .filter(c -> (c.getItem() != null && c.getItem().getTitle() != null && c.getItem().getTitle().toLowerCase().contains(term)) ||
                            (c.getUser() != null && c.getUser().getName() != null && c.getUser().getName().toLowerCase().contains(term)) ||
                            (c.getUser() != null && c.getUser().getEmail() != null && c.getUser().getEmail().toLowerCase().contains(term)) ||
                            (c.getMessage() != null && c.getMessage().toLowerCase().contains(term)))
                    .collect(Collectors.toList());
        }

        return claims.stream()
                .map(claimService::mapToResponse)
                .collect(Collectors.toList());
    }
}
