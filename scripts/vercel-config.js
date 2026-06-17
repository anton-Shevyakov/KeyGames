const fs = require('fs');
const path = require('path');

const defaultApiUrl = 'https://keygames-production.up.railway.app';
const apiUrl = (process.env.KEYGAMES_API_URL || (process.env.VERCEL ? defaultApiUrl : '')).replace(/\/$/, '');
const configPath = path.join(__dirname, '../src/main/resources/static/js/config.js');
const escaped = apiUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const configContent =
    `// Згенеровано під час Vercel build. Локально — порожній рядок.\n` +
    `window.KEYGAMES_API_URL = '${escaped}';\n`;

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('config.js:', apiUrl || '(empty — localhost same origin)');
