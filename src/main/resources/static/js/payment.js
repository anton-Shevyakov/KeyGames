document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        location.href = '/login.html?redirect=' + encodeURIComponent(location.pathname + location.search);
        return;
    }
    const orderId = new URLSearchParams(location.search).get('orderId');
    if (!orderId) {
        location.href = '/profile.html';
        return;
    }

    try {
        const order = await ordersAPI.getOrder(orderId);
        if (order.status === 'paid') {
            document.getElementById('payment-form')?.remove();
            document.getElementById('payment-summary').innerHTML = `
                <p>Замовлення #${order.id}</p>
                <p><span class="order-status paid">Оплачено</span></p>
                <a href="/profile.html" class="btn btn-primary btn-block" style="margin-top:16px">До профілю</a>`;
            return;
        }
        if (order.status !== 'pending_payment') {
            document.getElementById('payment-form')?.remove();
            document.getElementById('payment-summary').innerHTML = `<div class="error-message">Це замовлення недоступне для оплати</div>`;
            return;
        }
        const total = order.items.reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0);
        document.getElementById('payment-summary').innerHTML = `
            <p>Замовлення #${order.id}</p>
            <p><span class="order-status pending_payment">Очікує оплати</span></p>
            <p style="margin-top:12px"><strong>${total.toFixed(2)} ₴</strong></p>
            <div class="sandbox-hint">Тестова картка: <code>4242 4242 4242 4242</code></div>`;
    } catch (e) {
        document.getElementById('payment-form')?.remove();
        document.getElementById('payment-summary').innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`;
    }

    setupCardNumberInput();
    setupExpiryInput();
    setupCvvInput();

    document.getElementById('payment-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await paymentsAPI.sandboxPay(orderId,
                document.getElementById('card-number').value,
                document.getElementById('card-expiry').value,
                document.getElementById('card-cvv').value);
            if (r.success) {
                clearCart();
                showPaymentSuccess();
                setTimeout(() => location.href = '/profile.html', 2200);
            } else {
                document.getElementById('payment-error').textContent = r.message;
                document.getElementById('payment-error').style.display = 'block';
            }
        } catch (err) {
            document.getElementById('payment-error').textContent = err.message;
            document.getElementById('payment-error').style.display = 'block';
        }
    });
});

function setupCardNumberInput() {
    const el = document.getElementById('card-number');
    if (!el) return;
    el.setAttribute('maxlength', '19');
    el.setAttribute('inputmode', 'numeric');
    el.addEventListener('input', () => {
        const digits = el.value.replace(/\D/g, '').slice(0, 16);
        el.value = digits.match(/.{1,4}/g)?.join(' ') || '';
    });
}

function showPaymentSuccess() {
    document.querySelector('.success-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-overlay-card">
            <div class="success-overlay-icon">✓</div>
            <h2 class="success-overlay-title">Оплата успішна!</h2>
            <p class="success-overlay-text">Ключі доступні у вашому профілі</p>
        </div>`;
    document.body.appendChild(overlay);
}

function setupExpiryInput() {
    const el = document.getElementById('card-expiry');
    if (!el) return;
    el.setAttribute('maxlength', '5');
    el.setAttribute('inputmode', 'numeric');
    el.addEventListener('input', () => {
        const digits = el.value.replace(/\D/g, '').slice(0, 4);
        el.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
}

function setupCvvInput() {
    const el = document.getElementById('card-cvv');
    if (!el) return;
    el.setAttribute('maxlength', '3');
    el.setAttribute('inputmode', 'numeric');
    el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, 3);
    });
}
