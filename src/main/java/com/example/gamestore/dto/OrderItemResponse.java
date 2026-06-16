package com.example.gamestore.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderItemResponse(
        Long id, Long gameId, Integer quantity, BigDecimal unitPrice, List<String> keys
) {
}
