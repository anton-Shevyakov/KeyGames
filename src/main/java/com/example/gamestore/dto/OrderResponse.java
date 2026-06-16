package com.example.gamestore.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String customerEmail,
        LocalDateTime createdAt,
        String status,
        List<OrderItemResponse> items
) {
}

