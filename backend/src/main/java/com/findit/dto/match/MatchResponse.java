package com.findit.dto.match;

import com.findit.entity.Item;
import com.findit.entity.ItemType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MatchResponse {

    private Long itemId;
    private String title;
    private String description;
    private ItemType type;
    private String category;
    private String location;
    private String imageUrl;
    private LocalDateTime itemDate;
    private int matchScore;
    private List<String> matchReasons = new ArrayList<>();

    public MatchResponse() {
    }

    public MatchResponse(Long itemId, String title, String description, ItemType type,
                         String category, String location, String imageUrl,
                         LocalDateTime itemDate, int matchScore, List<String> matchReasons) {
        this.itemId = itemId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.category = category;
        this.location = location;
        this.imageUrl = imageUrl;
        this.itemDate = itemDate;
        this.matchScore = matchScore;
        this.matchReasons = matchReasons != null ? matchReasons : new ArrayList<>();
    }

    public static MatchResponse fromItem(Item item, int matchScore, List<String> matchReasons) {
        return new MatchResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getType(),
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getLocation(),
                item.getImageUrl(),
                item.getItemDate(),
                matchScore,
                matchReasons
        );
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }
}
