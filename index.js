import Discord from "discord.js";
import fetch from "node-fetch";
import { createRequire } from "module";
import { setInterval } from "timers";
const config = createRequire(import.meta.url)("./config.json");
let guild;
//Connecting to server bots
let clients = [];
for (let i = 0; i < config.servers.length; i++) {
    const client = new Discord.Client({
        intents: [],
        presence: {
            status: "idle",
            activities: [
                {
                    name: "Loading..",
                    type: "WATCHING",
                },
            ],
        },
    });
    client.on("ready", () => {
        console.log(`Connected to ${client.user.tag}`);
        clients.push(client);
    });
    client.login(config.servers[i].token);
}

//Connecting to total count bot
const totalclient = new Discord.Client({
    intents: [],
    presence: {
        status: "idle",
        activities: [
            {
                name: "Loading..",
                type: "WATCHING",
            },
        ],
    },
});
totalclient.on("ready", () => {
    console.log(`Connected to ${totalclient.user.tag}`);
});
if (config.total_pop.token) {
    totalclient.login(config.total_pop.token);
}

//refreshing player count
setInterval(async () => {
    const servers = await FetchServers();
    let totalplayers = 0;

    for (let i = 0; i < servers.length; i++) {
        if (servers[i]["data"]["attributes"]["status"] === "offline" || servers[i]["data"]["attributes"]["status"] === "dead") {
            clients[i].user.setPresence({
                status: "dnd",
                activities: [
                    {
                        name: "Server Offline",
                        type: "PLAYING",
                    },
                ],
            });
        } else if (servers[i]["data"]["attributes"]["details"]["rust_queued_players"]) {
            clients[i].user.setPresence({
                status: "online",
                activities: [
                    {
                        name: `${servers[i]["data"]["attributes"]["players"]} / ${servers[i]["data"]["attributes"]["maxPlayers"]} (${servers[i]["data"]["attributes"]["details"]["rust_queued_players"]})`,
                        type: "PLAYING",
                    },
                ],
            });

            totalplayers += servers[i]["data"]["attributes"]["players"];
        } else {
            if (servers[i]["data"]["attributes"]["players"] < config.servers[i].custom_text_when_pop_below) {
                clients[i].user.setPresence({
                    status: "online",
                    activities: [
                        {
                            name: config.servers[i].custom_text,
                            type: "PLAYING",
                        },
                    ],
                });
            } else {
                clients[i].user.setPresence({
                    status: "online",
                    activities: [
                        {
                            name: `${servers[i]["data"]["attributes"]["players"]} / ${servers[i]["data"]["attributes"]["maxPlayers"]}`,
                            type: "PLAYING",
                        },
                    ],
                });
            }

            totalplayers += servers[i]["data"]["attributes"]["players"];
        }
    }
    if (config.total_pop.token) {
        totalclient.user.setPresence({
            status: "online",
            activities: [
                {
                    name: `${totalplayers} Total Players`,
                    type: "PLAYING",
                },
            ],
        });
    }
}, 10000);

//function to fetch all servers
async function FetchServers() {
    const requests = config.servers.map((server) => fetch(`https://api.battlemetrics.com/servers/${server.battlemetrics_serverid}`));
    const responses = await Promise.all(requests);
    const promises = responses.map((response) => response.json());
    return await Promise.all(promises);
}

//Discord Pop
const discordclient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILDS],
    presence: {
        status: "idle",
        activities: [
            {
                name: "Loading..",
                type: "WATCHING",
            },
        ],
    },
});
discordclient.on("ready", () => {
    console.log(`Connected to ${discordclient.user.tag}`);
    guild = discordclient.guilds.cache.get(config.discord_pop.guild_id);
    if(!guild){
        console.log("Wrong Guild ID")
    }
});
if (config.discord_pop.token) {
    discordclient.login(config.discord_pop.token);
    
    setInterval(async () => {
        if(guild){
            const guildinfo = await guild.fetch();
            discordclient.user.setPresence({
                status: "online",
                activities: [
                    {
                        name: `${guildinfo.approximatePresenceCount} / ${guildinfo.approximateMemberCount} Guild Members`,
                        type: "PLAYING",
                    },
                ],
            });
        }
    }, 60000);
}
