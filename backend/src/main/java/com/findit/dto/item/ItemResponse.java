package com.findit.dto.item;

import com.findit.dto.auth.UserSummaryDto;
import com.findit.dto.category.CategoryResponse;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;

import java.time.LocalDateTime;

public class ItemResponse {

    private Long id;
    private String title;
    private String description;
    private ItemType type;
    private String location;
    private String imageUrl;
    private LocalDateTime itemDate;
    private LocalDateTime dateReported;
    private ItemStatus status;
    private CategoryResponse category;
    private UserSummaryDto reportedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemResponse() {
    }

    public ItemResponse(Long id, String title, String description, ItemType type, String location,
                        String imageUrl, LocalDateTime itemDate, LocalDateTime dateReported,
                        ItemStatus status, CategoryResponse category, UserSummaryDto reportedBy,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.imageUrl = imageUrl;
        this.itemDate = itemDate;
        this.dateReported = dateReported;
        this.status = status;
        this.category = category;
        this.reportedBy = reportedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getItemDate() {
        return itemDate;
    }

    public void setItemDate(LocalDateTime itemDate) {
        this.itemDate = itemDate;
    }

    public LocalDateTime getDateReported() {
        return dateReported;
    }

    public void setDateReported(LocalDateTime dateReported) {
        this.dateReported = dateReported;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
    }

    public UserSummaryDto getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(UserSummaryDto reportedBy) {
        this.reportedBy = reportedBy;
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
}
