package com.example.gamestore.dto;

import java.util.List;

public record GameReviewsResponse(
        Double avgRating,
        long reviewCount,
        boolean canReview,
        ReviewResponse myReview,
        List<ReviewResponse> reviews
) {
}
