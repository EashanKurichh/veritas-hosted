package com.eashan.shazam_api.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String fullName;
    private String email;
    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, String role, String fullName, String email) {
        this.token = token;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
