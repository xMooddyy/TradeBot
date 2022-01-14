"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const a_djs_handler_2 = require("a-djs-handler");
const Roblox_1 = require("../../utils/Roblox");
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
        let userChannel = client.userTextChannels.find(c => c.channelId === message.channel.id && c.guildId === message.guild?.id);
        if (!userChannel) {
            const row = new discord_js_1.MessageActionRow()
                .addComponents(new discord_js_1.MessageSelectMenu()
                .setCustomId('account-select')
                .setPlaceholder('Select an account')
                .addOptions(client.userTextChannels.map(c => ({
                label: `${c.roblox.user?.name} [${c.roblox.user?.id}]`,
                value: c.roblox.user.id.toString(),
            }))));
            const msg = await message.channel.send({ content: 'Please specify the account you wish to continue with.', components: [row] });
            const interaction = await msg.awaitMessageComponent({
                componentType: 'SELECT_MENU',
                filter: i => i.user.id === message.author.id,
                time: 60000,
            }).catch(() => null);
            if (!interaction)
                return message.channel.send('Cancelled prompt.');
            userChannel = client.userTextChannels.find(c => c.roblox.user?.id === Number(interaction.values[0]));
            if (!userChannel)
                return;
            await interaction.update({ content: `Selected account: ${userChannel.roblox.user?.name} [${userChannel.roblox.user?.id}]`, components: [] });
            await userChannel.updateConfig(message.channel.id, message.guild.id);
        }
        const { roblox } = userChannel;
        if (!roblox.isLoggedIn())
            return message.channel.send('There is no linked account.');
        const embeds = await (0, Roblox_1.getInventoryPages)(roblox, message);
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
