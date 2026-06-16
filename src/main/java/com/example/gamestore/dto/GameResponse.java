package com.example.gamestore.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GameResponse(
        Long id,
        String title,
        String description,
        String genre,
        String launcher,
        BigDecimal price,
        Integer stock,
        LocalDate releaseDate,
        Boolean isActive,
        String imageUrl,
        Double avgRating,
        Long reviewCount
) {
    @JsonProperty("platform")
    public String platform() {
        return launcher;
    }
}
