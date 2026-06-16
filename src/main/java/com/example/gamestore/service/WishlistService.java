package com.example.gamestore.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gamestore.dto.WishlistItemResponse;
import com.example.gamestore.model.Game;
import com.example.gamestore.model.User;
import com.example.gamestore.model.WishlistItem;
import com.example.gamestore.repository.GameRepository;
import com.example.gamestore.repository.UserRepository;
import com.example.gamestore.repository.WishlistRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, GameRepository gameRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> list(String username) {
        User user = findUser(username);
        return wishlistRepository.findByUserIdOrderByGameTitleAsc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public boolean exists(String username, Long gameId) {
        return wishlistRepository.existsByUserIdAndGameId(findUser(username).getId(), gameId);
    }

    @Transactional
    public WishlistItemResponse add(String username, Long gameId) {
        User user = findUser(username);
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new EntityNotFoundException("Game not found"));
        return wishlistRepository.findByUserIdAndGameId(user.getId(), gameId)
                .map(this::toResponse)
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setUser(user);
                    item.setGame(game);
                    return toResponse(wishlistRepository.save(item));
                });
    }

    @Transactional
    public void remove(String username, Long gameId) {
        wishlistRepository.findByUserIdAndGameId(findUser(username).getId(), gameId)
                .ifPresent(wishlistRepository::delete);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        Game g = item.getGame();
        return new WishlistItemResponse(item.getId(), g.getId(), g.getTitle(), g.getGenre(), g.getLauncher(), g.getPrice(), g.getStock(), g.getImageUrl());
    }
}
