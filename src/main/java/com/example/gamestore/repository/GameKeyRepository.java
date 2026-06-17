package com.example.gamestore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.gamestore.model.GameKey;

public interface GameKeyRepository extends JpaRepository<GameKey, Long> {
    long countByGameIdAndAssignedFalse(Long gameId);
    boolean existsByKeyCode(String keyCode);

    @Query("SELECT gk FROM GameKey gk WHERE gk.game.id = :gameId AND gk.assigned = false ORDER BY gk.id")
    List<GameKey> findAvailableByGameId(@Param("gameId") Long gameId);

    List<GameKey> findByOrderItemId(Long orderItemId);

    @Modifying
    @Query("UPDATE GameKey gk SET gk.orderItem = null, gk.assigned = false WHERE gk.game.id = :gameId")
    void releaseAllForGame(@Param("gameId") Long gameId);

    @Modifying
    @Query("DELETE FROM GameKey gk WHERE gk.game.id = :gameId")
    void deleteByGameId(@Param("gameId") Long gameId);
}
