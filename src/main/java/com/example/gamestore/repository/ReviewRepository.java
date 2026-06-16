package com.example.gamestore.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.gamestore.dto.GameReviewStatsProjection;
import com.example.gamestore.dto.ReviewStatsProjection;
import com.example.gamestore.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);

    void deleteByGameId(Long gameId);

    Optional<Review> findByGameIdAndUserId(Long gameId, Long userId);

    @Query("""
            SELECT r.game.id AS gameId, AVG(r.rating) AS avgRating, COUNT(r) AS reviewCount
            FROM Review r
            WHERE r.game.id IN :gameIds
            GROUP BY r.game.id
            """)
    List<GameReviewStatsProjection> aggregateByGameIds(@Param("gameIds") List<Long> gameIds);

    @Query("""
            SELECT AVG(r.rating) AS avgRating, COUNT(r) AS reviewCount
            FROM Review r
            WHERE r.game.id = :gameId
            """)
    ReviewStatsProjection aggregateForGame(@Param("gameId") Long gameId);

    @Query("""
            SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
            FROM OrderItem oi
            JOIN oi.order o
            WHERE oi.game.id = :gameId
              AND o.status = 'paid'
              AND o.userId = :userId
            """)
    boolean userPurchasedGame(@Param("userId") Long userId, @Param("gameId") Long gameId);
}
