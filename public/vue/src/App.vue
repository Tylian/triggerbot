<template>
  <div id="app">
    <modal v-show="showDelete" @close="showDelete = false">
      <h3 slot="header">Delete "{{deleteTrigger.trigger}}"?</h3>
      <p slot="body">Are you sure you wish to delete that? It'll be gone forever (a really long time!).</p>
      <div slot="footer">
        <button class="pure-button button-success modal-button" @click="showDelete = false">Noo!!</button>
        <button class="pure-button button-danger modal-button" @click="showDelete = false">Yes, delete</button>
      </div>
    </modal>

    <header>
      <h1>Trigger<span class="bot">Bot</span> Control</h1>
        <random-title class="lead">
          <p>Nice meme&trade;</p>
          <p>woahWoah<small>woah</small>&nbsp;&nbsp;&nbsp;<b>WOAH!&nbsp;&nbsp;&nbsp;<big>WOAH</big></b><big><b><big>WOAH</big></b><big><b><big>WOAH</big></b></big></big><big><b><big><big><b><big>WOAH</big></b></big></big></b></big></p>
          <p>Did somebody say M̸̶̼̲̮̱͕͕͔̯̟͙̖͚͕̔̋͐̽͛̅̄ͪͯ̐̆͒̀̚͘̕͞Ơ̷̼̻̼̪͉͚̟͍͙͚͈̠̲̞̖̘̗̫̺̒́̈́ͤ̌̐͗̅̈̽̃̋̈́̇̊͑͒͐̑͂̑́͟͜͝ͅǸ̌ͩ̊ͤ̓͗͂̿͐͏̨̬̪͎̣̳̜̗̮̦̫̭̲͍̫̥̲́͜͝͞S̡̨̜̤̮̗͚̞͔̣̙͖͕̱̻͇ͥ̈̅̅͗ͭͦ̒̓̕͢͢͜͢T̆͐̃̋̆͌͏̶̡́͟҉͍̭̪̝̦̦͇̭̫̳͕̣͕̘̻̳̤͙̫͍̰E̴̵͈̖͇͎͉̭̖̙̺̤̜͙̖͈̦̟ͣͭ́̿ͦͦ̀̀̚͝͡͠R̢̢̡̩͔͖̰̥̩̟̩̋̍̇ͦ̿ͤ͒ͦ͂̓ͥ̈́ͭ́ͨ͒̉͟͡͠ ̨͈̦̮͚̼̖̊͐ͧ͌̽̌̊̒͌̃ͯͥ̅́̚͘͡Hͣͭ̍ͩ̎̔̓̿̏̚҉̨̨̦͓̬̰̹͈̱̞͢͞Ũ̴̡̨̱̦̰̘͍̞̫̗̫̞̰ͯͤͭ̍͆ͨ̓͆̑̈͞͞ͅN̶͎̘̥̟̙̳̼̘̥͖̬͕̱̠̖̥̤͔͓̝̄̀̄͗͒̑ͭ̂͌́͟͢Ť̸̵̡̢̡̛̮̺̭̱͎̬̦̫͚͈̗͎̝ͫ̇͊͛ͤͅȨ̵̛̙̦̗̳̗͆̂̇ͧ̉͋ͪ̋͞͝ͅR̷͓͍̯̞̺̟̥̋̽͊̄̅̀̏͆̈́ͬ̈̎̔͊̓̕͘͟͢͡?</p>
        </random-title>
    </header>

    <section v-if="errors.length > 0" id="errors"></section>

    <section id="actions" class="spacer">
      <button class="pure-button" @click="showModal = true"><icon name="plus"></icon> Add new</button>
      <button class="pure-button" @click="skip"><icon name="step-forward"></icon> Skip</button>
      <button class="pure-button" @click="stop"><icon name="stop"></icon> Stop</button>
    </section>

    <section id="table">
      <table class="pure-table pure-table-striped table-borderless">
        <thead>
          <tr>
            <th>Trigger</th>
            <th>File</th>
            <th class="text-center">Volume</th>
            <th class="text-center">Duration</th>
            <th class="text-center">Fade</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr is="trigger-row" v-for="(item, id) in triggers"
            :key="id"
            :id="id"
            :item="item"
            @play="play(id)"
            @delete="deleteId = id; showDelete = true;"></tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import Icon from './components/Icon.vue';
import TriggerRow from './components/TriggerRow.vue';
import RandomTitle from './components/RandomTitle.vue';
import Modal from './components/Modal.vue';

export default {
  name: 'app',
  data: function() {
    return {
      triggers: {},
      errors: [],
      showDelete: false,
      deleteId: -1
    }
  },
  created() {
    this.updateTriggers();
  },
  computed: {
    deleteTrigger() {
      return this.triggers[this.deleteId] || {};
    }
  },
  methods: {
    stop() {
      fetch(new Request('/api/stop'));
    },
    skip() {
      fetch(new Request('/api/skip'));
    },
    play(id) {
      fetch(new Request('/api/play/' + id));
    },
    updateTriggers() {
      fetch(new Request('/api/triggers'))
        .then(response => response.json())
        .then(data => {
          const def = { volume: 100, fade: 0, length: 0, regex: false };
          for (let id in data) {
            let trigger = Object.assign({}, def, data[id]);
            this.$set(this.triggers, id, trigger);
          }
        });
    }
  },
  components: {
    RandomTitle, Icon, TriggerRow, Modal
  }
}
</script>

<style lang="scss">
.spacer {
  margin-bottom: 0.8rem;
}

h1 {
  margin-top: 1rem;
  .bot {
    background: #7289da;
    border-radius: 3px;
    color: #fff;
    font-size: 62.5%;
    font-weight: 500;
    margin-left: 6px;
    padding: 1px 2px;
    text-transform: uppercase;
  }
}

.lead {
  line-height: 1rem;
}
</style>
