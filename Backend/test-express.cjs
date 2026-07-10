const express = require('express');
console.log(express.version || require('express/package.json').version);
const app = express();
try {
  app.get(/.*/, (req, res) => res.send('regex'));
  console.log('RegExp worked');
} catch(e) { console.log('RegExp Error:', e.message); }

try {
  app.get('*', (req, res) => res.send('star'));
  console.log('Star worked');
} catch(e) { console.log('Star Error:', e.message); }
