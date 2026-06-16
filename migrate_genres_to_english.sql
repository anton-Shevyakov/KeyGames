-- Перейменування жанрів ігор на англійську
UPDATE games SET genre = 'Action' WHERE genre = 'Екшн';
UPDATE games SET genre = 'Adventure' WHERE genre = 'Пригоди';
UPDATE games SET genre = 'Strategy' WHERE genre = 'Стратегія';
UPDATE games SET genre = 'Sports' WHERE genre = 'Спорт';
UPDATE games SET genre = 'Racing' WHERE genre = 'Гонки';
UPDATE games SET genre = 'Shooter' WHERE genre = 'Шутер';
UPDATE games SET genre = 'Puzzle' WHERE genre = 'Головоломки';
UPDATE games SET genre = 'Horror' WHERE genre = 'Жахи';
UPDATE games SET genre = 'Simulation' WHERE genre = 'Симулятор';
UPDATE games SET genre = 'Indie' WHERE genre = 'Інді';
