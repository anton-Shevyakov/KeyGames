-- Додати колонку updated_at до таблиці reviews (якщо її немає)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE reviews
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE reviews
    ALTER COLUMN updated_at SET NOT NULL;
