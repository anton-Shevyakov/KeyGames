package com.example.gamestore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotNull Long gameId,
        @NotNull @Min(1) Integer quantity
) {
}

