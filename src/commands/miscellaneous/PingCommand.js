"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
class PingCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'ping',
            category: 'miscellaneous',
            aliases: ['pong'],
            description: 'Latency and API response times.',
            examples: ['ping', 'pong']
        });
    }
    async run(client, message) {
        const pinging = new discord_js_1.MessageEmbed()
            .setTitle('🏓 Ping!')
            .setColor(0x0051a2)
            .setDescription('Pinging...');
        const msg = await message.channel.send({ embeds: [pinging] });
        const pong = new discord_js_1.MessageEmbed()
            .setTitle('🏓 Pong!')
            .setColor(0x0df94f)
            .setDescription(`Roundtrip took ${msg.createdTimestamp - message.createdTimestamp}ms. 💙: ${client.ws.ping}ms.`);
        msg.edit({ embeds: [pong] });
    }
}
exports.default = PingCommand;
