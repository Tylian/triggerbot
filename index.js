const TriggerBot = require('./lib/TriggerBot');
const WebServer = require('./lib/WebServer');
const fs = require('fs');

const config = require('./config.json');

const client = new TriggerBot(config.master);
client.login(config.token);
client.openSocket(config.websocket);

const server = WebServer.listen(config['ui-port'], () => {
  console.log(`WebServer listening on port ${server.address().port}!`);
});

WebServer.on('play', (id) => { client.play(id); });
WebServer.on('reload', () => { client.reload(); });
WebServer.on('stop', () => { client.destroyQueue(); });
WebServer.on('skip', () => { client.skipQueue(); });

fs.watchFile('./triggers.json', () => { client.reload(); });

client.reload();
