const Discord = require('discord.js');
const ActWebSocket = require('./ActWebSocket');
const Trigger = require('./Trigger.js');
const jsonfile = require('jsonfile');

class TriggerBot {
  constructor(master) {
    this.client = new Discord.Client();
    this.triggers = [];
    this.queue = [];
    this.master = master;
    this.socket = null;
    this.channel = null;

    this.pos = 0;

    this.client.on('message', (message) => {
      if(message.isMentioned(this.client.user))
        this.processInput(message.cleanContent);
    });
  }

  login(token) {
    return this.client.login(token);
  }

  clearTriggers() {
    this.triggers = [];
  }

  addTrigger(id, def) {
    this.triggers.push(new Trigger(id, def));
  }

  getMatchingTrigger(input) {
    let matchedTrigger;
    let matchedSpecificity = 0;

    this.triggers.forEach((trigger) => {
      const result = trigger.matches(input);
      if(result > matchedSpecificity) {
        matchedTrigger = trigger;
        matchedSpecificity = result;
      }
    });

    return matchedTrigger;
  }

  async joinChannel() {
    this.leaveChannel();
    const channel = this.client.channels.find(c => c.type === 'voice' && c.members.has(this.master));
    if(channel == null)
      throw new Error('Unable to find channel!');

    this.connection = await channel.join();
    return this.connection;
  }

  async leaveChannel() {
    if(this.connection !== null && this.connection !== undefined)
      this.connection.disconnect();
    delete this.connection;
  }

  async pushQueue(item) {
    this.queue.push(item);
    if(this.queue.length > 1)
      return;

    const connection = await this.joinChannel();
    await this.processQueue(connection);
    await this.leaveChannel();
  }

  async destroyQueue() {
    this.queue = [];
    delete this.trigger;
    return this.leaveChannel();
  }

  async processQueue(connection) {
    this.trigger = this.queue.shift();
    await this.trigger.play(connection);
    delete this.trigger;

    return this.queue.length > 0 ? this.processQueue(connection) : Promise.resolve();
  }

  async skipQueue() {
    if(this.trigger !== undefined)
      this.trigger.end();
  }

  async processInput(input) {
    const trigger = this.getMatchingTrigger(input);
    if(trigger === undefined)
      return Promise.resolve();

    switch (trigger.command) {
      case 'reload': return this.reload();
      case 'stop': return this.destroyQueue();
      case 'skip': return this.skipQueue();
      case 'play':
      default: return this.pushQueue(trigger).catch((e) => {
        console.error(e);
        this.destroyQueue();
      });
    }
  }

  play(id) {
    const trigger = this.triggers.find(t => t.id === id);
    if(trigger === undefined) return;

    this.pushQueue(trigger).catch((e) => {
      console.error(e);
      this.destroyQueue();
    });
  }

  reload() {
    this.clearTriggers();
    this.addTrigger('3d564769-241e-4275-a24b-bb73de0b4970', { trigger: '!stop', command: 'stop', specificity: 9999 });
    this.addTrigger('2405ea96-1653-460c-b02e-5dda5858329f', { trigger: '!skip', command: 'skip', specificity: 9999 });
    this.addTrigger('85db9d3b-714d-4bd2-9ef5-6cf5cab1664e', { trigger: '!reload', command: 'reload', specificity: 9999 });

    jsonfile.readFile('./triggers.json', (err, obj) => {
      if(err) return console.error('Error parsing JSON, not reloaded...');
      Object.entries(obj).forEach(([id, trigger]) => {
        this.addTrigger(id, trigger);
      });
      console.log('Done reloading triggers');
    });
  }

  openSocket(uri) {
    this.socket = new ActWebSocket(uri);
    this.socket.on('data', (data) => {
      if(data.msgtype === 'Chat')
        this.processInput(data.msg);
    });
  }
}

module.exports = TriggerBot;
