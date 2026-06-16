package com.example.gamestore.dto;

public interface GameReviewStatsProjection {
    Long getGameId();
    Double getAvgRating();
    Long getReviewCount();
}
