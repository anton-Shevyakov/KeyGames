const orderListOptions = new Map();

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('orders-list')) return;

    const user = getCurrentUser();
    if (!user) {
        location.href = '/login.html?redirect=/orders.html';
        return;
    }
    if (!isAdminUser(user)) {
        location.href = '/profile.html';
        return;
    }
    const title = document.getElementById('orders-title');
    if (title) title.textContent = 'Усі замовлення';
    loadOrders('orders-list', { showCustomer: true, showPayButton: false, showDeleteButton: true, adminView: true });
});

async function loadOrders(containerId, options = {}) {
    const c = document.getElementById(containerId);
    if (!c) return;
    orderListOptions.set(containerId, options);
    try {
        const orders = await ordersAPI.listOrders(0, 100, options.mineOnly === true);
        renderOrdersList(c, orders, options);
    } catch (e) {
        c.innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`;
    }
}

function orderStatusLabel(status) {
    if (status === 'paid') return 'Оплачено';
    if (status === 'pending_payment') return 'Очікує оплати';
    if (status === 'failed') return 'Оплата не вдалась';
    return status;
}

function orderStatusClass(status) {
    if (status === 'paid') return 'paid';
    if (status === 'pending_payment') return 'pending_payment';
    if (status === 'failed') return 'failed';
    return '';
}

async function renderOrdersList(container, orders, options = {}) {
    const showCustomer = options.showCustomer ?? false;
    const showPayButton = options.showPayButton ?? false;
    const showDeleteButton = options.showDeleteButton ?? false;
    const adminView = options.adminView ?? false;
    const containerId = container.id;

    if (!orders?.length) {
        container.innerHTML = `<div class="empty-state"><h2>Замовлень немає</h2><p>Оформіть покупку в каталозі</p><a href="/games.html" class="btn btn-primary">До каталогу</a></div>`;
        return;
    }

    const names = new Map();
    for (const id of [...new Set(orders.flatMap(o => o.items.map(i => i.gameId)))]) {
        try { names.set(id, (await gamesAPI.getGame(id)).title); } catch { names.set(id, 'Гра #' + id); }
    }

    container.innerHTML = orders.map(o => {
        const statusClass = orderStatusClass(o.status);
        const statusLabel = orderStatusLabel(o.status);
        return `
            <article class="order-card">
                <div class="order-header">
                    <div>
                        <h3 style="font-size:1.0625rem;font-weight:600">Замовлення #${o.id}</h3>
                        <p style="color:var(--text-muted);font-size:0.875rem;margin-top:4px">${formatDateTime(o.createdAt)}</p>
                    </div>
                    ${!adminView ? `<span class="order-status ${statusClass}">${escapeHtml(statusLabel)}</span>` : ''}
                </div>
                ${showCustomer ? `<p style="font-size:0.875rem;color:var(--text-muted)">${escapeHtml(o.customerName)} · ${escapeHtml(o.customerEmail)}</p>` : ''}
                ${adminView ? `<p class="order-payment-info">Статус оплати: <span class="order-status ${statusClass}" style="display:inline-flex;margin-top:8px">${escapeHtml(statusLabel)}</span></p>` : ''}
                ${o.items.map(i => `
                    <div class="order-item">
                        <strong>${escapeHtml(names.get(i.gameId))}</strong>
                        <span style="color:var(--text-muted)"> — ${parseFloat(i.unitPrice).toFixed(2)} ₴</span>
                        ${!adminView && i.keys?.length ? `<div class="game-keys">${i.keys.map(k => `<code class="game-key">${escapeHtml(k)}</code>`).join('')}</div>` : ''}
                        ${!adminView && o.status === 'pending_payment' ? '<p style="font-size:0.8125rem;color:var(--text-muted);margin-top:8px">Ключі з’являться після оплати</p>' : ''}
                    </div>`).join('')}
                <div class="order-actions">
                    ${showPayButton && o.status === 'pending_payment' ? `<a href="/payment.html?orderId=${o.id}" class="btn btn-primary btn-sm">Оплатити</a>` : ''}
                    ${showDeleteButton ? `<button type="button" class="btn btn-danger btn-sm" onclick="deleteOrderRecord(${o.id}, '${containerId}')">Видалити</button>` : ''}
                </div>
            </article>`;
    }).join('');
}

async function deleteOrderRecord(orderId, containerId) {
    if (!confirm('Видалити це замовлення з історії?')) return;
    try {
        await ordersAPI.deleteOrder(orderId);
        showToast('Замовлення видалено', 'success');
        await loadOrders(containerId, orderListOptions.get(containerId) || {});
    } catch (e) {
        showToast(e.message);
    }
}

function formatDateTime(d) { return d ? new Date(d).toLocaleString('uk-UA') : ''; }
