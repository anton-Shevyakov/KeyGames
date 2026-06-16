package com.example.gamestore.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gamestore.dto.GameReviewsResponse;
import com.example.gamestore.dto.ReviewRequest;
import com.example.gamestore.dto.ReviewResponse;
import com.example.gamestore.model.Game;
import com.example.gamestore.model.Review;
import com.example.gamestore.model.User;
import com.example.gamestore.repository.GameRepository;
import com.example.gamestore.repository.ReviewRepository;
import com.example.gamestore.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ReviewService {

    public record RatingSummary(Double avgRating, long reviewCount) {
    }

    private final ReviewRepository reviewRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, GameRepository gameRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public GameReviewsResponse listForGame(Long gameId, String username) {
        ensureGameExists(gameId);
        RatingSummary summary = getSummary(gameId);
        User user = username != null ? findUser(username) : null;
        boolean canReview = user != null && reviewRepository.userPurchasedGame(user.getId(), gameId);
        Optional<Review> mine = user != null
                ? reviewRepository.findByGameIdAndUserId(gameId, user.getId())
                : Optional.empty();
        List<ReviewResponse> reviews = reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId).stream()
                .map(r -> toResponse(r, user))
                .toList();
        return new GameReviewsResponse(
                summary.avgRating(),
                summary.reviewCount(),
                canReview,
                mine.map(r -> toResponse(r, user)).orElse(null),
                reviews
        );
    }

    @Transactional(readOnly = true)
    public RatingSummary getSummary(Long gameId) {
        var stats = reviewRepository.aggregateForGame(gameId);
        if (stats == null || stats.getReviewCount() == null || stats.getReviewCount() == 0) {
            return new RatingSummary(null, 0L);
        }
        double avg = stats.getAvgRating() != null ? stats.getAvgRating() : 0.0;
        return new RatingSummary(round(avg), stats.getReviewCount());
    }

    @Transactional(readOnly = true)
    public Map<Long, RatingSummary> summariesForGames(List<Long> gameIds) {
        if (gameIds == null || gameIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, RatingSummary> result = new HashMap<>();
        for (var stats : reviewRepository.aggregateByGameIds(gameIds)) {
            double avg = stats.getAvgRating() != null ? stats.getAvgRating() : 0.0;
            long count = stats.getReviewCount() != null ? stats.getReviewCount() : 0L;
            result.put(stats.getGameId(), new RatingSummary(round(avg), count));
        }
        return result;
    }

    @Transactional
    public ReviewResponse upsert(Long gameId, String username, ReviewRequest request) {
        User user = findUser(username);
        Game game = ensureGameExists(gameId);
        if (!reviewRepository.userPurchasedGame(user.getId(), gameId)) {
            throw new AccessDeniedException("Відгук можна залишити лише після покупки гри");
        }
        Review review = reviewRepository.findByGameIdAndUserId(gameId, user.getId()).orElseGet(() -> {
            Review created = new Review();
            created.setUser(user);
            created.setGame(game);
            return created;
        });
        review.setRating(request.rating());
        review.setText(blankToNull(request.text()));
        return toResponse(reviewRepository.save(review), user);
    }

    @Transactional
    public void delete(Long gameId, Long reviewId, String username, boolean isAdmin) {
        ensureGameExists(gameId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        if (!review.getGame().getId().equals(gameId)) {
            throw new EntityNotFoundException("Review not found");
        }
        User user = findUser(username);
        if (!isAdmin && !review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Можна видалити лише власний відгук");
        }
        reviewRepository.delete(review);
    }

    private Game ensureGameExists(Long gameId) {
        return gameRepository.findById(gameId).orElseThrow(() -> new EntityNotFoundException("Game not found"));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private ReviewResponse toResponse(Review review, User currentUser) {
        boolean own = currentUser != null && review.getUser().getId().equals(currentUser.getId());
        return new ReviewResponse(
                review.getId(),
                review.getGame().getId(),
                review.getUser().getUsername(),
                review.getRating(),
                review.getText(),
                review.getCreatedAt(),
                own
        );
    }

    private Double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String blankToNull(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }
}
