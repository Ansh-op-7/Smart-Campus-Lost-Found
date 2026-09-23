package com.findit.controller;

import com.findit.dto.ApiResponse;
import com.findit.dto.auth.UserSummaryDto;
import com.findit.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestProtectedController {

    @GetMapping("/protected")
    public ResponseEntity<ApiResponse> getProtectedResource(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(new ApiResponse("Access granted to protected resource for user: " + userDetails.getUsername()));
    }
}
