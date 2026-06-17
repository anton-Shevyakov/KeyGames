package com.example.gamestore.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.gamestore.dto.GameRequest;
import com.example.gamestore.dto.GameResponse;
import com.example.gamestore.dto.GameUpdateRequest;
import com.example.gamestore.model.GameGenres;
import com.example.gamestore.service.GameService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@Validated
@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/genres")
    public List<String> listGenres() {
        return GameGenres.ALL;
    }

    @GetMapping("/popular")
    public List<GameResponse> listPopularGames(
            @RequestParam(defaultValue = "5") @Positive @Max(20) int limit
    ) {
        return gameService.listPopularGames(limit);
    }

    @GetMapping
    public List<GameResponse> listGames(
            @RequestParam(defaultValue = "0") @PositiveOrZero int skip,
            @RequestParam(defaultValue = "100") @Positive @Max(1000) int limit,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return gameService.listGames(skip, limit, title, genre, minPrice, maxPrice);
    }

    @GetMapping("/{id}")
    public GameResponse getGame(@PathVariable Long id) {
        return gameService.getGame(id);
    }

    @PostMapping(value = {"", "/"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameResponse> createGame(@Valid @RequestBody GameRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.createGame(request));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GameResponse>> createGames(@Valid @RequestBody List<GameRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.createGames(requests));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public GameResponse updateGame(@PathVariable Long id, @Valid @RequestBody GameUpdateRequest request) {
        return gameService.updateGame(id, request);
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public GameResponse uploadGameImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws java.io.IOException {
        return gameService.uploadGameImage(id, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
