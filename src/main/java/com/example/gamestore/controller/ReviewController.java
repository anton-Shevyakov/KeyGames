package com.example.gamestore.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gamestore.dto.GameReviewsResponse;
import com.example.gamestore.dto.ReviewRequest;
import com.example.gamestore.dto.ReviewResponse;
import com.example.gamestore.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/games/{gameId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public GameReviewsResponse list(@PathVariable Long gameId, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return reviewService.listForGame(gameId, username);
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> upsert(
            @PathVariable Long gameId,
            Authentication auth,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.upsert(gameId, auth.getName(), request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long gameId,
            @PathVariable Long reviewId,
            Authentication auth
    ) {
        reviewService.delete(gameId, reviewId, auth.getName(), isAdmin(auth));
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
