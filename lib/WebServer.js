const express = require('express');
const multer = require('multer')
const path = require('path');
const jsonfile = require('jsonfile');

const app = express();
const upload = multer({ dest: path.join(process.cwd(), 'sounds') });

app.use(express.static('public'));

app.post('/api/create', upload.single("file"), (req, res) => {
    res.send('Hello World!');
});

app.post('/api/edit', upload.single("file"), (req, res) => {
    res.send('Hello World!');
});

app.get('/api/triggers', (req, res) => {
    jsonfile.readFile(path.join(process.cwd(), 'triggers.json'), function (err, obj) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(obj));
    });
});

module.exports = app;

