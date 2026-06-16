function checkAuth() { if (typeof renderSidebar === 'function') renderSidebar(); }

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    location.href = '/';
}

document.addEventListener('DOMContentLoaded', checkAuth);
