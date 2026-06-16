-- Створення таблиці users для KeyGames

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL
);

-- Створення індексів для швидшого пошуку
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Коментарі до таблиці та колонок
COMMENT ON TABLE users IS 'Таблиця користувачів системи KeyGames';
COMMENT ON COLUMN users.id IS 'Унікальний ідентифікатор користувача';
COMMENT ON COLUMN users.username IS 'Ім''я користувача (унікальне)';
COMMENT ON COLUMN users.password IS 'Хешований пароль користувача (BCrypt)';
COMMENT ON COLUMN users.email IS 'Email користувача (унікальний)';
COMMENT ON COLUMN users.role IS 'Роль користувача (USER або ADMIN)';





