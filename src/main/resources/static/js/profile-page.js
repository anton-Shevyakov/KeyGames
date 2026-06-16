document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user) {
        location.href = '/login.html?redirect=/profile.html';
        return;
    }

    document.getElementById('profile-box').innerHTML = `
        <p style="font-size:1.25rem;font-weight:600;margin-bottom:8px">${escapeHtml(user.username)}</p>
        <p style="color:var(--text-muted);margin-bottom:12px">${escapeHtml(user.email)}</p>
        <p><span class="tag">${isAdminUser(user) ? 'Адміністратор' : 'Користувач'}</span></p>`;

    loadOrders('profile-orders-list', {
        showCustomer: false,
        showPayButton: true,
        showDeleteButton: true,
        compact: true,
        mineOnly: true
    });
});
