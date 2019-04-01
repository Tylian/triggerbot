const TriggerBot = require('./lib/TriggerBot');
const WebServer = require('./lib/WebServer');
const jsonfile = require("jsonfile");
const fs = require('fs');

const client = new TriggerBot();
client.login('MTgxOTA3NDIyNzQxMjY2NDMy.D3sxPA.Qbq5-ugUlbzx1l5Y_DsbbyoFai8');
// client.openSocket('ws://localhost:10501/OnLogLineRead');

const server = WebServer.listen(3000, () => {
    console.log(`WebServer listening on port ${server.address().port}!`);
});

fs.watchFile("./triggers.json", addTriggers);

function addTriggers() {
    client.clearTriggers();
    client.addTrigger({ "trigger": "!stop", "command": "stop" });

    jsonfile.readFile("./triggers.json", function (err, obj) {
        if (err) return console.error("Error parsing JSON, not reloaded...");
        for (let trigger of Object.values(obj.triggers)) {
            client.addTrigger(trigger);
        }
        console.log("Done reloading triggers");
    });
}

addTriggers();
