package com.findit.service;

import com.findit.dto.ApiResponse;
import com.findit.dto.auth.UserSummaryDto;
import com.findit.dto.category.CategoryResponse;
import com.findit.dto.item.CreateItemRequest;
import com.findit.dto.item.ItemResponse;
import com.findit.dto.item.UpdateItemRequest;
import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedOperationException;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ItemRepository;
import com.findit.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public ItemService(ItemRepository itemRepository,
                       CategoryRepository categoryRepository,
                       FileStorageService fileStorageService) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ItemResponse createItem(CreateItemRequest request, CustomUserDetails userDetails) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Item item = new Item();
        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setType(request.getType());
        item.setLocation(request.getLocation().trim());
        item.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : null);
        item.setItemDate(request.getItemDate());
        item.setDateReported(LocalDateTime.now());
        item.setStatus(ItemStatus.ACTIVE);
        item.setUser(userDetails.getUser());
        item.setCategory(category);

        Item saved = itemRepository.save(item);
        return mapToResponse(saved);
    }

    @Transactional
    public ItemResponse createItemWithImage(CreateItemRequest request, MultipartFile image, CustomUserDetails userDetails) {
        if (image != null && !image.isEmpty()) {
            String uploadedImageUrl = fileStorageService.storeImage(image);
            request.setImageUrl(uploadedImageUrl);
        }
        return createItem(request, userDetails);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems(ItemType type, Long categoryId, String location, ItemStatus status, String search) {
        String cleanLocation = (location != null && !location.isBlank()) ? location.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        List<Item> items = itemRepository.searchItems(type, categoryId, cleanLocation, status, cleanSearch);
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return mapToResponse(item);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getMyItems(CustomUserDetails userDetails) {
        List<Item> items = itemRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ItemResponse updateItem(Long id, UpdateItemRequest request, CustomUserDetails userDetails) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        boolean isOwner = item.getUser().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedOperationException("You are not allowed to modify this item");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            item.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            item.setDescription(request.getDescription().trim());
        }
        if (request.getType() != null) {
            item.setType(request.getType());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            item.setLocation(request.getLocation().trim());
        }
        if (request.getImageUrl() != null) {
            String newImageUrl = request.getImageUrl().isBlank() ? null : request.getImageUrl().trim();
            // Delete old app-stored image if replaced
            if (item.getImageUrl() != null && !item.getImageUrl().equals(newImageUrl)) {
                fileStorageService.deleteImage(item.getImageUrl());
            }
            item.setImageUrl(newImageUrl);
        }
        if (request.getItemDate() != null) {
            item.setItemDate(request.getItemDate());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            item.setCategory(category);
        }

        Item updated = itemRepository.save(item);
        return mapToResponse(updated);
    }

    @Transactional
    public ApiResponse deleteItem(Long id, CustomUserDetails userDetails) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        boolean isOwner = item.getUser().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedOperationException("You are not allowed to delete this item");
        }

        if (item.getImageUrl() != null) {
            fileStorageService.deleteImage(item.getImageUrl());
        }

        itemRepository.delete(item);
        return new ApiResponse("Item deleted successfully");
    }

    public ItemResponse mapToResponse(Item item) {
        User user = item.getUser();
        Category category = item.getCategory();

        UserSummaryDto userSummary = new UserSummaryDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        CategoryResponse categoryResponse = new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription()
        );

        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getType(),
                item.getLocation(),
                item.getImageUrl(),
                item.getItemDate(),
                item.getDateReported(),
                item.getStatus(),
                categoryResponse,
                userSummary,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
