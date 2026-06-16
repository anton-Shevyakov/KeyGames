let checkoutItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        location.href = '/login.html?redirect=' + encodeURIComponent('/checkout.html' + location.search);
        return;
    }
    try {
        const params = new URLSearchParams(location.search);
        const gameId = params.get('gameId');

        if (gameId) {
            checkoutItems = [{ game: await gamesAPI.getGame(gameId), quantity: 1 }];
        } else {
            const cart = getCart();
            if (!cart.length) {
                showError('Кошик порожній');
                return;
            }
            checkoutItems = await Promise.all(
                cart.map(async c => ({ game: await gamesAPI.getGame(c.gameId), quantity: 1 }))
            );
        }

        const n = document.getElementById('customer-name');
        const e = document.getElementById('customer-email');
        if (n) n.value = user.username || '';
        if (e) e.value = user.email || '';

        renderSummary();
        document.getElementById('checkout-form')?.addEventListener('submit', handleCheckout);
    } catch (err) {
        showError(err.message || 'Не вдалося завантажити замовлення');
    }
});

function renderSummary() {
    const el = document.getElementById('order-summary');
    if (!el) return;
    let total = 0;
    const rows = checkoutItems.map(({ game }) => {
        total += parseFloat(game.price);
        return `<div class="summary-row"><span>${escapeHtml(game.title)}</span><span>${formatPrice(game.price)} ₴</span></div>`;
    }).join('');
    el.innerHTML = rows + `<div class="summary-row summary-total"><span><strong>До сплати</strong></span><span><strong>${formatPrice(total)} ₴</strong></span></div>`;
}

async function handleCheckout(e) {
    e.preventDefault();
    document.getElementById('error-message').style.display = 'none';

    if (!checkoutItems.length) {
        showError('Кошик порожній');
        return;
    }

    for (const { game, quantity } of checkoutItems) {
        if (quantity > game.stock) {
            showError(`Недостатньо "${game.title}"`);
            return;
        }
    }

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
        const order = await ordersAPI.createOrder({
            customerName: document.getElementById('customer-name').value.trim(),
            customerEmail: document.getElementById('customer-email').value.trim(),
            items: checkoutItems.map(({ game, quantity }) => ({ gameId: game.id, quantity }))
        });
        if (!order?.id) {
            throw new Error('Сервер не повернув номер замовлення');
        }
        location.href = `/payment.html?orderId=${order.id}`;
    } catch (err) {
        showError(err.message);
        if (btn) btn.disabled = false;
    }
}

function showError(msg) {
    const el = document.getElementById('error-message');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

function formatPrice(p) { return parseFloat(p).toFixed(2); }
