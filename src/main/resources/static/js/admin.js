let adminGames = [];

document.addEventListener('DOMContentLoaded', async() => {
    const user = getCurrentUser();
    if (!user || !isAdminUser(user)) { window.location.href = '/'; return; }
    await loadGenres();
    const gs = document.getElementById('game-genre');
    if (gs) gs.innerHTML = renderGenreOptions('', false);

    // Setup tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Load games
    await loadAdminGames();

    // Setup add game form
    const form = document.getElementById('add-game-form');
    if (form) {
        form.addEventListener('submit', handleAddGame);
    }
});

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

async function loadAdminGames() {
    try {
        adminGames = await gamesAPI.listGames(0, 100);
        displayAdminGames(adminGames);
    } catch (error) {
        console.error('Error loading games:', error);
        const grid = document.getElementById('admin-games-grid');
        if (grid) {
            grid.innerHTML = '<div class="error-message">Помилка завантаження ігор</div>';
        }
    }
}

function displayAdminGames(games) {
    const container = document.getElementById('admin-games-grid');
    if (!container) return;

    if (!games || games.length === 0) {
        container.innerHTML = '<div class="loading">Ігор не знайдено</div>';
        return;
    }

    container.innerHTML = games.map(game => `
        <article class="game-card">
            <div class="game-card-image">
                ${game.genre ? `<span class="game-card-badge">${escapeHtml(game.genre)}</span>` : ''}
                ${renderGameImage(game)}
            </div>
            <div class="game-card-content">
                <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                <div class="game-card-meta">
                    ${gameLauncher(game) ? `<span class="tag">${escapeHtml(gameLauncher(game))}</span>` : ''}
                </div>
                <div class="game-card-footer">
                    <div class="game-card-price">${formatPrice(game.price)} <span>₴</span></div>
                    <span class="${game.stock > 0 ? 'stock-ok' : 'stock-no'}">${game.stock} ключів</span>
                </div>
                <div class="game-card-actions">
                    <button type="button" class="btn btn-primary btn-sm" onclick="openEditGame(${game.id})">Редагувати</button>
                    <input type="file" id="image-upload-${game.id}" accept="image/*" style="display:none" onchange="handleUploadImage(${game.id}, this)">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('image-upload-${game.id}').click()">Фото</button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="handleDeleteGame(${game.id})">Видалити</button>
                </div>
            </div>
        </article>
    `).join('');
}

async function handleAddGame(e) {
    e.preventDefault();
    
    const form = e.target;
    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const imageInput = document.getElementById('game-image');
    const imageFile = imageInput?.files?.[0] || null;

    const price = parseFloat(document.getElementById('game-price').value);
    const stock = parseInt(document.getElementById('game-stock').value, 10);

    if (!Number.isFinite(price) || price <= 0) {
        errorDiv.textContent = 'Ціна має бути більше 0';
        errorDiv.style.display = 'block';
        return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
        errorDiv.textContent = 'Кількість має бути цілим числом від 0';
        errorDiv.style.display = 'block';
        return;
    }

    const gameData = {
        title: document.getElementById('game-title').value,
        description: document.getElementById('game-description').value,
        genre: document.getElementById('game-genre').value,
        launcher: document.getElementById('game-launcher').value,
        price,
        stock,
        releaseDate: document.getElementById('game-release-date').value || null,
        isActive: true
    };
    
    try {
        const createdGame = await gamesAPI.createGame(gameData);

        if (imageFile) {
            try {
                await gamesAPI.uploadGameImage(createdGame.id, imageFile);
            } catch (imageError) {
                errorDiv.textContent = `Гру додано, але фото не завантажилось: ${imageError.message}`;
                errorDiv.style.display = 'block';
                form.reset();
                await loadAdminGames();
                return;
            }
        }

        successDiv.textContent = 'Гру успішно додано!';
        successDiv.style.display = 'block';
        form.reset();
        await loadAdminGames();
    } catch (error) {
        errorDiv.textContent = error.message || 'Помилка додавання гри';
        errorDiv.style.display = 'block';
    }
}

async function handleUploadImage(gameId, input) {
    const file = input.files[0];
    if (!file) return;

    try {
        await gamesAPI.uploadGameImage(gameId, file);
        await loadAdminGames();
    } catch (error) {
        alert('Помилка завантаження зображення: ' + error.message);
    }

    input.value = '';
}

function openEditGame(id) {
    const g = adminGames.find(x => x.id === id);
    if (!g) return;
    const body = document.getElementById('edit-game-body');
    body.innerHTML = `<h2>Редагувати</h2><form id="edit-form">
        <div class="form-group"><label>Назва</label><input id="edit-title" class="input" value="${escapeHtml(g.title)}" required></div>
        <div class="form-group"><label>Опис</label><textarea id="edit-desc" class="input" rows="4">${escapeHtml(g.description||'')}</textarea></div>
        <div class="form-group"><label>Жанр</label><select id="edit-genre" class="input">${renderGenreOptions(g.genre,false)}</select></div>
        <div class="form-group"><label>Ціна</label><input id="edit-price" type="number" step="0.01" class="input" value="${g.price}" required></div>
        <button type="submit" class="btn btn-primary">Зберегти</button></form>`;
    document.getElementById('edit-game-modal').style.display = 'block';
    document.getElementById('edit-form').onsubmit = async e => {
        e.preventDefault();
        await gamesAPI.updateGame(id, { title: document.getElementById('edit-title').value.trim(), description: document.getElementById('edit-desc').value.trim(), genre: document.getElementById('edit-genre').value, price: Number(document.getElementById('edit-price').value) });
        document.getElementById('edit-game-modal').style.display = 'none';
        await loadAdminGames();
    };
}

async function handleDeleteGame(gameId) {
    if (!confirm('Ви впевнені, що хочете видалити цю гру?')) {
        return;
    }
    
    try {
        await gamesAPI.deleteGame(gameId);
        await loadAdminGames();
    } catch (error) {
        alert('Помилка видалення гри: ' + error.message);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}