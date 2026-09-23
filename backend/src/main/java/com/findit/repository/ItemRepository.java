package com.findit.repository;

import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByType(ItemType type);

    long countByType(ItemType type);

    List<Item> findByStatus(ItemStatus status);

    long countByStatus(ItemStatus status);

    List<Item> findByUserId(Long userId);

    List<Item> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Item> findByCategoryId(Long categoryId);

    List<Item> findByTypeAndStatus(ItemType type, ItemStatus status);

    List<Item> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    @Query("SELECT i FROM Item i " +
           "LEFT JOIN FETCH i.category " +
           "LEFT JOIN FETCH i.user " +
           "WHERE (:type IS NULL OR i.type = :type) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND (:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:search IS NULL OR " +
           "     LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(i.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.createdAt DESC")
    List<Item> searchItems(
            @Param("type") ItemType type,
            @Param("categoryId") Long categoryId,
            @Param("location") String location,
            @Param("status") ItemStatus status,
            @Param("search") String search
    );
}
