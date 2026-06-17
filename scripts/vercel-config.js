const fs = require('fs');
const path = require('path');

const apiUrl = (process.env.KEYGAMES_API_URL || '').replace(/\/$/, '');
const configPath = path.join(__dirname, '../src/main/resources/static/js/config.js');
const escaped = apiUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const configContent =
    `// Згенеровано під час Vercel build. Локально — порожній рядок.\n` +
    `// Якщо порожньо, API йде через rewrites у vercel.json (same origin).\n` +
    `window.KEYGAMES_API_URL = '${escaped}';\n`;

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('config.js:', apiUrl || '(empty — uses vercel.json rewrites → Railway)');
