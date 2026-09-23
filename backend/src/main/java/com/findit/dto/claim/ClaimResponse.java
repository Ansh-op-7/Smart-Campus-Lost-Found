package com.findit.dto.claim;

import com.findit.dto.auth.UserSummaryDto;
import com.findit.dto.item.ItemResponse;
import com.findit.entity.ClaimStatus;

import java.time.LocalDateTime;

public class ClaimResponse {

    private Long id;
    private String message;
    private ClaimStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryDto claimant;
    private ItemResponse item;

    public ClaimResponse() {
    }

    public ClaimResponse(Long id, String message, ClaimStatus status, LocalDateTime createdAt,
                         LocalDateTime updatedAt, UserSummaryDto claimant, ItemResponse item) {
        this.id = id;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.claimant = claimant;
        this.item = item;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserSummaryDto getClaimant() {
        return claimant;
    }

    public void setClaimant(UserSummaryDto claimant) {
        this.claimant = claimant;
    }

    public ItemResponse getItem() {
        return item;
    }

    public void setItem(ItemResponse item) {
        this.item = item;
    }
}
