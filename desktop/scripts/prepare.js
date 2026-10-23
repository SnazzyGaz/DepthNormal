// Copies the web app (repo root index.html) into app/ and stamps it with this build's version.
'use strict';
const fs = require('fs'), path = require('path');
const pkg = require('../package.json'), src = path.join(__dirname, '..', '..', 'index.html'), dst = path.join(__dirname, '..', 'app', 'index.html');
let html = fs.readFileSync(src, 'utf8');
const re = /const APP_VERSION = '[^']*';/;
if (!re.test(html)) throw new Error('APP_VERSION not found in index.html');
html = html.replace(re, `const APP_VERSION = '${pkg.version}';`);
fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, html);
console.log(`app/index.html ready (v${pkg.version}, ${(html.length / 1e6).toFixed(2)} MB)`);
