const fs = require('fs-extra');

fs.copySync('public', 'dist', { overwrite: true });

console.log('Public files copied to dist');