package com.example.gamestore.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.gamestore.model.WishlistItem;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    @Query("""
            SELECT w FROM WishlistItem w
            WHERE w.user.id = :userId
            ORDER BY LOWER(w.game.title) ASC
            """)
    List<WishlistItem> findByUserIdOrderByGameTitleAsc(@Param("userId") Long userId);
    Optional<WishlistItem> findByUserIdAndGameId(Long userId, Long gameId);
    boolean existsByUserIdAndGameId(Long userId, Long gameId);
    void deleteByGameId(Long gameId);
}
