const path = require('path');

const triggerDefault = {
  volume: 100,
  fade: 0,
  length: 0,
  regex: false,
  trigger: '',
  file: '',
  command: 'play',
  specificity: 0,
};

class Trigger {
  constructor(id, def) {
    this.id = id;
    Object.assign(this, triggerDefault, def);

    this.location = path.join(process.cwd(), 'sounds', this.file);
  }

  // returns a number > 0 if matches
  matches(input) {
    if(this.regex) {
      const match = new RegExp(this.trigger).exec(input);
      return match != null ? this.specificity + match.length : 0;
    }

    return input.indexOf(this.trigger) > -1 ? this.specificity + this.trigger.length : 0;
  }

  async play(connection) {
    return new Promise((resolve, reject) => {
      this.dispatcher = connection.playFile(this.location, { volume: 0.75 * (this.volume / 100) });
      this.dispatcher.on('end', () => {
        delete this.dispatcher;
        resolve();
      });
      this.dispatcher.on('error', (err) => {
        delete this.dispatcher;
        reject(err);
      });

      if(this.length > 0 || this.fade > 0) {
        const end = (this.length + this.fade) * 1000;
        this.dispatcher.on('start', () => {
          const fade = setInterval(() => {
            let volume = (this.volume / 100);
            volume *= 1 - (((this.dispatcher.time / 1000) - this.length) / this.fade);
            this.dispatcher.setVolume(Math.max(Math.min(volume, 1), 0));
          }, 1000 / 10);

          setTimeout(() => {
            clearInterval(fade);
            this.dispatcher.end();
          }, end);
        });
      }
    });
  }

  end() {
    if(this.dispatcher !== undefined)
      this.dispatcher.end();
  }

  toJson() {
    return Object.assign({}, ...Object.entries(triggerDefault)
      .filter(([k, v]) => this[k] !== v)
      .map(([k]) => ({ [k]: this[k] })));
  }
}

module.exports = Trigger;
