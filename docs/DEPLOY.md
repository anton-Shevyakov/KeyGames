# Деплой KeyGames: Railway + Vercel

Інструкція для розміщення **backend + PostgreSQL** на [Railway](https://railway.app) і **frontend** на [Vercel](https://vercel.com).

## Архітектура

| Компонент | Платформа | Що працює |
|-----------|-----------|-----------|
| Spring Boot API | Railway | REST API, авторизація, замовлення, ключі |
| PostgreSQL | Railway (плагін) | База `game_store` |
| HTML/CSS/JS | Vercel | Статичні сторінки сайту |

---

## 1. Railway — backend + БД

### 1.1. Новий проєкт

1. Зайти на [railway.app](https://railway.app), створити **New Project**.
2. **Add PostgreSQL** — Railway створить БД і змінні `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.

### 1.2. Сервіс Spring Boot

1. **New → GitHub Repo** (або **Empty Service** + підключити репозиторій).
2. Root directory: корінь проєкту (там є `Dockerfile` і `pom.xml`).
3. Railway зчитує `railway.json` і будує через **Dockerfile**.

### 1.3. Змінні окруження (Variables) — **обов’язково**

У сервісі **KeyGames** (не в Postgres!) відкрити **Variables**:

| Variable | Value |
|----------|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| **`DATABASE_URL`** | **`${{Postgres.DATABASE_URL}}`** — кнопка **Add DATABASE_URL variable** або **New Variable → Reference** |
| `CORS_ALLOWED_ORIGINS` | `https://key-games.vercel.app,https://*.vercel.app,https://*.railway.app` |
| `APP_UPLOAD_DIR` | `/tmp/uploads` |

Без `DATABASE_URL` Spring **не стартує** → healthcheck `/api/status` падає 5 хвилин.

**Важливо:** копіюй **`DATABASE_URL`** з Postgres (внутрішній, хост `*.railway.internal`).  
**Не** використовуй `DATABASE_PUBLIC_URL` — з KeyGames буде `Connect timed out`.

Альтернатива: окремі змінні з Postgres — `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (теж внутрішні, не public).

### 1.4. Публічний домен

1. Сервіс → **Settings → Networking → Generate Domain**.
2. Скопіювати URL, наприклад: `https://keygames-api-production.up.railway.app`
3. Перевірка: відкрити `https://ВАШ-URL/api/status` → `{"message":"KeyGames API is running"}`

### 1.5. Тестові акаунти (після першого запуску)

| Логін | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | ADMIN |
| `user` | `user123` | USER |

---

## 2. Vercel — frontend

### 2.1. Новий проєкт

1. [vercel.com](https://vercel.com) → **Add New → Project** → імпорт GitHub репозиторію.
2. **Root Directory**: корінь проєкту.
3. Vercel використовує `vercel.json`:
   - `outputDirectory`: `src/main/resources/static`
   - `buildCommand`: генерує `js/config.js` з URL API

### 2.2. Environment Variable (Vercel)

| Name | Value |
|------|--------|
| `KEYGAMES_API_URL` | `https://ВАШ-RAILWAY-URL` (без `/` в кінці) |

Після деплою перевірити у браузері: **View Source** → `config.js` має містити Railway URL.

### 2.3. Деплой

**Deploy** → отримати URL, наприклад `https://keygames.vercel.app`

**Якщо Vercel показує старий commit** (наприклад «Fix Vercel API proxy to Railway»), а на GitHub уже є новіші:

1. **Deployments** → **Create Deployment** → гілка `main` → **Deploy**
2. Або відкрити останній deployment з commit `Redirect Vercel to Railway` → **⋯ → Promote to Production**
3. Перевірка: `https://ваш-сайт.vercel.app/deploy-version.txt` має містити `deploy=2026-06-17-v2`
4. Після оновлення `key-games.vercel.app` автоматично перенаправляє на Railway

**Працюючий сайт зараз:** `https://keygames-production.up.railway.app`

### 2.4. CORS на Railway

У Railway оновити `CORS_ALLOWED_ORIGINS`, додати точний Vercel URL:

```
https://keygames.vercel.app,https://*.vercel.app
```

Перезапустити сервіс на Railway.

---

## 3. Локальна розробка

Без змін: `mvn spring-boot:run`, сайт на `http://localhost:8080`.

`config.js` з порожнім `KEYGAMES_API_URL` — API на тому ж origin.

---

## 4. Важливі нюанси

1. **Обкладинки ігор** (`uploads/games/`) на Railway зберігаються в `/tmp/uploads` — при **redeploy** файли можуть зникати. Для демо на захисті це нормально; для production — S3 або Railway Volume.
2. **HTTPS** — Railway і Vercel дають SSL автоматично.
3. Для **записки (розділ 3.3)** можна вказати:
   - Frontend: `https://ваш-проєкт.vercel.app`
   - API: `https://ваш-api.up.railway.app`

---

## 5. Чеклист перед захистом

- [ ] `https://...vercel.app` — відкривається каталог
- [ ] Реєстрація / логін
- [ ] Кошик → замовлення → sandbox-оплата → ключ у профілі
- [ ] `admin` / `admin123` — адмін-панель
- [ ] `https://...railway.app/api/status` — API online
