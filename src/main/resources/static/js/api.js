const RAILWAY_API = 'https://keygames-production.up.railway.app';

function resolveApiBase() {
    if (typeof window === 'undefined') return '';
    const configured = window.KEYGAMES_API_URL;
    if (configured && String(configured).trim()) {
        return String(configured).replace(/\/$/, '');
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
    return RAILWAY_API;
}

const API_BASE = resolveApiBase();

function resolveAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return API_BASE + url;
    return url;
}

function getAuthToken() { return localStorage.getItem('authToken'); }
function getCurrentUser() {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
}

function userRole(user) {
    if (!user?.role) return null;
    const role = user.role;
    if (typeof role === 'string') return role.toUpperCase();
    if (typeof role === 'object' && role.name) return String(role.name).toUpperCase();
    return null;
}

function isAdminUser(user) {
    return userRole(user) === 'ADMIN';
}

function redirectAfterAuth(fallback = '/') {
    const redirect = new URLSearchParams(location.search).get('redirect');
    location.href = redirect && redirect.startsWith('/') ? redirect : fallback;
}

function requireLogin(redirect = '/') {
    if (getCurrentUser()) return true;
    location.href = '/login.html?redirect=' + encodeURIComponent(redirect);
    return false;
}

function parseApiError(errorBody, status) {
    if (!errorBody || typeof errorBody !== 'object') return `HTTP ${status}`;
    if (errorBody.detail) return errorBody.detail;
    if (errorBody.errors) return Object.entries(errorBody.errors).map(([k, v]) => `${k}: ${v}`).join('; ');
    if (errorBody.message) return errorBody.message;
    return `HTTP ${status}`;
}

function normalizeApiPath(url) {
    if (!url || !url.startsWith('/')) return url;
    if (url.startsWith('/api/')) return url;
    if (url === '/games' || url.startsWith('/games/') || url.startsWith('/games?')) {
        return '/api' + url;
    }
    if (url === '/orders' || url.startsWith('/orders/') || url.startsWith('/orders?')) {
        return '/api' + url;
    }
    return url;
}

async function apiRequest(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { Accept: 'application/json', ...options.headers };
    const token = getAuthToken();
    if (token) headers['Authorization'] = token;
    if (options.body != null && method !== 'GET' && method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
    }
    const apiPath = normalizeApiPath(url);
    const response = await fetch(API_BASE + apiPath, { ...options, headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(parseApiError(error, response.status));
    }
    if (response.status === 204) return null;
    return response.json();
}

const authAPI = {
    register: (username, email, password) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
    login: (username, password) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
};

const gamesAPI = {
    listGenres: () => apiRequest('/api/games/genres'),
    listGames: (skip = 0, limit = 100, title = null, genre = null, minPrice = null, maxPrice = null) => {
        let url = `/api/games?skip=${skip}&limit=${limit}`;
        if (title) url += `&title=${encodeURIComponent(title)}`;
        if (genre) url += `&genre=${encodeURIComponent(genre)}`;
        if (minPrice != null && minPrice !== '') url += `&minPrice=${minPrice}`;
        if (maxPrice != null && maxPrice !== '') url += `&maxPrice=${maxPrice}`;
        return apiRequest(url);
    },
    listPopular: (limit = 5) => apiRequest(`/api/games/popular?limit=${limit}`),
    getGame: (id) => apiRequest(`/api/games/${id}`),
    createGame: (d) => apiRequest('/api/games', { method: 'POST', body: JSON.stringify(d) }),
    updateGame: (id, d) => apiRequest(`/api/games/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    deleteGame: (id) => apiRequest(`/api/games/${id}`, { method: 'DELETE' }),
    async uploadGameImage(id, file) {
        const headers = {};
        const token = getAuthToken();
        if (token) headers['Authorization'] = token;
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch(API_BASE + normalizeApiPath(`/api/games/${id}/image`), { method: 'POST', headers, body: fd });
        if (!r.ok) throw new Error(parseApiError(await r.json().catch(() => ({})), r.status));
        return r.json();
    }
};

const wishlistAPI = {
    listWishlist: () => apiRequest('/api/wishlist'),
    isInWishlist: (gameId) => apiRequest(`/api/wishlist/game/${gameId}/exists`),
    addToWishlist: (gameId) => apiRequest(`/api/wishlist/game/${gameId}`, { method: 'POST' }),
    removeFromWishlist: (gameId) => apiRequest(`/api/wishlist/game/${gameId}`, { method: 'DELETE' })
};

const paymentsAPI = {
    sandboxPay: (orderId, cardNumber, expiry, cvv) => apiRequest('/api/payments/sandbox', {
        method: 'POST', body: JSON.stringify({ orderId: Number(orderId), cardNumber, expiry, cvv })
    })
};

const ordersAPI = {
    listOrders: (skip = 0, limit = 100, mine = false) => {
        let url = `/api/orders?skip=${skip}&limit=${limit}`;
        if (mine) url += '&mine=true';
        return apiRequest(url);
    },
    getOrder: (id) => apiRequest(`/api/orders/${id}`),
    createOrder: (d) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(d) }),
    deleteOrder: (id) => apiRequest(`/api/orders/${id}`, { method: 'DELETE' })
};

window.GAME_GENRES = [];

async function loadGenres() {
    try { window.GAME_GENRES = await gamesAPI.listGenres(); }
    catch { window.GAME_GENRES = ['Action','Adventure','RPG','Strategy','Sports','Racing','Shooter','Puzzle','Horror','Simulation','Indie','MMORPG']; }
}

function renderGenreOptions(selected = '', all = true) {
    let h = all ? '<option value="">Всі жанри</option>' : '<option value="" disabled selected>Оберіть жанр</option>';
    return h + (window.GAME_GENRES || []).map(g => `<option value="${escapeHtml(g)}"${g === selected ? ' selected' : ''}>${escapeHtml(g)}</option>`).join('');
}

function renderGameImage(game) {
    return game.imageUrl ? `<img src="${escapeHtml(resolveAssetUrl(game.imageUrl))}" alt="${escapeHtml(game.title || '')}" class="game-card-img">` : '🎮';
}

function gameLauncher(game) {
    return game?.launcher || game?.platform || '';
}

function renderRatingBadge(game) {
    if (!game?.reviewCount) return '';
    const avg = game.avgRating != null ? Number(game.avgRating).toFixed(1) : '—';
    return `<span class="rating-badge" title="${game.reviewCount} відгуків">★ ${avg}</span>`;
}

function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
