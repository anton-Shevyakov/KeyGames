document.addEventListener('DOMContentLoaded', async () => {
    const heroCart = document.getElementById('hero-cart-link');
    if (heroCart && !getCurrentUser()) heroCart.style.display = 'none';

    document.querySelector('.close')?.addEventListener('click', () => {
        document.getElementById('game-modal').style.display = 'none';
    });
    document.getElementById('game-modal')?.addEventListener('click', e => {
        if (e.target.id === 'game-modal') e.target.style.display = 'none';
    });

    try {
        const games = await gamesAPI.listPopular(5);
        displayGames(games, 'games-grid');
    } catch (e) {
        document.getElementById('games-grid').innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`;
    }
});

function homeGameCard(g) {
    const img = g.imageUrl
        ? `<img src="${escapeHtml(resolveAssetUrl(g.imageUrl))}" class="game-card-img" alt="">`
        : `<div class="game-card-placeholder">🎮</div>`;
    const stock = g.stock > 0
        ? `<span class="stock-ok">В наявності</span>`
        : `<span class="stock-no">Немає</span>`;
    return `
        <article class="game-card">
            <div class="game-card-image" onclick="showHomeGameDetails(${g.id})">
                ${g.genre ? `<span class="game-card-badge">${escapeHtml(g.genre)}</span>` : ''}
                ${img}
            </div>
            <div class="game-card-content">
                <h3 class="game-card-title" onclick="showHomeGameDetails(${g.id})">${escapeHtml(g.title)}</h3>
                <div class="game-card-meta">
                    ${gameLauncher(g) ? `<span class="tag">${escapeHtml(gameLauncher(g))}</span>` : ''}
                    ${stock}
                    ${renderRatingBadge(g)}
                </div>
                <div class="game-card-footer">
                    <div class="game-card-price">${parseFloat(g.price).toFixed(2)} <span>₴</span></div>
                </div>
                <div class="game-card-actions">
                    ${g.stock > 0
                        ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addHomeCart(${g.id})">У кошик</button>`
                        : `<button class="btn btn-secondary btn-sm" disabled>Немає</button>`}
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();toggleHomeWish(${g.id})" title="Бажане">♥</button>
                </div>
            </div>
        </article>`;
}

function displayGames(games, id) {
    const c = document.getElementById(id);
    if (!games?.length) {
        c.innerHTML = '<div class="loading">Ігор немає</div>';
        return;
    }
    c.innerHTML = games.map(homeGameCard).join('');
}

async function addHomeCart(id) {
    if (!requireLogin('/')) return;
    try {
        const added = addToCart(await gamesAPI.getGame(id));
        showToast(added ? 'Додано в кошик' : 'Вже в кошику', added ? 'success' : 'info');
        renderSidebar();
    } catch (e) {
        showToast(e.message || 'Не вдалося додати в кошик');
    }
}

async function toggleHomeWish(id) {
    if (!requireLogin('/')) return;
    try {
        if (await wishlistAPI.isInWishlist(id)) {
            await wishlistAPI.removeFromWishlist(id);
            showToast('Прибрано з бажаного');
        } else {
            await wishlistAPI.addToWishlist(id);
            showToast('Додано в бажане', 'success');
        }
    } catch (e) { showToast(e.message); }
}

async function showHomeGameDetails(id) {
    const modal = document.getElementById('game-modal');
    try {
    const game = await gamesAPI.getGame(id);
    document.getElementById('modal-body').innerHTML = `
        ${game.imageUrl ? `<div class="game-card-image" style="border-radius:12px;margin-bottom:16px;aspect-ratio:16/9">${renderGameImage(game)}</div>` : ''}
        <h2>${escapeHtml(game.title)}</h2>
        <div class="game-card-meta" style="margin:12px 0 16px">
            ${game.genre ? `<span class="tag">${escapeHtml(game.genre)}</span>` : ''}
            ${gameLauncher(game) ? `<span class="tag">${escapeHtml(gameLauncher(game))}</span>` : ''}
            ${game.stock > 0 ? '<span class="stock-ok">В наявності</span>' : '<span class="stock-no">Немає</span>'}
            ${renderRatingBadge(game)}
        </div>
        <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px">${escapeHtml(game.description || 'Опис відсутній')}</p>
        <p style="font-size:1.25rem;font-weight:700;margin-bottom:20px">${parseFloat(game.price).toFixed(2)} ₴</p>
        <div class="game-card-actions" style="margin-top:0">
            ${game.stock > 0 ? `<button class="btn btn-primary" onclick="addHomeCart(${id})">У кошик</button>` : ''}
            <button class="btn btn-ghost" onclick="toggleHomeWish(${id})">♥ Бажане</button>
        </div>
        <div id="game-reviews-slot"></div>`;
    modal.style.display = 'block';
    loadReviewsIntoModal(id);
    } catch (e) {
        showToast(e.message || 'Не вдалося відкрити гру');
    }
}
