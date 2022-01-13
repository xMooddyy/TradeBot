"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const a_djs_handler_2 = require("a-djs-handler");
const Roblox_1 = (0, tslib_1.__importStar)(require("../../utils/Roblox"));
class InventoryCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'inventory',
            description: 'Displays the linked account\'s inventory.',
            category: 'roblox',
            aliases: ['inv'],
        });
    }
    async run(client, message) {
        await client.commands.get('switchaccount')?.run(client, message, []);
        if (!Roblox_1.default.isLoggedIn())
            return message.channel.send('There is no linked account.');
        const embeds = await (0, Roblox_1.getInventoryPages)(message);
        if (embeds.length === 1) {
            await message.channel.send({ embeds: [embeds[0].content] });
        }
        else {
            new a_djs_handler_2.PaginationMenu({
                client,
                channel: message.channel,
                userId: message.author.id,
                pages: embeds,
                ms: 120000
            }).start();
        }
    }
}
exports.default = InventoryCommand;
