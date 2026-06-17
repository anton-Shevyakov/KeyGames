// API URL: локально — same origin, на Vercel/production — Railway.
(function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        window.KEYGAMES_API_URL = '';
    } else {
        window.KEYGAMES_API_URL = 'https://keygames-production.up.railway.app';
    }
})();
