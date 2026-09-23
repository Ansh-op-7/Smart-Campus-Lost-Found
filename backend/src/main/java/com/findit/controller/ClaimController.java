package com.findit.controller;

import com.findit.dto.claim.ClaimResponse;
import com.findit.dto.claim.CreateClaimRequest;
import com.findit.dto.claim.UpdateClaimStatusRequest;
import com.findit.security.CustomUserDetails;
import com.findit.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(
            @Valid @RequestBody CreateClaimRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse created = claimService.createClaim(request, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ClaimResponse> claims = claimService.getMyClaims(userDetails);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/received")
    public ResponseEntity<List<ClaimResponse>> getClaimsReceived(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ClaimResponse> claims = claimService.getClaimsReceived(userDetails);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaimById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse claim = claimService.getClaimById(id, userDetails);
        return ResponseEntity.ok(claim);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ClaimResponse> updateClaimStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClaimStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse updated = claimService.updateClaimStatus(id, request, userDetails);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ClaimResponse> completeClaim(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse completed = claimService.completeClaim(id, userDetails);
        return ResponseEntity.ok(completed);
    }
}
