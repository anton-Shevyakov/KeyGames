document.addEventListener('DOMContentLoaded', async () => {
    if (!getCurrentUser()) { location.href = '/login.html?redirect=/wishlist.html'; return; }
    loadWishlist();
});

async function loadWishlist() {
    const el = document.getElementById('wishlist-content');
    try {
        const items = await wishlistAPI.listWishlist();
        if (!items.length) {
            el.innerHTML = `<div class="empty-state"><h2>Бажане порожнє</h2><p>Натисніть ♥ на картці гри в каталозі</p><a href="/games.html" class="btn btn-primary">До каталогу</a></div>`;
            return;
        }
        el.innerHTML = `<div class="games-grid">${items.map(i => `
            <article class="game-card">
                <div class="game-card-image">
                    ${i.genre ? `<span class="game-card-badge">${escapeHtml(i.genre)}</span>` : ''}
                    ${i.imageUrl ? `<img src="${escapeHtml(resolveAssetUrl(i.imageUrl))}" class="game-card-img">` : '<div class="game-card-placeholder">🎮</div>'}
                </div>
                <div class="game-card-content">
                    <h3 class="game-card-title">${escapeHtml(i.title)}</h3>
                    <div class="game-card-meta">
                        ${gameLauncher(i) ? `<span class="tag">${escapeHtml(gameLauncher(i))}</span>` : ''}
                        ${i.stock > 0 ? '<span class="stock-ok">В наявності</span>' : '<span class="stock-no">Немає</span>'}
                    </div>
                    <div class="game-card-footer"><div class="game-card-price">${parseFloat(i.price).toFixed(2)} <span>₴</span></div></div>
                    <div class="game-card-actions">
                        ${i.stock > 0 ? `<button class="btn btn-primary btn-sm" onclick="addWishToCart(${i.gameId})">У кошик</button>` : '<button class="btn btn-secondary btn-sm" disabled>Немає</button>'}
                        <button class="btn btn-ghost btn-sm" onclick="removeWish(${i.gameId})">Прибрати</button>
                    </div>
                </div>
            </article>`).join('')}</div>`;
    } catch (e) { el.innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`; }
}

async function addWishToCart(id) {
    if (!requireLogin('/wishlist.html')) return;
    const added = addToCart(await gamesAPI.getGame(id));
    showToast(added ? 'Додано в кошик' : 'Вже в кошику', added ? 'success' : 'info');
    renderSidebar();
}
async function removeWish(id) { await wishlistAPI.removeFromWishlist(id); showToast('Прибрано'); loadWishlist(); }
