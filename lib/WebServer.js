const express = require('express');
const multer = require('multer');
const path = require('path');
const jsonfile = require('jsonfile');
const uuid = require('uuid/v4');
const Trigger = require('./Trigger');
const fs = require('fs');
const { Magic, ...mmm } = require('mmmagic');
const sanitize = require('sanitize-filename');

const magic = new Magic(mmm.MAGIC_MIME_TYPE);

const app = express();
const upload = multer({ storage: new multer.diskStorage({}) }); /* eslint new-cap: ['off'] */
const jsonPath = path.join(process.cwd(), 'triggers.json');

app.use(express.static('public'));

class ClientError extends Error {}

const reId = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
function invalidData(data, checkFile) {
  if(data.volume > 100 || data.volume < 0) return new ClientError('Invalid volume');
  if(data.fade < 0) return new ClientError('Invalid fade');
  if(data.length < 0) return new ClientError('Invalid length');
  if(data.trigger === undefined || data.trigger === '') return new ClientError('Invalid trigger');
  if(checkFile && (data.file === undefined || data.file === '')) return new ClientError('Invalid file name');
  if(data.id === undefined || data.id === '' || !reId.test(data.id)) return new ClientError('Invalid id');
  return false;
}

const ALLOWED = ['audio/mpeg', 'audio/ogg', 'audio/x-wav'];
app.post('/api/create', upload.single('file'), (req, res, next) => {
  if(req.file === undefined)
    return next(new ClientError('No file uploaded'));

  const data = {
    id: uuid(),
    file: sanitize(req.file.originalname),
    regex: req.body.regex === 'true',
    trigger: req.body.trigger,
    volume: parseFloat(req.body.volume),
    fade: parseFloat(req.body.fade),
    length: parseFloat(req.body.length),
  };

  const invalid = invalidData(data, true);
  if(invalid)
    return next(invalid);

  fs.exists(path.join(process.cwd(), 'sounds', data.file), (exists) => {
    if(exists)
      return next(new ClientError('File already exists'));

    magic.detectFile(req.file.path, (errMagic, result) => {
      if(errMagic)
        return next(errMagic);
      if(!ALLOWED.includes(result))
        return next(new ClientError('Invalid file type'));

      fs.rename(req.file.path, path.join(process.cwd(), 'sounds', data.file), (errRename) => {
        if(errRename)
          return next(errRename);

        jsonfile.readFile(jsonPath, (errRead, obj) => {
          if(errRead)
            return next(errRead);

          const trigger = new Trigger(data.id, data);
          const cloned = Object.assign(obj, { [data.id]: trigger.toJson() });
          return jsonfile.writeFile(jsonPath, cloned, () => {
            app.emit('reload');
            res.setHeader('Content-Type', 'application/json');
            res.send({ success: true });
          });
        });
      });
    });
  });
});

app.post('/api/update', upload.none(), (req, res, next) => {
  const data = {
    id: req.body.id,
    trigger: req.body.trigger,
    regex: req.body.regex === 'true',
    volume: parseFloat(req.body.volume),
    fade: parseFloat(req.body.fade),
    length: parseFloat(req.body.length),
  };

  const invalid = invalidData(data, false);
  if(invalid)
    return next(invalid);

  jsonfile.readFile(jsonPath, (errRead, obj) => {
    if(errRead)
      return next(errRead);
    if(obj[data.id] === undefined)
      return next(new ClientError('Unknown id'));

    const trigger = new Trigger(data.id, Object.assign(obj[data.id], data));
    const cloned = Object.assign(obj, { [data.id]: trigger.toJson() });
    return jsonfile.writeFile(jsonPath, cloned, () => {
      app.emit('reload');
      res.setHeader('Content-Type', 'application/json');
      res.send({ success: true });
    });
  });
});

app.post('/api/delete', upload.none(), (req, res, next) => {
  const data = {
    id: req.body.id,
  };

  if(data.id === undefined || data.id === '' || !reId.test(data.id))
    return next(new ClientError('Invalid id'));

  jsonfile.readFile(jsonPath, (errRead, obj) => {
    if(errRead)
      return next(errRead);
    if(obj[data.id] === undefined)
      return next(new ClientError('unknown id'));

    fs.unlink(path.join(process.cwd(), 'sounds', obj[data.id].file), (errDel) => {
      if(errDel)
        return next(errDel);

      const { [data.id]: deleted, ...cloned } = obj;
      return jsonfile.writeFile(jsonPath, cloned, () => {
        app.emit('reload');
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true });
      });
    });
  });
});

app.get('/api/triggers', (req, res, next) => {
  jsonfile.readFile(path.join(process.cwd(), 'triggers.json'), (errRead, obj) => {
    if(errRead)
      return next(errRead);

    res.setHeader('Content-Type', 'application/json');
    res.send(obj);
  });
});

app.get('/api/stop', () => {
  app.emit('stop');
});

app.get('/api/skip', () => {
  app.emit('skip');
});

app.get('/api/play/:id', (req, res, next) => {
  jsonfile.readFile(path.join(process.cwd(), 'triggers.json'), (err, obj) => {
    if(obj[req.params.id] === undefined)
      return next(new ClientError('Unknown id'));

    app.emit('play', req.params.id);
    res.send({ success: true });
  });
});

app.get('/api/file/:id', (req, res, next) => {
  jsonfile.readFile(path.join(process.cwd(), 'triggers.json'), (err, obj) => {
    if(obj[req.params.id] === undefined)
      return next(new ClientError('Unknown id'));

    res.sendFile(path.join(process.cwd(), 'sounds', obj[req.params.id].file));
  });
});

app.use((err, req, res) => {
  if(!(err instanceof ClientError))
    console.error(err.stack);

  res.status(err instanceof ClientError ? 400 : 500).send({
    success: false,
    error: err.message,
    // "stack": err.stack
  });
});

module.exports = app;

