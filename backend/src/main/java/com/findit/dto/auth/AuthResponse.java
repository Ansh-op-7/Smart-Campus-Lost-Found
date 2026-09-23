package com.findit.dto.auth;

public class AuthResponse {

    private String token;
    private UserSummaryDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserSummaryDto user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }
}
