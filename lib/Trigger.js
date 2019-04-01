const path = require('path');

const triggerDefault = {
    volume: 0.75,
    fade: 0,
    length: 0,
    regex: false,
    trigger: "",
    file: "",
    stop: false
};

class Trigger {
    constructor(def) {
        Object.assign(this, triggerDefault, def);

        if(this.regex) {
            this.trigger = new RegExp(this.trigger, "g");
        }
    }

    // returns true if input matches the trigger
    matches(input) {
        return this.regex ? this.trigger.text(input) : input.indexOf(this.trigger) > -1;
    }

    play(connection) {
        let file = path.join(process.cwd(), "sounds", this.file);
        return new Promise((resolve, reject) => { 
            console.log("Playing", file);
            const dispatcher = connection.playFile(file, { seek: 0, volume: this.volume });
            dispatcher.on('end', resolve);

            if(this.length > 0 || this.fade > 0) {
                let end = (this.length + this.fade) * 1000;
                dispatcher.on('start', () => {
                    let fade = setInterval(() => {
                        let volume = Math.max(Math.min(1 - ((dispatcher.time / 1000) - this.length) / this.fade, 1), 0) * this.volume;
                        dispatcher.setVolumeLogarithmic(volume) 
                    }, 1000 / 10);

                    setTimeout(() => {
                        clearInterval(fade);
                        dispatcher.end();
                    }, end);
                });
            }
        });
    }
}

module.exports = Trigger;