package com.findit.service;

import com.findit.dto.match.MatchResponse;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final ItemRepository itemRepository;

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
            "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
            "have", "haven't", "having", "he", "her", "here", "hers", "herself", "him",
            "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its",
            "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
            "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "she", "should", "shouldn't", "so",
            "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
            "then", "there", "these", "they", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "wasn't", "we", "were", "weren't",
            "what", "when", "where", "which", "while", "who", "whom", "why", "with",
            "won't", "would", "wouldn't", "you", "your", "yours", "yourself", "yourselves",
            "found", "lost", "item", "please", "help", "contact"
    );

    public MatchService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForItem(Long itemId) {
        Item sourceItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        ItemType targetType = sourceItem.getType() == ItemType.LOST ? ItemType.FOUND : ItemType.LOST;

        // Fetch candidate items of opposite type
        List<Item> candidates = itemRepository.findByType(targetType);

        List<MatchResponse> matches = new ArrayList<>();

        for (Item target : candidates) {
            // Do not match item with itself (already opposite type, but safe check)
            if (target.getId().equals(sourceItem.getId())) {
                continue;
            }

            // Exclude items that are already returned/completed
            if (target.getStatus() == ItemStatus.RETURNED) {
                continue;
            }

            MatchResponse match = calculateMatch(sourceItem, target);
            if (match != null && match.getMatchScore() >= 40) {
                matches.add(match);
            }
        }

        // Sort by match score descending
        matches.sort(Comparator.comparingInt(MatchResponse::getMatchScore).reversed());

        // Limit to top 10 matches
        return matches.stream().limit(10).collect(Collectors.toList());
    }

    public MatchResponse calculateMatch(Item source, Item target) {
        List<String> reasons = new ArrayList<>();
        int score = 0;

        // 1. Category similarity (up to 30 points)
        score += calculateCategoryScore(source, target, reasons);

        // 2. Location similarity (up to 25 points)
        score += calculateLocationScore(source.getLocation(), target.getLocation(), reasons);

        // 3. Title similarity (up to 25 points)
        score += calculateTitleScore(source.getTitle(), target.getTitle(), reasons);

        // 4. Description similarity (up to 10 points)
        score += calculateDescriptionScore(source.getDescription(), target.getDescription(), reasons);

        // 5. Date proximity (up to 10 points)
        LocalDateTime date1 = source.getItemDate() != null ? source.getItemDate() : source.getDateReported();
        LocalDateTime date2 = target.getItemDate() != null ? target.getItemDate() : target.getDateReported();
        score += calculateDateScore(date1, date2, reasons);

        int totalScore = Math.min(100, Math.max(0, score));

        return MatchResponse.fromItem(target, totalScore, reasons);
    }

    public int calculateCategoryScore(Item source, Item target, List<String> reasons) {
        if (source.getCategory() != null && target.getCategory() != null) {
            if (source.getCategory().getId().equals(target.getCategory().getId())) {
                reasons.add("Same category (" + target.getCategory().getName() + ")");
                return 30;
            }
        }
        return 0;
    }

    public int calculateLocationScore(String loc1, String loc2, List<String> reasons) {
        if (loc1 == null || loc2 == null || loc1.isBlank() || loc2.isBlank()) {
            return 0;
        }

        String n1 = normalize(loc1);
        String n2 = normalize(loc2);

        if (n1.equals(n2)) {
            reasons.add("Exact location match (" + loc2.trim() + ")");
            return 25;
        }

        if (n1.contains(n2) || n2.contains(n1)) {
            reasons.add("Similar location (" + loc2.trim() + ")");
            return 18;
        }

        Set<String> words1 = tokenize(loc1);
        Set<String> words2 = tokenize(loc2);
        words1.retainAll(words2);

        if (!words1.isEmpty()) {
            reasons.add("Nearby location (" + loc2.trim() + ")");
            return 15;
        }

        return 0;
    }

    public int calculateTitleScore(String title1, String title2, List<String> reasons) {
        if (title1 == null || title2 == null || title1.isBlank() || title2.isBlank()) {
            return 0;
        }

        String n1 = normalize(title1);
        String n2 = normalize(title2);

        if (n1.equals(n2)) {
            reasons.add("Identical title");
            return 25;
        }

        Set<String> words1 = tokenize(title1);
        Set<String> words2 = tokenize(title2);

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        if (!intersection.isEmpty()) {
            double jaccard = (double) intersection.size() / (words1.size() + words2.size() - intersection.size());
            if (jaccard >= 0.5 || intersection.size() >= 2) {
                reasons.add("Similar title");
                return 22;
            } else {
                reasons.add("Similar title keywords");
                return 15;
            }
        }

        return 0;
    }

    public int calculateDescriptionScore(String desc1, String desc2, List<String> reasons) {
        if (desc1 == null || desc2 == null || desc1.isBlank() || desc2.isBlank()) {
            return 0;
        }

        Set<String> words1 = tokenize(desc1);
        Set<String> words2 = tokenize(desc2);

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        int count = intersection.size();
        if (count >= 3) {
            reasons.add("Strong description match");
            return 10;
        } else if (count == 2) {
            reasons.add("Matching description keywords");
            return 7;
        } else if (count == 1) {
            reasons.add("Common description terms");
            return 4;
        }

        return 0;
    }

    public int calculateDateScore(LocalDateTime d1, LocalDateTime d2, List<String> reasons) {
        if (d1 == null || d2 == null) {
            return 0;
        }

        long days = Math.abs(ChronoUnit.DAYS.between(d1.toLocalDate(), d2.toLocalDate()));

        if (days == 0) {
            reasons.add("Reported on the same day");
            return 10;
        } else if (days <= 2) {
            reasons.add("Reported within 2 days");
            return 8;
        } else if (days <= 4) {
            reasons.add("Reported within 4 days");
            return 5;
        } else if (days <= 7) {
            reasons.add("Reported within a week");
            return 3;
        }

        return 0;
    }

    private String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        String normalized = normalize(text);
        if (normalized.isBlank()) return Collections.emptySet();

        return Arrays.stream(normalized.split("\\s+"))
                .filter(w -> w.length() >= 2 && !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());
    }
}
