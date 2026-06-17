package com.example.gamestore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gamestore.dto.OrderRequest;
import com.example.gamestore.dto.OrderResponse;
import com.example.gamestore.service.OrderService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@Validated
@RestController
@RequestMapping({"/api/orders", "/orders"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(
            Authentication auth,
            @RequestParam(name = "skip", defaultValue = "0") @PositiveOrZero int skip,
            @RequestParam(name = "limit", defaultValue = "100") @Positive @Max(1000) int limit,
            @RequestParam(name = "mine", defaultValue = "false") boolean mine
    ) {
        return ResponseEntity.ok(orderService.listOrders(skip, limit, auth.getName(), isAdmin(auth), mine));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(orderService.getOrder(id, username, isAdmin(auth)));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication auth
    ) {
        String username = auth != null ? auth.getName() : null;
        OrderResponse response = orderService.createOrder(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id, Authentication auth) {
        orderService.deleteOrder(id, auth.getName(), isAdmin(auth));
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
