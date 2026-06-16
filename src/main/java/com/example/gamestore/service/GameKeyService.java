package com.example.gamestore.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gamestore.model.Game;
import com.example.gamestore.model.GameKey;
import com.example.gamestore.model.OrderItem;
import com.example.gamestore.repository.GameKeyRepository;

@Service
public class GameKeyService {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private final GameKeyRepository gameKeyRepository;

    public GameKeyService(GameKeyRepository gameKeyRepository) {
        this.gameKeyRepository = gameKeyRepository;
    }

    @Transactional
    public void ensureKeysForStock(Game game, int targetStock) {
        long available = gameKeyRepository.countByGameIdAndAssignedFalse(game.getId());
        for (int i = 0; i < targetStock - available; i++) {
            GameKey key = new GameKey();
            key.setGame(game);
            key.setKeyCode(generateKey());
            key.setAssigned(false);
            gameKeyRepository.save(key);
        }
    }

    @Transactional
    public List<String> assignKeys(OrderItem orderItem, int quantity) {
        Game game = orderItem.getGame();
        List<GameKey> available = gameKeyRepository.findAvailableByGameId(game.getId());
        if (available.size() < quantity) {
            ensureKeysForStock(game, quantity);
            available = gameKeyRepository.findAvailableByGameId(game.getId());
        }
        if (available.size() < quantity) {
            throw new IllegalArgumentException("Недостатньо ключів для " + game.getTitle());
        }
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            GameKey key = available.get(i);
            key.setAssigned(true);
            key.setOrderItem(orderItem);
            gameKeyRepository.save(key);
            codes.add(key.getKeyCode());
        }
        return codes;
    }

    @Transactional(readOnly = true)
    public List<String> getKeysForOrderItem(Long orderItemId) {
        return gameKeyRepository.findByOrderItemId(orderItemId).stream().map(GameKey::getKeyCode).toList();
    }

    @Transactional
    public void releaseKeys(OrderItem orderItem) {
        for (GameKey key : gameKeyRepository.findByOrderItemId(orderItem.getId())) {
            key.setAssigned(false);
            key.setOrderItem(null);
            gameKeyRepository.save(key);
        }
    }

    private String generateKey() {
        String code;
        int attempts = 0;
        do {
            code = format(random(4) + random(4) + random(4) + random(4));
            attempts++;
        } while (gameKeyRepository.existsByKeyCode(code) && attempts < 20);
        return code;
    }

    private String random(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        return sb.toString();
    }

    private String format(String raw) {
        return raw.substring(0, 4) + "-" + raw.substring(4, 8) + "-" + raw.substring(8, 12) + "-" + raw.substring(12, 16);
    }
}
