const WebSocket = require('ws');

class ActWebSocket extends WebSocket {
  constructor(uri) {
    super(uri);

    this.on('message', (data) => {
      if(data === '.') {
        this.send('.'); // Ping pong
      } else {
        const message = JSON.parse(data);
        this.emit('data', message);
      }
    });
  }
}

module.exports = ActWebSocket;
