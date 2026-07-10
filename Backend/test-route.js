import express from 'express';
const app = express();
app.get(/.*/, (req, res) => res.send('regex matched'));
app.get('/(.*)', (req, res) => res.send('string matched'));

app.listen(3000, () => console.log('started'));
