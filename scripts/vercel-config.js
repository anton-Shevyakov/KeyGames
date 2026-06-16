const fs = require('fs');
const path = require('path');

const apiUrl = (process.env.KEYGAMES_API_URL || '').replace(/'/g, "\\'").replace(/\\/g, '');
const out = path.join(__dirname, '../src/main/resources/static/js/config.js');
const content = `// Railway API URL (без слеша в кінці). Локально — порожній рядок.\nwindow.KEYGAMES_API_URL = '${apiUrl}';\n`;
fs.writeFileSync(out, content, 'utf8');
console.log('config.js written, KEYGAMES_API_URL=', apiUrl || '(empty — same origin)');
