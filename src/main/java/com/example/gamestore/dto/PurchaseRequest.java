package com.example.gamestore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseRequest(
        @NotNull @Min(1) Integer quantity,
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Email String customerEmail
) {
}





