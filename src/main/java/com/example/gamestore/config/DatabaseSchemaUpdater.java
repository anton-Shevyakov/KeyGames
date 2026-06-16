package com.example.gamestore.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureReviewsUpdatedAtColumn();
        migrateGenresToEnglish();
    }

    private void migrateGenresToEnglish() {
        Boolean tableExists = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'games'
                )
                """, Boolean.class);
        if (!Boolean.TRUE.equals(tableExists)) {
            return;
        }

        String[][] mappings = {
                {"Екшн", "Action"},
                {"Пригоди", "Adventure"},
                {"Стратегія", "Strategy"},
                {"Спорт", "Sports"},
                {"Гонки", "Racing"},
                {"Шутер", "Shooter"},
                {"Головоломки", "Puzzle"},
                {"Жахи", "Horror"},
                {"Симулятор", "Simulation"},
                {"Інді", "Indie"}
        };

        for (String[] mapping : mappings) {
            jdbcTemplate.update("UPDATE games SET genre = ? WHERE genre = ?", mapping[1], mapping[0]);
        }
    }

    private void ensureReviewsUpdatedAtColumn() {
        Boolean tableExists = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'reviews'
                )
                """, Boolean.class);
        if (!Boolean.TRUE.equals(tableExists)) {
            return;
        }

        Boolean columnExists = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reviews'
                      AND column_name = 'updated_at'
                )
                """, Boolean.class);
        if (Boolean.TRUE.equals(columnExists)) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP");
        jdbcTemplate.execute("UPDATE reviews SET updated_at = created_at WHERE updated_at IS NULL");
        jdbcTemplate.execute("ALTER TABLE reviews ALTER COLUMN updated_at SET NOT NULL");
    }
}
