package com.example.gamestore.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WishlistItemResponse(
        Long id, Long gameId, String title, String genre, String launcher,
        BigDecimal price, Integer stock, String imageUrl
) {
    @JsonProperty("platform")
    public String platform() {
        return launcher;
    }
}
