package com.findit.repository;

import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByItemId(Long itemId);

    List<Claim> findByItemIdOrderByCreatedAtDesc(Long itemId);

    List<Claim> findByUserId(Long userId);

    List<Claim> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Claim> findByItemUserIdOrderByCreatedAtDesc(Long reporterUserId);

    List<Claim> findByStatus(ClaimStatus status);

    List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);

    List<Claim> findAllByOrderByCreatedAtDesc();

    long countByStatus(ClaimStatus status);

    List<Claim> findByItemIdAndStatus(Long itemId, ClaimStatus status);

    boolean existsByItemIdAndUserId(Long itemId, Long userId);

    boolean existsByItemIdAndUserIdAndStatusIn(Long itemId, Long userId, Collection<ClaimStatus> statuses);

    long countByUserIdAndStatus(Long userId, ClaimStatus status);

    long countByItemUserIdAndStatus(Long reporterUserId, ClaimStatus status);
}
