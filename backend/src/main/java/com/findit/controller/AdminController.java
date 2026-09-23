package com.findit.controller;

import com.findit.dto.admin.AdminDashboardResponse;
import com.findit.dto.admin.AdminUserResponse;
import com.findit.dto.admin.UpdateUserRoleRequest;
import com.findit.dto.claim.ClaimResponse;
import com.findit.dto.item.ItemResponse;
import com.findit.entity.ClaimStatus;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        AdminDashboardResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search
    ) {
        List<AdminUserResponse> users = adminService.getUsers(search);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        AdminUserResponse response = adminService.updateUserRole(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/items")
    public ResponseEntity<List<ItemResponse>> getItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search
    ) {
        List<ItemResponse> items = adminService.getItems(type, status, categoryId, location, search);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimResponse>> getClaims(
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(required = false) String search
    ) {
        List<ClaimResponse> claims = adminService.getClaims(status, search);
        return ResponseEntity.ok(claims);
    }
}
