package com.example.gamestore.dto;

public record PaymentSandboxResponse(boolean success, String message, OrderResponse order) {
}
