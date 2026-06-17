                                                                                                                                                        
CREATE USER "KeyGames" WITH PASSWORD '1234567890';


CREATE DATABASE game_store
    WITH 
    OWNER = "KeyGames"
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;


GRANT ALL PRIVILEGES ON DATABASE game_store TO "KeyGames";


GRANT ALL ON SCHEMA public TO "KeyGames";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "KeyGames";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "KeyGames";

-- Коментар до бази даних
COMMENT ON DATABASE game_store IS 'KeyGames - база даних для магазину ігор';

