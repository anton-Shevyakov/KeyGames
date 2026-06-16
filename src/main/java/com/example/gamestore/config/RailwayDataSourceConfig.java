package com.example.gamestore.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@Profile("prod")
public class RailwayDataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String databaseUrl = env.getProperty("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            return buildFromPostgresUrl(databaseUrl);
        }

        String host = env.getProperty("PGHOST");
        if (host == null || host.isBlank()) {
            throw new IllegalStateException(
                    "PostgreSQL is not configured. Add DATABASE_URL or PGHOST variables on Railway.");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(String.format(
                "jdbc:postgresql://%s:%s/%s",
                host,
                env.getProperty("PGPORT", "5432"),
                env.getProperty("PGDATABASE", "railway")
        ));
        config.setUsername(env.getProperty("PGUSER", "postgres"));
        config.setPassword(env.getProperty("PGPASSWORD", ""));
        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }

    private DataSource buildFromPostgresUrl(String databaseUrl) {
        String normalized = databaseUrl.replaceFirst("^postgres(ql)?://", "postgresql://");
        URI uri = URI.create(normalized);

        String jdbcUrl = String.format(
                "jdbc:postgresql://%s:%d%s",
                uri.getHost(),
                uri.getPort(),
                uri.getPath()
        );

        String username = "";
        String password = "";
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isEmpty()) {
            int colon = userInfo.indexOf(':');
            username = colon >= 0 ? decode(userInfo.substring(0, colon)) : decode(userInfo);
            password = colon >= 0 ? decode(userInfo.substring(colon + 1)) : "";
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
