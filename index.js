/* It's importing the config.json file, the discord.js module, the node-fetch module, and creating an
empty array. */
const config = require("./config.json");
const { MessageEmbed, Client } = require("discord.js");
const fetch = (...args) =>
    import ('node-fetch').then(({
        default: fetch
    }) => fetch(...args));
let clients = [];

/* It's creating a new Discord client for each server in the config.json file. */
for (let i = 0; i < config.servers.length; i++) {
    const client = new Client({
        intents: [],
        presence: {
            status: "idle",
            activities: [{
                name: "Loading..",
                type: "WATCHING",
            }, ],
        },
    });
    client.on("ready", () => {
        console.log(`Connected to ${client.user.tag}`);
        clients.push(client);
    });
    client.login(config.servers[i].token);
}

/* It's creating a new Discord client for the total player count. */
const totalclient = new Client({
    intents: [],
    presence: {
        status: "idle",
        activities: [{
            name: "Loading..",
            type: "WATCHING",
        }, ],
    },
});
/* It's checking if the `total_pop` object in the config.json file has a token. If it does, it will
login to the client. */
totalclient.on("ready", () => {
    console.log(`Connected to ${totalclient.user.tag}`);
});
if (config.total_pop.token) {
    totalclient.login(config.total_pop.token);
}

/* It's converting the `ServerPostInterval` and `refresh_interval` values from the config.json
file into seconds. */
const PostServerInterval = Math.floor(config.ServerPostInterval / 1000);
const RefreshInterval = Math.floor(config.refresh_interval / 1000);

const PostServerIntervalIntoMinutes = Math.floor(PostServerInterval / 60);

console.log(config.ServerPostInterval);
console.log(config.refresh_interval);
/* It's fetching the servers. */
setInterval(async() => {
    const servers = await FetchServers();
    for (let i = 0; i < servers.length; i++) {
        /* It's creating a new Discord embed. */
        const ServerOffline = new MessageEmbed()
            .setColor('#fc0313')
            .setTitle(servers[i]["data"]["attributes"]["name"] + " | Server Offline")
            .setDescription('The Server went offline!')
            .setFooter({ text: `This second will send every ${PostServerIntervalIntoMinutes} min` })
            /* It's creating a new Discord embed. */
        const ServerOnline = new MessageEmbed()
            .setColor('#28fc03')
            .setTitle(servers[i]["data"]["attributes"]["name"] + " | Server Online")
            .setDescription('The Server went online!')
            .setFooter({ text: `This second will send every ${PostServerIntervalIntoMinutes} min` })
            /* It's checking if the server is offline or dead. If it is, it will send a message to the
            channel
            with the ID of `config.ServerOffline`. If it's not, it will send a message to the channel
            with the ID of
            `config.ServerOnline`. */
        if (servers[i]["data"]["attributes"]["status"] === "offline" || servers[i]["data"]["attributes"]["status"] === "dead") {
            totalclient.channels.fetch(config.ServerOffline)
                .then(channel => channel.send({ embeds: [ServerOffline] }))
        } else {
            totalclient.channels.fetch(config.ServerOnline)
                .then(channel => channel.send({ embeds: [ServerOnline] }))
        }
    }

}, config.ServerPostInterval);

/* It's fetching the servers. */
setInterval(async() => {
    const servers = await FetchServers();
    let totalplayers = 0;

    /* It's checking if the server is offline or dead. If it is, it will set the status to "dnd" and the
    activity to "Server Offline". If it's not, it will check if the server has queued players. If it
    does, it will set the status to "online" and the activity to the amount of players and the queued
    players. If it doesn't, it will check if the amount of players is below the
    custom_text_when_pop_below value. If it is, it will set the status to "online" and the activity to
    the custom_text. If it's not, it will set the status to "online" and the activity to the amount of
    players and the max players. */
    for (let i = 0; i < servers.length; i++) {
        if (servers[i]["data"]["attributes"]["status"] === "offline" || servers[i]["data"]["attributes"]["status"] === "dead") {
            clients[i].user.setPresence({
                status: "dnd",
                activities: [{
                    name: "Server Offline",
                    type: "PLAYING",
                }, ],
            });
        } else if (servers[i]["data"]["attributes"]["details"]["rust_queued_players"]) {
            clients[i].user.setPresence({
                status: "online",
                activities: [{
                    name: `${servers[i]["data"]["attributes"]["players"]} / ${servers[i]["data"]["attributes"]["maxPlayers"]} (${servers[i]["data"]["attributes"]["details"]["rust_queued_players"]})`,
                    type: "PLAYING",
                }, ],
            });

            totalplayers += servers[i]["data"]["attributes"]["players"];
        } else {
            if (servers[i]["data"]["attributes"]["players"] < config.servers[i].custom_text_when_pop_below) {
                clients[i].user.setPresence({
                    status: "online",
                    activities: [{
                        name: config.servers[i].custom_text,
                        type: "PLAYING",
                    }, ],
                });
            } else {
                clients[i].user.setPresence({
                    status: "online",
                    activities: [{
                        name: `${servers[i]["data"]["attributes"]["players"]} / ${servers[i]["data"]["attributes"]["maxPlayers"]}`,
                        type: "PLAYING",
                    }, ],
                });
            }

            totalplayers += servers[i]["data"]["attributes"]["players"];
        }
    }
    /* It's checking if the `total_pop` object in the config.json file has a token. If it does, it will
    login to the client. */
    if (config.total_pop.token) {
        totalclient.user.setPresence({
            status: "online",
            activities: [{
                name: `${totalplayers} Total Players`,
                type: "PLAYING",
            }, ],
        });
    }
}, config.refresh_interval);

/**
 * It takes an array of server objects, and returns an array of server objects
 * @returns An array of objects.
 */
async function FetchServers() {
    const requests = config.servers.map((server) => fetch(`https://api.battlemetrics.com/servers/${server.battlemetrics_serverid}`));
    const responses = await Promise.all(requests);
    const promises = responses.map((response) => response.json());
    return await Promise.all(promises);
}
