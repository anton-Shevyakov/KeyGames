package com.example.gamestore.model;

import java.util.List;

public final class GameGenres {

    public static final List<String> ALL = List.of(
            "Action", "Adventure", "RPG", "Strategy", "Sports",
            "Racing", "Shooter", "Puzzle", "Horror", "Simulation", "Indie", "MMORPG"
    );

    private GameGenres() {
    }

    public static boolean isValid(String genre) {
        return genre != null && ALL.contains(genre);
    }
}
