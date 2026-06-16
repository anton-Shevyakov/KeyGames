package com.example.gamestore.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long gameId,
        String username,
        Integer rating,
        String text,
        LocalDateTime createdAt,
        boolean own
) {
}
