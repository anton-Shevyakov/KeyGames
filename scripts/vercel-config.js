const fs = require('fs');
const path = require('path');

// config.js already detects Railway URL at runtime — nothing to overwrite for local dev.
const configPath = path.join(__dirname, '../src/main/resources/static/js/config.js');
console.log('config.js uses runtime hostname detection (no build overwrite needed)');
