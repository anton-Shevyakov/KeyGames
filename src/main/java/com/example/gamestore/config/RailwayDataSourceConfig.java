package com.example.gamestore.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@Profile("prod")
public class RailwayDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(RailwayDataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String databaseUrl = firstNonBlank(
                env.getProperty("DATABASE_PRIVATE_URL"),
                env.getProperty("DATABASE_URL")
        );
        if (databaseUrl != null) {
            ParsedUrl parsed = parsePostgresUrl(databaseUrl);
            validateRailwayHost(parsed.host(), env);
            log.info("Using DATABASE_URL host={} port={} database={}", parsed.host(), parsed.port(), parsed.database());
            return buildDataSource(parsed.host(), parsed.port(), parsed.database(), parsed.username(), parsed.password());
        }

        String host = env.getProperty("PGHOST");
        if (host == null || host.isBlank()) {
            throw new IllegalStateException(
                    "PostgreSQL is not configured on Railway. "
                            + "In KeyGames → Variables set DATABASE_URL = ${{Postgres.DATABASE_URL}} "
                            + "(Reference from Postgres service). Do not use DATABASE_PUBLIC_URL.");
        }

        validateRailwayHost(host, env);

        String port = env.getProperty("PGPORT", "5432");
        String database = env.getProperty("PGDATABASE", "railway");
        log.info("Using PGHOST host={} port={} database={}", host, port, database);
        return buildDataSource(
                host,
                port,
                database,
                env.getProperty("PGUSER", "postgres"),
                env.getProperty("PGPASSWORD", "")
        );
    }

    private static void validateRailwayHost(String host, Environment env) {
        if (env.getProperty("RAILWAY_ENVIRONMENT") == null && env.getProperty("RAILWAY_PROJECT_ID") == null) {
            return;
        }
        if (host.contains(".railway.internal")) {
            return;
        }
        if (host.contains("rlwy.net") || host.contains(".railway.app") || host.startsWith("containers-")) {
            throw new IllegalStateException(
                    "PostgreSQL host '" + host + "' is a PUBLIC address. "
                            + "From KeyGames on Railway use INTERNAL Postgres variables only: "
                            + "copy DATABASE_URL from Postgres (host must contain .railway.internal), "
                            + "not DATABASE_PUBLIC_URL.");
        }
    }

    private static DataSource buildDataSource(
            String host,
            String port,
            String database,
            String username,
            String password
    ) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(withSslMode(String.format("jdbc:postgresql://%s:%s/%s", host, port, database), host));
        config.setUsername(username);
        config.setPassword(password);
        applyPoolDefaults(config);
        return new HikariDataSource(config);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static ParsedUrl parsePostgresUrl(String databaseUrl) {
        String url = databaseUrl.trim();
        if (url.startsWith("postgres://")) {
            url = "postgresql://" + url.substring("postgres://".length());
        }
        if (!url.startsWith("postgresql://")) {
            throw new IllegalStateException("Invalid DATABASE_URL: expected postgres:// or postgresql:// URL");
        }

        url = url.substring("postgresql://".length());
        int at = url.lastIndexOf('@');
        if (at < 0) {
            throw new IllegalStateException("Invalid DATABASE_URL: missing credentials or host");
        }

        String userInfo = url.substring(0, at);
        String hostPart = url.substring(at + 1);

        String username = "postgres";
        String password = "";
        int colon = userInfo.indexOf(':');
        if (colon >= 0) {
            username = decode(userInfo.substring(0, colon));
            password = decode(userInfo.substring(colon + 1));
        } else if (!userInfo.isEmpty()) {
            username = decode(userInfo);
        }

        String host;
        String port = "5432";
        String database = "railway";

        int slash = hostPart.indexOf('/');
        String hostPort = slash >= 0 ? hostPart.substring(0, slash) : hostPart;
        if (slash >= 0) {
            String dbAndQuery = hostPart.substring(slash + 1);
            int query = dbAndQuery.indexOf('?');
            database = query >= 0 ? dbAndQuery.substring(0, query) : dbAndQuery;
        }

        int colonHost = hostPort.lastIndexOf(':');
        if (colonHost >= 0) {
            host = hostPort.substring(0, colonHost);
            port = hostPort.substring(colonHost + 1);
        } else {
            host = hostPort;
        }

        if (host == null || host.isBlank()) {
            throw new IllegalStateException(
                    "Invalid DATABASE_URL: host is empty (often caused by DATABASE_PUBLIC_URL). "
                            + "Delete DATABASE_PUBLIC_URL and reference ${{Postgres.DATABASE_URL}} instead.");
        }

        return new ParsedUrl(host, port, database, username, password);
    }

    private static String withSslMode(String jdbcUrl, String host) {
        if (jdbcUrl.contains("sslmode=")) {
            return jdbcUrl;
        }
        String mode = host.contains(".railway.internal") ? "disable" : "require";
        return jdbcUrl + (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=" + mode;
    }

    private static void applyPoolDefaults(HikariConfig config) {
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(30_000);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private record ParsedUrl(String host, String port, String database, String username, String password) {
    }
}
