package com.findit.dto.item;

import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateItemRequest {

    @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
    private String title;

    private String description;

    private ItemType type;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    private Long categoryId;

    private LocalDateTime itemDate;

    private ItemStatus status;

    public UpdateItemRequest() {
    }

    public UpdateItemRequest(String title, String description, ItemType type, String location,
                             String imageUrl, Long categoryId, LocalDateTime itemDate, ItemStatus status) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
        this.itemDate = itemDate;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getItemDate() {
        return itemDate;
    }

    public void setItemDate(LocalDateTime itemDate) {
        this.itemDate = itemDate;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }
}
