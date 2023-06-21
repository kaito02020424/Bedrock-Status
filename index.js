const discord = require("discord.js");
const bedrock = require("bedrock-protocol");
const config = require("./config.json");
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMessages] });
let messageId;
client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(config.prefix)) {
        if (message.content.startsWith(config.prefix + "status")){
            if (!message.member.roles.cache.has(config.roleId)) return;
            const l = message.content.split(" ");
            if (l.length === 1) {
                new Status(config.host,config.port,message)
                return;
            }
            new Status(l[1],Number(l[2]),message);
        }
    }
})
function date() {
    return new Date()
}
class Status {
    constructor(address, port,message) {
        this.address = address;
        this.port = port;
        bedrock.ping({ host: this.address, port: this.port })
            .then((value) => {
                let embed = new discord.EmbedBuilder;
                embed.setAuthor({ "name": "Bedrock Status" });
                embed.setColor(0x00ff00);
                embed.setTitle("Server is Online")
                embed.setDescription(`Server Name : ${value.motd}\nWorld Name : ${value.levelName}\nVersion : ${value.version}\nPlayers : ${value.playersOnline}/${value.playersMax}`)
                embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()}秒` })
                message.channel.send({ embeds: [embed] }).then((value) => {
                    this.messageId = value
                });
            })
            .catch(() => {
                let embed = new discord.EmbedBuilder;
                embed.setAuthor({ "name": "Bedrock Status" });
                embed.setColor(0xff0000);
                embed.setTitle("Server is Offline")
                embed.setDescription(`Server Name : None\nWorld Name : None\nVersion : None\nPlayers : None`)
                embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()}秒` })
                message.channel.send({ embeds: [embed] }).then((value) => {
                    this.messageId = value
                });
            })
            .finally(() => {
                setInterval(() => {
                    bedrock.ping({ host: this.address, port: this.port })
                        .then((value) => {
                            let embed = new discord.EmbedBuilder;
                            embed.setAuthor({ "name": "Bedrock Status" });
                            embed.setColor(0x00ff00);
                            embed.setTitle("Server is Online")
                            embed.setDescription(`Server Name : ${value.motd}\nWorld Name : ${value.levelName}\nVersion : ${value.version}\nPlayers : ${value.playersOnline}/${value.playersMax}`)
                            embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()}秒` })
                            this.messageId.edit({ embeds: [embed] })
                        })
                        .catch(() => {
                            let embed = new discord.EmbedBuilder;
                            embed.setAuthor({ "name": "Bedrock Status" });
                            embed.setColor(0xff0000);
                            embed.setTitle("Server is Offline")
                            embed.setDescription(`Server Name : None\nWorld Name : None\nVersion : None\nPlayers : None`)
                            embed.setFooter({ text: `${date().getFullYear()}年${date().getMonth() + 1}月${date().getDate()}日${date().getHours()}時${date().getMinutes()}分${date().getSeconds()}秒` })
                            this.messageId.edit({ embeds: [embed] })
                        })
                }, config.intervalSec * 1000);
            })
    }
}
client.login(config.token);