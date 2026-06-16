const CART_KEY = 'keygames_cart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]').map(i => ({ ...i, quantity: 1 }));
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (typeof renderSidebar === 'function') renderSidebar();
}

function getCartCount() {
    return getCart().length;
}

function addToCart(game) {
    const cart = getCart();
    const ex = cart.find(i => i.gameId === game.id);
    if (ex) {
        ex.price = game.price;
        ex.title = game.title;
        ex.imageUrl = game.imageUrl;
        ex.stock = game.stock;
        ex.genre = game.genre;
        ex.launcher = gameLauncher(game);
        saveCart(cart);
        return false;
    }
    cart.push({
        gameId: game.id,
        title: game.title,
        price: game.price,
        imageUrl: game.imageUrl,
        genre: game.genre,
        launcher: gameLauncher(game),
        stock: game.stock,
        quantity: 1
    });
    saveCart(cart);
    return true;
}

function removeFromCart(gameId) {
    saveCart(getCart().filter(i => i.gameId !== gameId));
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    if (typeof renderSidebar === 'function') renderSidebar();
}

function getCartTotal() {
    return getCart().reduce((s, i) => s + parseFloat(i.price), 0);
}
