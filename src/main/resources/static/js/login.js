// Login page functionality

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    if (!form) return;

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        errorMessage.style.display = 'none';

        try {
            const response = await authAPI.login(username, password);

            // Store auth token and user info
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify({
                username: response.username,
                email: response.email,
                role: response.role
            }));

            redirectAfterAuth('/');
        } catch (error) {
            errorMessage.textContent = error.message || 'Помилка входу. Перевірте дані.';
            errorMessage.style.display = 'block';
        }
    });
});