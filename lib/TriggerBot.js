const Discord = require('discord.js');
const ActWebSocket = require('./ActWebSocket');
const Trigger = require('./Trigger.js');

class TriggerBot extends Discord.Client {
    constructor() {
        super();

        this.triggers = [];
        this.queue = [];
        this.busy = false;
        this.master = "49321607969116160";
        this.socket = null;
        this.channel = null;
    }

    clearTriggers() {
        this.triggers = [];
    }

    addTrigger(def) {
        this.triggers.push(new Trigger(def));
    }

    leaveChannel() {
        this.connection = null;
        for (var connection of this.voiceConnections.values()) {
            connection.disconnect();
        }
    }

    async joinChannel() {
        if(this.connection != null) return this.connection;
        let channel = this.channels.find(channel => channel.type == "voice" && channel.members.has(this.master));
        if(channel != undefined) {
            return this.connection = await channel.join();
        }
        return null;
    }

    async processQueue() {
        if(this.busy) { console.log("busy, deferring"); return true; }
        if(this.queue.length == 0) { console.log("Empty queue, leaving."); return this.leaveChannel(); }

        this.busy = true;

        let trigger = this.queue.shift();
        console.log(`${this.queue.length}: Playing ${trigger.trigger}`);
        let connection = await this.joinChannel();

        if(connection != undefined) {
            await trigger.play(this.connection);
        }

        this.busy = false;   
        return this.processQueue();
    }

    openSocket(uri) {
        this.socket = new ActWebSocket(uri);
        this.socket.on("data", async data => {
            if (data.msgtype != "Chat") return;

            let trigger = this.triggers.find(trigger => trigger.matches(data.msg));
            if(trigger == undefined) return;
        
            if(trigger.stop) {
                this.queue = [];
                this.leaveChannels();
            } else {
                this.queue.push(trigger);
                this.processQueue();
            }
        });
    }
}

module.exports = TriggerBot;