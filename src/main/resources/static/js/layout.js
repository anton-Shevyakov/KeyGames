const ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-6h6v6"/></svg>',
    games: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M8 12h.01M10 12h.01M8 14h.01M10 14h.01"/><path d="M15 13h3M16.5 11.5v3"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2l2.5 12h11l2-8H6"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5 4.5 12.8a5.5 5.5 0 0 1 7.8-7.8L12 4.7l-.3-.3a5.5 5.5 0 0 1 7.8 7.8L12 20.5z"/></svg>',
    orders: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    admin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
};

const NAV = [
    { href: '/', label: 'Головна', icon: 'home' },
    { href: '/games.html', label: 'Каталог', icon: 'games' },
    { href: '/cart.html', label: 'Кошик', icon: 'cart', badge: 'cart', auth: true },
    { href: '/wishlist.html', label: 'Бажане', icon: 'heart', auth: true },
    { href: '/orders.html', label: 'Замовлення', icon: 'orders', admin: true },
    { href: '/profile.html', label: 'Профіль', icon: 'user', auth: true },
    { href: '/admin.html', label: 'Адмін', icon: 'admin', admin: true }
];

function renderSidebar() {
    const el = document.getElementById('sidebar');
    if (!el) return;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const path = location.pathname === '/index.html' ? '/' : location.pathname;
    const cartN = typeof getCartCount === 'function' ? getCartCount() : 0;

    const links = NAV.filter(n => (!n.admin || isAdminUser(user)) && (!n.auth || user))
        .map(n => {
            const active = path === n.href;
            const badge = n.badge === 'cart' && cartN > 0 ? `<span class="sidebar-badge">${cartN}</span>` : '';
            return `<a href="${n.href}" class="sidebar-link${active ? ' active' : ''}">
                <span class="sidebar-icon">${ICONS[n.icon]}</span>
                <span>${n.label}</span>${badge}</a>`;
        }).join('');

    el.innerHTML = `
        <div class="sidebar-brand">
            <a href="/" class="sidebar-logo">Key<span>Games</span></a>
            <span class="sidebar-tagline">Digital Store</span>
        </div>
        <nav class="sidebar-nav">${links}</nav>
        <div class="sidebar-footer" id="sidebar-auth"></div>`;

    const auth = document.getElementById('sidebar-auth');
    if (!auth) return;
    if (user) {
        auth.innerHTML = `
            <div class="sidebar-user">${escapeHtml(user.username)}<small>${escapeHtml(user.email || '')}</small></div>
            <button type="button" id="sidebar-logout" class="btn btn-secondary btn-block btn-sm">Вийти</button>`;
        document.getElementById('sidebar-logout')?.addEventListener('click', logout);
    } else {
        auth.innerHTML = `
            <a href="/login.html" class="btn btn-secondary btn-block btn-sm">Увійти</a>
            <a href="/register.html" class="btn btn-primary btn-block btn-sm" style="margin-top:8px">Реєстрація</a>`;
    }
}

function showToast(message, type = '') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
}

document.addEventListener('DOMContentLoaded', renderSidebar);
