package com.example.gamestore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gamestore.dto.PaymentSandboxRequest;
import com.example.gamestore.dto.PaymentSandboxResponse;
import com.example.gamestore.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/sandbox")
    public ResponseEntity<PaymentSandboxResponse> sandbox(
            @Valid @RequestBody PaymentSandboxRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(paymentService.pay(request, auth.getName()));
    }
}
