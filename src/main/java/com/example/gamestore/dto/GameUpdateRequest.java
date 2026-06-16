package com.example.gamestore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GameUpdateRequest(
        @Size(max = 255) String title,
        String description,
        @Size(max = 100) String genre,
        @JsonAlias("platform") @Size(max = 100) String launcher,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @Min(0) @Max(1000000) Integer stock,
        LocalDate releaseDate,
        Boolean isActive,
        @Size(max = 500) String imageUrl
) {
}

