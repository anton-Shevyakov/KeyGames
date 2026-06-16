-- SQL скрипт для створення бази даних та користувача KeyGames
-- Виконайте цей скрипт в pgAdmin4 або через psql

-- Крок 1: Створення користувача (якщо не існує)
-- Виконайте підключившись як postgres або superuser
CREATE USER "KeyGames" WITH PASSWORD '1234567890';

-- Крок 2: Створення бази даних
CREATE DATABASE game_store
    WITH 
    OWNER = "KeyGames"
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Крок 3: Надання прав користувачу на базу даних
GRANT ALL PRIVILEGES ON DATABASE game_store TO "KeyGames";

-- Крок 4: Підключення до нової бази та надання прав на схему
-- Після виконання попередніх команд, підключіться до бази game_store
-- і виконайте наступні команди:

-- \c game_store  (якщо через psql)
-- Або в pgAdmin4: клацніть правою на game_store → Query Tool

GRANT ALL ON SCHEMA public TO "KeyGames";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "KeyGames";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "KeyGames";

-- Коментар до бази даних
COMMENT ON DATABASE game_store IS 'KeyGames - база даних для магазину ігор';

