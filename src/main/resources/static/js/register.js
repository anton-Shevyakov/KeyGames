document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';

        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value || '';
        const btn = form.querySelector('button[type="submit"]');

        if (!username || !email || !password) {
            if (errorMessage) {
                errorMessage.textContent = 'Заповніть усі поля';
                errorMessage.style.display = 'block';
            }
            return;
        }

        if (btn) btn.disabled = true;

        try {
            const response = await authAPI.register(username, email, password);

            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify({
                username: response.username,
                email: response.email,
                role: response.role
            }));

            if (successMessage) {
                successMessage.textContent = 'Реєстрація успішна! Перенаправлення...';
                successMessage.style.display = 'block';
            }

            setTimeout(() => redirectAfterAuth('/'), 1000);
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message || 'Помилка реєстрації. Спробуйте ще раз.';
                errorMessage.style.display = 'block';
            }
            if (btn) btn.disabled = false;
        }
    });
});
