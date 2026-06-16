package com.example.gamestore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Email String customerEmail,
        @NotEmpty @Valid List<OrderItemRequest> items
) {
}

