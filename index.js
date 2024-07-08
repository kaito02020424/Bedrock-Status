//@ts-check
const discord = require("discord.js");
const bedrock = require("bedrock-protocol");
const config = require("./config.json");
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMessages] });
/**
 * @typedef {{address:string,port:number,hostName:string}} host
 */
client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(config.prefix + "status")) {
        // @ts-ignore
        if (!message.member.roles.cache.has(config.roleId)) return;
        const l = message.content.split(" ");
        if (l.length === 1) {
            new Status(config.hosts, message)
            return;
        }
        new Status([{ address: l[1], port: Number(l[2]), hostName: l[3] }], message);
    }
})
client.on("error", (err) => {
    console.log("[Bedrock-Status]: ", err)
})
function date() {
    return new Date()
}
class Status {
    /**
     * @type {host[]}
     */
    hosts
    /**
     * @type {discord.Message<boolean>}
     */
    messageId
    /**
     * @type {NodeJS.Timeout}
     */
    timer
    /**
     * 
     * @param {host[]} hosts
     * @param {discord.Message<boolean>} message 
     */
    constructor(hosts, message) {
        this.hosts = hosts
        const embed = new discord.EmbedBuilder
        embed.setAuthor({ "name": "Bedrock Status" });
        /**
         * @type {Promise<boolean>[]}
         */
        const pingAwait = []
        for (const host of hosts) {
            pingAwait.push(setField(host, embed))
        }
        Promise
            .all(pingAwait)
            .then((/**@type {boolean[]}*/v) => {
                if (!v.includes(true)) {
                    embed
                        .setColor(0xff0000)
                        .setTitle("すべてのサーバーがオフラインです")
                } else if (v.includes(false)) {
                    embed
                        .setColor(0xf08b11)
                        .setTitle("一部のサーバーがオフラインです")
                } else {
                    embed
                        .setColor(0x00ff00)
                        .setTitle("すべてのサーバーがオンラインです")
                }
            })
            .finally(() => {
                embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()} 秒` })
                message.channel.send({ embeds: [embed] }).then((v) => {
                    /**
                     * @type {discord.Message<boolean>}
                     */
                    const value = v
                    this.messageId = value
                });
                this.timer = setInterval(() => {
                    /**
                     * @type {Promise<boolean>[]}
                     */
                    const pingAwait = []
                    const embed = new discord.EmbedBuilder
                    embed.setAuthor({ "name": "Bedrock Status" });
                    for (const host of hosts) {
                        pingAwait.push(setField(host, embed))
                    }
                    Promise
                        .all(pingAwait)
                        .then((/**@type {any[]}*/v) => {
                            if (!v.includes(true)) {
                                embed
                                    .setColor(0xff0000)
                                    .setTitle("すべてのサーバーがオフラインです")
                            } else if (v.includes(false)) {
                                embed
                                    .setColor(0xf08b11)
                                    .setTitle("一部のサーバーがオフラインです")
                            } else {
                                embed
                                    .setColor(0x00ff00)
                                    .setTitle("すべてのサーバーがオンラインです")
                            }
                        })
                        .finally(() => {
                            embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()} 秒` })
                            this.messageId.edit({ embeds: [embed] }).catch(console.log)
                        })
                }, config.intervalSec * 1000);
            })
    }
}
/**
 * 
 * @param {host} host 
 * @param {discord.EmbedBuilder} embed 
 * @returns {Promise<boolean>}
 */
function setField(host, embed) {
    return new Promise((r) => {
        bedrock.ping({ host: host.address, port: host.port })
            .then((value) => {
                embed.addFields({ name: host.hostName, value: `Status: Online\nServer Name: ${value.motd}\nWorld Name: ${value.levelName}\nVersion: ${value.version}\nPlayers: ${value.playersOnline}/${value.playersMax}`, inline: true })
                r(true)
            })
            .catch(() => {
                embed.addFields({ name: host.hostName, value: `Status: Offline\nServer Name : \nWorld Name : \nVersion : \nPlayers : 0/0`, inline: true })
                r(false)
            })
    })

}
client.login(config.token).catch(console.log);
