package com.example.gamestore.dto;

import com.example.gamestore.model.Role;

public record AuthResponse(
        String token,
        String username,
        String email,
        Role role
) {
}

