document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin('/cart.html')) return;

    document.querySelector('.close')?.addEventListener('click', () => {
        document.getElementById('game-modal').style.display = 'none';
    });
    document.getElementById('game-modal')?.addEventListener('click', e => {
        if (e.target.id === 'game-modal') e.target.style.display = 'none';
    });
    renderCartPage();
});

function renderCartPage() {
    const itemsEl = document.getElementById('cart-items');
    const summaryEl = document.getElementById('cart-summary');
    const sideEl = document.getElementById('cart-side');
    const cart = getCart();

    if (!cart.length) {
        sideEl.style.display = 'none';
        itemsEl.innerHTML = `
            <div class="empty-state">
                <h2>Кошик порожній</h2>
                <p>Додайте ігри з каталогу — вони з’являться тут</p>
                <a href="/games.html" class="btn btn-primary">Перейти до каталогу</a>
            </div>`;
        return;
    }

    sideEl.style.display = '';
    itemsEl.innerHTML = cart.map(i => `
        <div class="cart-item">
            <div class="cart-item-image cart-item-clickable" onclick="showCartGameDetails(${i.gameId})">
                ${i.imageUrl ? `<img src="${escapeHtml(resolveAssetUrl(i.imageUrl))}" alt="">` : '🎮'}
            </div>
            <div class="cart-item-clickable" onclick="showCartGameDetails(${i.gameId})">
                <strong>${escapeHtml(i.title)}</strong>
                <div style="color:var(--text-muted);font-size:0.875rem;margin-top:4px">${escapeHtml(i.genre || '')}</div>
            </div>
            <div class="cart-item-actions">
                <div class="game-card-price" style="margin:0">${formatPrice(i.price)} <span>₴</span></div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${i.gameId});renderCartPage()">Видалити</button>
            </div>
        </div>`).join('');

    summaryEl.innerHTML = `
        <h3>Підсумок</h3>
        <div class="summary-row summary-total"><span>До сплати</span><span>${formatPrice(getCartTotal())} ₴</span></div>
        <button type="button" class="btn btn-primary btn-block" style="margin-top:20px" onclick="goToCheckout()">Оформити замовлення</button>`;
}

async function showCartGameDetails(id) {
    const game = await gamesAPI.getGame(id);
    const modal = document.getElementById('game-modal');
    document.getElementById('modal-body').innerHTML = `
        ${game.imageUrl ? `<div class="game-card-image" style="border-radius:12px;margin-bottom:16px;aspect-ratio:16/9">${renderGameImage(game)}</div>` : ''}
        <h2>${escapeHtml(game.title)}</h2>
        <div class="game-card-meta" style="margin:12px 0 16px">
            ${game.genre ? `<span class="tag">${escapeHtml(game.genre)}</span>` : ''}
            ${gameLauncher(game) ? `<span class="tag">${escapeHtml(gameLauncher(game))}</span>` : ''}
            ${game.stock > 0 ? '<span class="stock-ok">В наявності</span>' : '<span class="stock-no">Немає</span>'}
        </div>
        <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px">${escapeHtml(game.description || 'Опис відсутній')}</p>
        <p style="font-size:1.25rem;font-weight:700;margin-bottom:20px">${parseFloat(game.price).toFixed(2)} ₴</p>
        <div class="game-card-actions" style="margin-top:0">
            <button class="btn btn-ghost" onclick="toggleCartWish(${id})">♥ Бажане</button>
            <button class="btn btn-danger" onclick="removeFromCart(${id});document.getElementById('game-modal').style.display='none';renderCartPage()">Видалити з кошика</button>
        </div>
        <div id="game-reviews-slot"></div>`;
    modal.style.display = 'block';
    loadReviewsIntoModal(id);
}

async function toggleCartWish(id) {
    if (!getCurrentUser()) { location.href = '/login.html?redirect=/cart.html'; return; }
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

function goToCheckout() {
    const user = getCurrentUser();
    if (!user) {
        location.href = '/login.html?redirect=' + encodeURIComponent('/checkout.html');
        return;
    }
    location.href = '/checkout.html';
}

function formatPrice(p) { return parseFloat(p).toFixed(2); }
