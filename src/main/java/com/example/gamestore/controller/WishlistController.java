package com.example.gamestore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gamestore.dto.WishlistItemResponse;
import com.example.gamestore.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<WishlistItemResponse> list(Authentication auth) {
        return wishlistService.list(auth.getName());
    }

    @GetMapping("/game/{gameId}/exists")
    public boolean exists(Authentication auth, @PathVariable Long gameId) {
        return wishlistService.exists(auth.getName(), gameId);
    }

    @PostMapping("/game/{gameId}")
    public ResponseEntity<WishlistItemResponse> add(Authentication auth, @PathVariable Long gameId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistService.add(auth.getName(), gameId));
    }

    @DeleteMapping("/game/{gameId}")
    public ResponseEntity<Void> remove(Authentication auth, @PathVariable Long gameId) {
        wishlistService.remove(auth.getName(), gameId);
        return ResponseEntity.noContent().build();
    }
}
