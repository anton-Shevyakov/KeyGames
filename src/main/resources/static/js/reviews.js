const reviewsAPI = {
    list: (gameId) => apiRequest(`/api/games/${gameId}/reviews`),
    submit: (gameId, data) => apiRequest(`/api/games/${gameId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
    remove: (gameId, reviewId) => apiRequest(`/api/games/${gameId}/reviews/${reviewId}`, { method: 'DELETE' })
};

function renderStars(rating, interactive = false, selected = 0) {
    const value = interactive ? selected : Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        const idx = i + 1;
        if (interactive) {
            return `<button type="button" class="star-btn${filled ? ' active' : ''}" data-star="${idx}" aria-label="${idx} зірок">★</button>`;
        }
        return `<span class="star${filled ? ' filled' : ''}">★</span>`;
    }).join('');
}

function formatReviewDate(value) {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function reviewListHtml(reviews, gameId) {
    if (!reviews?.length) {
        return '<p class="reviews-empty">Відгуків ще немає. Будьте першим після покупки!</p>';
    }
    return reviews.map(r => `
        <article class="review-card">
            <div class="review-card-head">
                <div>
                    <strong>${escapeHtml(r.username)}</strong>
                    <div class="review-stars">${renderStars(r.rating)}</div>
                </div>
                <div class="review-card-meta">
                    <span>${formatReviewDate(r.createdAt)}</span>
                    ${(r.own || isAdminUser(getCurrentUser())) ? `<button type="button" class="btn btn-danger btn-sm" onclick="deleteReview(${gameId}, ${r.id})">Видалити</button>` : ''}
                </div>
            </div>
            ${r.text ? `<p class="review-text">${escapeHtml(r.text)}</p>` : '<p class="review-text muted">Без коментаря</p>'}
        </article>`).join('');
}

function reviewFormHtml(gameId, myReview) {
    const user = getCurrentUser();
    if (!user) {
        return `<p class="reviews-hint">Увійдіть, щоб залишити відгук після покупки.</p>`;
    }
    if (isAdminUser(user)) {
        return `<p class="reviews-hint">Адміністратори не залишають відгуки.</p>`;
    }
    const selected = myReview?.rating || 0;
    return `
        <form id="review-form" class="review-form" onsubmit="submitReview(event, ${gameId})">
            <label class="review-form-label">Ваша оцінка</label>
            <div class="star-input" id="star-input">${renderStars(0, true, selected)}</div>
            <input type="hidden" id="review-rating" value="${selected || ''}">
            <div class="form-group" style="margin-top:12px">
                <label for="review-text">Коментар</label>
                <textarea id="review-text" class="input" rows="3" maxlength="2000" placeholder="Що сподобалось у грі?">${myReview?.text ? escapeHtml(myReview.text) : ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">${myReview ? 'Оновити відгук' : 'Залишити відгук'}</button>
            <div id="review-form-error" class="error-message" style="display:none;margin-top:10px"></div>
        </form>`;
}

function reviewsSectionHtml(gameId, data, showForm) {
    const summary = data.reviewCount
        ? `<span class="review-summary">${renderStars(Math.round(data.avgRating || 0))} <strong>${Number(data.avgRating || 0).toFixed(1)}</strong> <span class="muted">(${data.reviewCount})</span></span>`
        : '<span class="review-summary muted">Ще немає оцінок</span>';
    return `
        <section class="game-reviews">
            <div class="game-reviews-header">
                <h3>Відгуки</h3>
                ${summary}
            </div>
            ${showForm && data.canReview ? reviewFormHtml(gameId, data.myReview) : ''}
            ${showForm && !data.canReview && getCurrentUser() && !isAdminUser(getCurrentUser())
                ? '<p class="reviews-hint">Відгук можна залишити лише після оплаченої покупки цієї гри.</p>' : ''}
            <div class="reviews-list">${reviewListHtml(data.reviews, gameId)}</div>
        </section>`;
}

async function loadReviewsIntoModal(gameId, containerId = 'game-reviews-slot', showForm = true) {
    const slot = document.getElementById(containerId);
    if (!slot) return;
    slot.innerHTML = '<div class="loading" style="padding:20px">Завантаження відгуків...</div>';
    try {
        const data = await reviewsAPI.list(gameId);
        slot.innerHTML = reviewsSectionHtml(gameId, data, showForm);
        initStarInput();
    } catch (e) {
        slot.innerHTML = `<div class="error-message">${escapeHtml(e.message)}</div>`;
    }
}

function initStarInput() {
    const wrap = document.getElementById('star-input');
    const hidden = document.getElementById('review-rating');
    if (!wrap || !hidden) return;
    wrap.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = Number(btn.dataset.star);
            hidden.value = value;
            wrap.querySelectorAll('.star-btn').forEach((b, i) => b.classList.toggle('active', i < value));
        });
    });
}

async function submitReview(e, gameId) {
    e.preventDefault();
    const err = document.getElementById('review-form-error');
    const rating = Number(document.getElementById('review-rating')?.value);
    const text = document.getElementById('review-text')?.value?.trim() || '';
    if (!rating || rating < 1 || rating > 5) {
        if (err) { err.textContent = 'Оберіть оцінку від 1 до 5'; err.style.display = 'block'; }
        return;
    }
    if (err) err.style.display = 'none';
    try {
        await reviewsAPI.submit(gameId, { rating, text: text || null });
        showToast('Відгук збережено', 'success');
        await loadReviewsIntoModal(gameId);
    } catch (error) {
        if (err) { err.textContent = error.message; err.style.display = 'block'; }
    }
}

async function deleteReview(gameId, reviewId) {
    if (!confirm('Видалити цей відгук?')) return;
    try {
        await reviewsAPI.remove(gameId, reviewId);
        showToast('Відгук видалено');
        await loadReviewsIntoModal(gameId);
    } catch (e) { showToast(e.message); }
}
