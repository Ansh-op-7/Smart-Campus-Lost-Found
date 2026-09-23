package com.findit.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateClaimRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotBlank(message = "Proof message explaining why the item belongs to you is required")
    @Size(min = 5, max = 1000, message = "Claim message must be between 5 and 1000 characters")
    private String message;

    public CreateClaimRequest() {
    }

    public CreateClaimRequest(Long itemId, String message) {
        this.itemId = itemId;
        this.message = message;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
