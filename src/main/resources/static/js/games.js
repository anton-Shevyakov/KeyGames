let currentSearch = '', currentGenre = '', currentMin = '', currentMax = '';

document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    const g = document.getElementById('genre-input');
    if (g) g.innerHTML = renderGenreOptions();
    await loadGames();

    document.getElementById('search-btn')?.addEventListener('click', applyAndLoad);
    document.getElementById('reset-btn')?.addEventListener('click', async () => {
        currentSearch = currentGenre = currentMin = currentMax = '';
        ['search-input', 'genre-input', 'min-price', 'max-price'].forEach(id => {
            const e = document.getElementById(id);
            if (e) e.value = '';
        });
        await loadGames();
    });
    document.getElementById('genre-input')?.addEventListener('change', applyAndLoad);
    document.getElementById('search-input')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') applyAndLoad();
    });
});

async function applyAndLoad() {
    currentSearch = document.getElementById('search-input')?.value.trim() || '';
    currentGenre = document.getElementById('genre-input')?.value || '';
    currentMin = document.getElementById('min-price')?.value || '';
    currentMax = document.getElementById('max-price')?.value || '';
    await loadGames();
}

async function loadGames() {
    const grid = document.getElementById('games-grid');
    try {
        const games = await gamesAPI.listGames(
            0, 1000,
            currentSearch || null, currentGenre || null,
            currentMin || null, currentMax || null
        );
        displayGames(games);
    } catch (e) {
        grid.innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`;
    }
}

function gameCardHtml(g) {
    const img = g.imageUrl
        ? `<img src="${escapeHtml(resolveAssetUrl(g.imageUrl))}" class="game-card-img" alt="">`
        : `<div class="game-card-placeholder">🎮</div>`;
    const stock = g.stock > 0
        ? `<span class="stock-ok">В наявності</span>`
        : `<span class="stock-no">Немає</span>`;
    return `
        <article class="game-card">
            <div class="game-card-image" onclick="showGameDetails(${g.id})">
                ${g.genre ? `<span class="game-card-badge">${escapeHtml(g.genre)}</span>` : ''}
                ${img}
            </div>
            <div class="game-card-content">
                <h3 class="game-card-title" onclick="showGameDetails(${g.id})">${escapeHtml(g.title)}</h3>
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
                        ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addGameToCart(${g.id})">У кошик</button>`
                        : `<button class="btn btn-secondary btn-sm" disabled>Немає</button>`}
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();toggleWish(${g.id})" title="Бажане">♥</button>
                </div>
            </div>
        </article>`;
}

function displayGames(games) {
    const c = document.getElementById('games-grid');
    if (!games?.length) {
        c.innerHTML = `<div class="empty-state"><h2>Ігор не знайдено</h2><p>Спробуйте змінити фільтри</p></div>`;
        return;
    }
    c.innerHTML = games.map(gameCardHtml).join('');
}

async function addGameToCart(id) {
    if (!requireLogin('/games.html')) return;
    try {
        const added = addToCart(await gamesAPI.getGame(id));
        showToast(added ? 'Додано в кошик' : 'Вже в кошику', added ? 'success' : 'info');
        renderSidebar();
    } catch (e) {
        showToast(e.message || 'Не вдалося додати в кошик');
    }
}

async function toggleWish(id) {
    if (!requireLogin('/games.html')) return;
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

async function showGameDetails(id) {
    const modal = document.getElementById('game-modal');
    try {
        const game = await gamesAPI.getGame(id);
        document.getElementById('modal-body').innerHTML = `
            ${game.imageUrl ? `<div class="game-card-image" style="border-radius:12px;margin-bottom:16px;aspect-ratio:16/9">${renderGameImage(game)}</div>` : ''}
            <h2>${escapeHtml(game.title)}</h2>
            <div class="game-card-meta" style="margin:12px 0 16px">
                ${game.genre ? `<span class="tag">${escapeHtml(game.genre)}</span>` : ''}
                ${gameLauncher(game) ? `<span class="tag">${escapeHtml(gameLauncher(game))}</span>` : ''}
                ${renderRatingBadge(game)}
            </div>
            <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px">${escapeHtml(game.description || 'Опис відсутній')}</p>
            <p style="font-size:1.25rem;font-weight:700;margin-bottom:20px">${parseFloat(game.price).toFixed(2)} ₴</p>
            <div class="game-card-actions" style="margin-top:0">
                ${game.stock > 0 ? `<button class="btn btn-primary" onclick="addGameToCart(${id})">У кошик</button>` : ''}
                <button class="btn btn-ghost" onclick="toggleWish(${id})">♥ Бажане</button>
            </div>
            <div id="game-reviews-slot"></div>`;
        modal.style.display = 'block';
        loadReviewsIntoModal(id);
    } catch (e) {
        showToast(e.message || 'Не вдалося відкрити гру');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.close')?.addEventListener('click', () => {
        document.getElementById('game-modal').style.display = 'none';
    });
    document.getElementById('game-modal')?.addEventListener('click', e => {
        if (e.target.id === 'game-modal') e.target.style.display = 'none';
    });
});
