// API URL: locally and on Vercel — same origin (proxy). On Railway — same origin.
(function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.railway.app') || host.endsWith('.vercel.app')) {
        window.KEYGAMES_API_URL = '';
    } else {
        window.KEYGAMES_API_URL = 'https://keygames-production.up.railway.app';
    }
})();
