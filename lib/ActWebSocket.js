const WebSocket = require('ws');

class ActWebSocket extends WebSocket {
    constructor(uri) {
        super(uri);

        this.on('message', (data, flags) => {
            // Ping pong
            if(data == '.')
              return this.send('.');

            var message = JSON.parse(data);
            this.emit("data", message);
          });
    }
}

module.exports = ActWebSocket;