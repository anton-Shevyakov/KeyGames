const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/main/resources/static');
const v = 36;

const files = {
  'index.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeyGames — ігровий магазин</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=33">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main>
            <section class="epic-hero">
                <div class="epic-hero-layout">
                    <div class="epic-hero-inner">
                        <h1>Отримуйте ключі для улюблених ігор миттєво</h1>
                        <p>Купуйте цифрові ключі миттєво. Steam, Epic Games, GOG та інші лаунчери — все в одному місці.</p>
                        <div class="hero-actions">
                            <a href="/games.html" class="btn btn-large btn-primary">Переглянути каталог</a>
                            <a href="/cart.html" id="hero-cart-link" class="btn btn-large btn-ghost">Кошик</a>
                        </div>
                    </div>
                    <aside class="hero-features" aria-label="Переваги сервісу">
                        <div class="feature-pill">
                            <h3>Миттєва доставка</h3>
                            <p>Ключі з'являються одразу після оплати</p>
                        </div>
                        <div class="feature-pill">
                            <h3>Безпечна оплата</h3>
                            <p>Sandbox-оплата для тестування покупок</p>
                        </div>
                        <div class="feature-pill">
                            <h3>Профіль клієнта</h3>
                            <p>Історія та ключі, статуси та параметри</p>
                        </div>
                    </aside>
                </div>
            </section>
            <section class="page-section">
                <h2 class="section-title">Популярні ігри</h2>
                <div id="games-grid" class="games-grid home-games-grid"><div class="loading">Завантаження...</div></div>
            </section>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames. Всі права захищені.</p></footer>
    </div>
    <div id="game-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/reviews.js?v=1"></script>
    <script src="/js/main.js?v=22"></script>
</body>
</html>`,
  'login.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вхід — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section auth-section">
            <div class="auth-card">
                <h2>Вхід</h2>
                <form id="login-form">
                    <div class="form-group"><label for="username">Логін</label><input id="username" class="input" required autocomplete="username"></div>
                    <div class="form-group"><label for="password">Пароль</label><input id="password" type="password" class="input" required autocomplete="current-password"></div>
                    <button type="submit" class="btn btn-primary btn-block">Увійти</button>
                    <div id="error-message" class="error-message" style="display:none"></div>
                </form>
                <p class="auth-link">Немає акаунту? <a href="/register.html">Зареєструватися</a></p>
            </div>
        </main>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/login.js"></script>
</body>
</html>`,
  'register.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Реєстрація — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section auth-section">
            <div class="auth-card">
                <h2>Реєстрація</h2>
                <form id="register-form">
                    <div class="form-group"><label for="username">Логін</label><input id="username" class="input" required></div>
                    <div class="form-group"><label for="email">Email</label><input id="email" type="email" class="input" required></div>
                    <div class="form-group"><label for="password">Пароль</label><input id="password" type="password" class="input" required minlength="6"></div>
                    <button type="submit" class="btn btn-primary btn-block">Створити акаунт</button>
                    <div id="error-message" class="error-message" style="display:none"></div>
                    <div id="success-message" class="success-message" style="display:none"></div>
                </form>
                <p class="auth-link">Вже є акаунт? <a href="/login.html">Увійти</a></p>
            </div>
        </main>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/register.js?v=2"></script>
</body>
</html>`,
  'games.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Каталог — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <link rel="stylesheet" href="/css/style.css?v=32">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section catalog-page">
            <div class="page-split catalog-split">
                <div class="page-split-main catalog-main">
                    <div class="page-header">
                        <h1 class="section-title" style="margin-bottom:0">Каталог ігор</h1>
                        <p>Знайди гру мрії</p>
                    </div>
                    <div id="games-grid" class="games-grid"><div class="loading">Завантаження...</div></div>
                </div>
                <aside class="page-split-side filter-sidebar">
                    <div class="filter-panel">
                        <div class="filter-panel-title">Фільтри</div>
                        <div class="filter-stack">
                            <div class="filter-field">
                                <label for="search-input">Пошук</label>
                                <input id="search-input" class="input" placeholder="Назва гри...">
                            </div>
                            <div class="filter-field">
                                <label for="genre-input">Жанр</label>
                                <select id="genre-input" class="input"></select>
                            </div>
                            <div class="filter-field">
                                <label for="min-price">Ціна від</label>
                                <input id="min-price" class="input" type="number" placeholder="0" min="0" step="0.01">
                            </div>
                            <div class="filter-field">
                                <label for="max-price">Ціна до</label>
                                <input id="max-price" class="input" type="number" placeholder="Без ліміту" min="0" step="0.01">
                            </div>
                            <div class="filter-actions">
                                <button id="search-btn" class="btn btn-primary btn-block">Знайти</button>
                                <button id="reset-btn" class="btn btn-ghost btn-block">Скинути</button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <div id="game-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/reviews.js?v=1"></script>
    <script src="/js/games.js?v=25"></script>
</body>
</html>`,
  'cart.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <title>Кошик — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=32">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section cart-page">
            <h1 class="section-title">Кошик</h1>
            <div class="page-split cart-split">
                <div id="cart-items" class="page-split-main cart-main-col"></div>
                <aside id="cart-side" class="page-split-side cart-side-col">
                    <div id="cart-summary" class="cart-summary panel-card"></div>
                </aside>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <div id="game-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/reviews.js?v=1"></script>
    <script src="/js/cart-page.js?v=25"></script>
</body>
</html>`,
  'checkout.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Оформлення — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section">
            <h1 class="section-title">Оформлення замовлення</h1>
            <div class="checkout-container">
                <div class="checkout-form-container">
                    <h2>Ваші дані</h2>
                    <form id="checkout-form">
                        <div class="form-group"><label for="customer-name">ПІБ</label><input id="customer-name" class="input" placeholder="Ваше ім'я" required autocomplete="username"></div>
                        <div class="form-group"><label for="customer-email">Email</label><input id="customer-email" type="email" class="input" required></div>
                        <button type="submit" class="btn btn-primary btn-block">Перейти до оплати</button>
                        <div id="error-message" class="error-message" style="display:none"></div>
                    </form>
                </div>
                <div class="checkout-summary">
                    <h2>Ваше замовлення</h2>
                    <div id="order-summary"><div class="loading">Завантаження...</div></div>
                </div>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/checkout.js?v=24"></script>
</body>
</html>`,
  'payment.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Оплата — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section">
            <h1 class="section-title">Оплата</h1>
            <div class="checkout-container">
                <div class="checkout-form-container">
                    <h2>Дані картки</h2>
                    <form id="payment-form">
                        <div class="form-group"><label for="card-number">Номер картки</label><input id="card-number" class="input" placeholder="4242 4242 4242 4242" required></div>
                        <div class="form-row">
                            <div class="form-group"><label for="card-expiry">Термін (MM/YY)</label><input id="card-expiry" class="input" placeholder="12/30" required></div>
                            <div class="form-group"><label for="card-cvv">CVV</label><input id="card-cvv" class="input" placeholder="123" maxlength="3" inputmode="numeric" pattern="\\d{3}" required></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Сплатити</button>
                        <div id="payment-error" class="error-message" style="display:none"></div>
                    </form>
                </div>
                <div class="checkout-summary">
                    <h2>Разом</h2>
                    <div id="payment-summary"><div class="loading">Завантаження...</div></div>
                </div>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/payment.js?v=27"></script>
</body>
</html>`,
  'profile.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Профіль — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section profile-page">
            <h1 class="section-title">Профіль</h1>
            <div class="page-split profile-split">
                <aside class="page-split-side profile-side">
                    <div id="profile-box" class="profile-card"></div>
                </aside>
                <div class="page-split-main profile-orders">
                    <h2 class="profile-section-title">Історія покупок</h2>
                    <div id="profile-orders-list" class="orders-list"><div class="loading">Завантаження...</div></div>
                </div>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/orders.js?v=28"></script>
    <script src="/js/profile-page.js?v=27"></script>
</body>
</html>`,
  'orders.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Замовлення — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section page-centered">
            <h1 id="orders-title" class="section-title section-title-center">Усі замовлення</h1>
            <div id="orders-list" class="orders-list content-centered"><div class="loading">Завантаження...</div></div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/orders.js?v=27"></script>
</body>
</html>`,
  'wishlist.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Бажане — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section page-centered">
            <h1 class="section-title section-title-center">Список бажаного</h1>
            <div id="wishlist-content" class="content-centered-wide"><div class="loading">Завантаження...</div></div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/wishlist-page.js"></script>
</body>
</html>`,
  'admin.html': `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Адмін — KeyGames</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=31">
</head>
<body class="app-body">
    <aside id="sidebar" class="sidebar"></aside>
    <div class="main-wrapper">
        <main class="page-section page-centered">
            <h1 class="section-title section-title-center">Адмін панель</h1>
            <div class="content-centered-wide">
            <div class="admin-tabs">
                <button class="tab-btn active" data-tab="games">Список ігор</button>
                <button class="tab-btn" data-tab="add-game">Додати гру</button>
            </div>
            <div id="games-tab" class="tab-content active">
                <div id="admin-games-grid" class="games-grid"><div class="loading">Завантаження...</div></div>
            </div>
            <div id="add-game-tab" class="tab-content">
                <form id="add-game-form" class="admin-form">
                    <div class="form-group"><label for="game-title">Назва</label><input id="game-title" class="input" required></div>
                    <div class="form-group"><label for="game-description">Опис</label><textarea id="game-description" class="input" rows="4" required></textarea></div>
                    <div class="form-row">
                        <div class="form-group"><label for="game-genre">Жанр</label><select id="game-genre" class="input" required></select></div>
                        <div class="form-group"><label for="game-launcher">Лаунчер</label><input id="game-launcher" class="input" required placeholder="Steam, Epic, GOG..."></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="game-price">Ціна (₴)</label><input id="game-price" type="number" step="0.01" class="input" required></div>
                        <div class="form-group"><label for="game-stock">Кількість ключів</label><input id="game-stock" type="number" class="input" required></div>
                    </div>
                    <div class="form-group"><label for="game-release-date">Дата релізу</label><input id="game-release-date" type="date" class="input" required></div>
                    <div class="form-group"><label for="game-image">Обкладинка</label><input id="game-image" type="file" accept="image/*" class="input"></div>
                    <button type="submit" class="btn btn-primary">Додати гру</button>
                    <div id="form-error" class="error-message" style="display:none"></div>
                    <div id="form-success" class="success-message" style="display:none"></div>
                </form>
            </div>
            </div>
        </main>
        <footer class="app-footer"><p>&copy; 2025 KeyGames</p></footer>
    </div>
    <div id="edit-game-modal" class="modal">
        <div class="modal-content"><span class="close" onclick="document.getElementById('edit-game-modal').style.display='none'">&times;</span><div id="edit-game-body"></div></div>
    </div>
    <script src="/js/config.js?v=${v}"></script>
    <script src="/js/api.js?v=${v}"></script>
    <script src="/js/cart.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/admin.js"></script>
</body>
</html>`
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

console.log('Fixed', Object.keys(files).length, 'HTML files with UTF-8 v=' + v);
