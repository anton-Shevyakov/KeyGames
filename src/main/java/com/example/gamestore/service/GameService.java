package com.example.gamestore.service;

import com.example.gamestore.dto.GameRequest;
import com.example.gamestore.dto.GameResponse;
import com.example.gamestore.dto.GameUpdateRequest;
import com.example.gamestore.model.Game;
import com.example.gamestore.model.GameGenres;
import com.example.gamestore.repository.GameRepository;
import com.example.gamestore.repository.ReviewRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final ImageStorageService imageStorageService;
    private final GameKeyService gameKeyService;
    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    public GameService(GameRepository gameRepository, ImageStorageService imageStorageService,
                       GameKeyService gameKeyService, ReviewService reviewService,
                       ReviewRepository reviewRepository) {
        this.gameRepository = gameRepository;
        this.imageStorageService = imageStorageService;
        this.gameKeyService = gameKeyService;
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public List<GameResponse> listGames(int skip, int limit, String title, String genre, BigDecimal minPrice, BigDecimal maxPrice) {
        int page = skip / Math.max(limit, 1);
        PageRequest pageable = PageRequest.of(page, limit, Sort.by(Sort.Order.asc("title").ignoreCase()));
        String titleF = blankToNull(title);
        String genreF = blankToNull(genre);
        List<Game> games = gameRepository.findAll(buildSpec(titleF, genreF, minPrice, maxPrice), pageable).getContent();
        Map<Long, ReviewService.RatingSummary> summaries = reviewService.summariesForGames(
                games.stream().map(Game::getId).toList()
        );
        return games.stream().map(g -> toResponse(g, summaries.get(g.getId()))).toList();
    }

    private Specification<Game> buildSpec(String title, String genre, BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (title != null) p.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            if (genre != null) p.add(cb.equal(cb.lower(root.get("genre")), genre.toLowerCase()));
            if (minPrice != null) p.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) p.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            return p.isEmpty() ? cb.conjunction() : cb.and(p.toArray(Predicate[]::new));
        };
    }

    private String blankToNull(String s) {
        return s != null && !s.isBlank() ? s.trim() : null;
    }

    @Transactional(readOnly = true)
    public GameResponse getGame(Long id) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Game not found"));
        return toResponse(game, reviewService.getSummary(id));
    }

    @Transactional(readOnly = true)
    public List<GameResponse> listPopularGames(int limit) {
        List<Game> games = gameRepository.findAll().stream()
                .filter(g -> Boolean.TRUE.equals(g.getIsActive()))
                .toList();
        if (games.isEmpty()) {
            return List.of();
        }
        Map<Long, ReviewService.RatingSummary> summaries = reviewService.summariesForGames(
                games.stream().map(Game::getId).toList()
        );
        return games.stream()
                .sorted((a, b) -> compareByRating(a.getId(), b.getId(), summaries))
                .limit(Math.max(limit, 1))
                .map(g -> toResponse(g, summaries.get(g.getId())))
                .toList();
    }

    private int compareByRating(Long idA, Long idB, Map<Long, ReviewService.RatingSummary> summaries) {
        ReviewService.RatingSummary sa = summaries.get(idA);
        ReviewService.RatingSummary sb = summaries.get(idB);
        long countA = sa != null ? sa.reviewCount() : 0L;
        long countB = sb != null ? sb.reviewCount() : 0L;
        double avgA = sa != null && sa.avgRating() != null && countA > 0 ? sa.avgRating() : -1.0;
        double avgB = sb != null && sb.avgRating() != null && countB > 0 ? sb.avgRating() : -1.0;
        int byRating = Double.compare(avgB, avgA);
        if (byRating != 0) {
            return byRating;
        }
        int byCount = Long.compare(countB, countA);
        if (byCount != 0) {
            return byCount;
        }
        return Long.compare(idB, idA);
    }

    @Transactional
    public GameResponse createGame(GameRequest request) {
        validateGenre(request.genre());
        Game game = new Game();
        game.setTitle(request.title());
        game.setDescription(request.description());
        game.setGenre(request.genre());
        game.setLauncher(request.launcher());
        game.setPrice(request.price());
        game.setStock(request.stock());
        game.setReleaseDate(request.releaseDate());
        game.setIsActive(request.isActive());
        Game saved = gameRepository.save(game);
        gameKeyService.ensureKeysForStock(saved, saved.getStock());
        return toResponse(saved, null);
    }

    @Transactional
    public List<GameResponse> createGames(List<GameRequest> requests) {
        return requests.stream().map(this::createGame).toList();
    }

    @Transactional
    public GameResponse updateGame(Long id, GameUpdateRequest request) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Game not found"));
        if (request.title() != null) game.setTitle(request.title());
        if (request.description() != null) game.setDescription(request.description());
        if (request.genre() != null) { validateGenre(request.genre()); game.setGenre(request.genre()); }
        if (request.launcher() != null) game.setLauncher(request.launcher());
        if (request.price() != null) game.setPrice(request.price());
        if (request.stock() != null) { game.setStock(request.stock()); gameKeyService.ensureKeysForStock(game, request.stock()); }
        if (request.releaseDate() != null) game.setReleaseDate(request.releaseDate());
        if (request.isActive() != null) game.setIsActive(request.isActive());
        if (request.imageUrl() != null) game.setImageUrl(request.imageUrl());
        return toResponse(gameRepository.save(game), reviewService.getSummary(id));
    }

    @Transactional
    public GameResponse uploadGameImage(Long id, MultipartFile file) throws IOException {
        Game game = gameRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Game not found"));
        imageStorageService.deleteImage(game.getImageUrl());
        game.setImageUrl(imageStorageService.storeGameImage(id, file));
        return toResponse(gameRepository.save(game), reviewService.getSummary(id));
    }

    @Transactional
    public void deleteGame(Long id) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Game not found"));
        imageStorageService.deleteImage(game.getImageUrl());
        reviewRepository.deleteByGameId(id);
        gameRepository.delete(game);
    }

    private void validateGenre(String genre) {
        if (genre != null && !genre.isBlank() && !GameGenres.isValid(genre)) {
            throw new IllegalArgumentException("Оберіть жанр зі списку");
        }
    }

    private GameResponse toResponse(Game game) {
        return toResponse(game, null);
    }

    private GameResponse toResponse(Game game, ReviewService.RatingSummary summary) {
        Double avgRating = summary != null ? summary.avgRating() : null;
        Long reviewCount = summary != null ? summary.reviewCount() : null;
        return new GameResponse(game.getId(), game.getTitle(), game.getDescription(), game.getGenre(),
                game.getLauncher(), game.getPrice(), game.getStock(), game.getReleaseDate(), game.getIsActive(),
                game.getImageUrl(), avgRating, reviewCount);
    }
}
