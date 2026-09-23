package com.findit.controller;

import com.findit.dto.ApiResponse;
import com.findit.dto.item.CreateItemRequest;
import com.findit.dto.item.ItemResponse;
import com.findit.dto.item.UpdateItemRequest;
import com.findit.dto.match.MatchResponse;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.security.CustomUserDetails;
import com.findit.service.ItemService;
import com.findit.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final MatchService matchService;

    public ItemController(ItemService itemService, MatchService matchService) {
        this.itemService = itemService;
        this.matchService = matchService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(
            @Valid @RequestBody CreateItemRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ItemResponse created = itemService.createItem(request, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemResponse> createItemWithImage(
            @Valid @RequestPart("item") CreateItemRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ItemResponse created = itemService.createItemWithImage(request, image, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String search
    ) {
        List<ItemResponse> items = itemService.getAllItems(type, categoryId, location, status, search);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemResponse>> getMyItems(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ItemResponse> items = itemService.getMyItems(userDetails);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchResponse>> getMatchesForItem(@PathVariable Long id) {
        List<MatchResponse> matches = matchService.getMatchesForItem(id);
        return ResponseEntity.ok(matches);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ItemResponse updated = itemService.updateItem(id, request, userDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ApiResponse response = itemService.deleteItem(id, userDetails);
        return ResponseEntity.ok(response);
    }
}
