package com.example.gamestore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PaymentSandboxRequest(
        @NotNull Long orderId,
        @NotBlank @Size(min = 13, max = 19) String cardNumber,
        @NotBlank @Pattern(regexp = "\\d{2}/\\d{2}") String expiry,
        @NotBlank @Pattern(regexp = "\\d{3}") String cvv
) {
}
