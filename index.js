import Discord from "discord.js";
import fetch from "node-fetch";
import { createRequire } from "module";
const config = createRequire(import.meta.url)("./config.json");
let totalPlayers = [];
const client = new Discord.Client({
    intents: [], presence: {
        status: "idle",
        activities: [{
            name: "Loading..",
            type: "WATCHING"
        }]
    }
});

for (let i = 0; i < config.servers.length; i++) {
    const client = new Discord.Client({
        intents: [], presence: {
            status: "idle",
            activities: [{
                name: "Loading..",
                type: "WATCHING"
            }]
        }
    });

    client.on('ready', () => {
        console.log(`Connected to ${client.user.tag}`);
    })

    setInterval(async () => {
        const response = await (await (fetch(`https://api.battlemetrics.com/servers/${config.servers[i].battlemetrics_serverid}`))).json();
        if (response['data']['attributes']['status'] === "offline" || response['data']['attributes']['status'] === "dead") {
            client.user.setPresence({
                status: "dnd",
                "activities": [{
                    name: "Server Offline",
                    type: "PLAYING"
                }]
            });
        }
        else if (response['data']['attributes']['details']['rust_queued_players']) {
            client.user.setPresence({
                status: "online",
                "activities": [{
                    name: `${response['data']['attributes']['players']}/${response['data']['attributes']['maxPlayers']} (${response['data']['attributes']['details']['rust_queued_players']})`,
                    type: "PLAYING"
                }]
            });
            totalPlayers[i] = response['data']['attributes']['players'] + response['data']['attributes']['details']['rust_queued_players'];
        }
        else {
            client.user.setPresence({
                status: "online",
                "activities": [{
                    name: `${response['data']['attributes']['players']}/${response['data']['attributes']['maxPlayers']}`,
                    type: "PLAYING"
                }]
            });
            totalPlayers[i] = response['data']['attributes']['players'];
        }
    }, config.refresh_interval);

    client.login(config.servers[i].token);
}

client.on('ready', () => {
    console.log(`Connected to ${client.user.tag}`);
})

setInterval(() => {
    if (totalPlayers.length > 0) {
        client.user.setPresence({
            status: "online",
            "activities": [{
                name: `${totalPlayers.reduce((a, b) => a + b, 0)} Total Players`,
                type: "PLAYING"
            }]
        });
    }
}, config.refresh_interval);

client.login(config.global_pop.token);