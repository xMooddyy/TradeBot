"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const a_djs_handler_2 = require("a-djs-handler");
const Roblox_1 = require("../../utils/Roblox");
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
const getTrade = async (roblox, tradeId) => {
    const item = await roblox.apis.tradesAPI.getTrade({ tradeId });
    if (!item)
        return null;
    return item;
};
class TradesCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'trades',
            description: 'Displays the linked account\'s inbound trades.',
            category: 'roblox',
            aliases: [],
            usage: 'trades (Inbound | Outbound | Completed)',
            examples: ['trades inbound', 'trades outbound'],
        });
    }
    async run(client, message, args) {
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
        const msg = await message.channel.send('Fetching trades...');
        const rawTrades = await roblox.apis.tradesAPI.getTradesByStatusType({ tradeStatusType: 'Inbound', limit: 100 }).catch(() => null);
        if (!rawTrades || !rawTrades.data.length)
            return msg.edit('There are no trades.');
        const trades = [];
        const promises = await Promise.all(rawTrades.data.map((trade) => getTrade(roblox, trade.id)));
        if (args[0]) {
            const user = await roblox.getUserIdFromUsername(args[0]).catch(() => null);
            if (!user)
                return msg.edit(`There is no user with the name ${args[0]}.`);
            trades.push(...promises.filter(Boolean).filter(c => c?.user.id === user.id));
            if (!trades.length)
                return msg.edit(`There are no trades with ${args[0]}.`);
        }
        else {
            trades.push(...promises.filter(Boolean));
            if (!trades.length)
                return msg.edit('There are no inbound trades.');
        }
        const embeds = [];
        for (const trade of trades) {
            const requested = trade.offers.find(c => c.user.id === roblox.user?.id);
            const offer = trade.offers.find(c => c.user.id !== roblox.user?.id);
            const requestedValues = await (0, Roblox_1.getValues)(requested.userAssets.map(c => c.assetId));
            const offerValues = await (0, Roblox_1.getValues)(offer.userAssets.map(c => c.assetId));
            requested.userAssets = requested.userAssets.map((c, i) => ({
                ...c,
                value: requestedValues[i] < 1 ? 0 : requestedValues[i],
            }));
            offer.userAssets = offer.userAssets.map((c, i) => ({
                ...c,
                value: offerValues[i] < 1 ? 0 : offerValues[i],
            }));
            const embed = new discord_js_1.MessageEmbed()
                .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                .setTitle(`Trade with ${trade.user.name} [${trade.user.id}]`)
                .setDescription('Item values are from the [Rolimons](https://www.rolimons.com/) website.')
                .addField('Items you will receive', (0, common_tags_1.stripIndents) `
            ${offer?.userAssets.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}

            **Total Value:** ${(0, numeral_1.default)(offer.userAssets.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
                .addField('Items you will give', (0, common_tags_1.stripIndents) `
            ${requested.userAssets.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}

            **Total Value:** ${(0, numeral_1.default)(requested.userAssets.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
                .setFooter(`Trade ID: ${trade.id} | ${roblox.user?.name}`, message.author.displayAvatarURL({ dynamic: true }));
            embeds.push({
                name: `${trade.id}`,
                content: embed,
                buttons: {
                    'First': {
                        customId: 'first',
                        value: 'first',
                        style: 'PRIMARY'
                    },
                    '<': {
                        customId: 'back',
                        value: 'previous',
                        style: 'PRIMARY'
                    },
                    '>': {
                        customId: 'next',
                        value: 'next',
                        style: 'PRIMARY'
                    },
                    'Last': {
                        customId: 'last',
                        value: 'last',
                        style: 'PRIMARY'
                    },
                    'Stop': {
                        customId: 'stop',
                        value: 'stop',
                        style: 'DANGER'
                    },
                },
            });
        }
        if (embeds.length <= 5) {
            await msg.edit({ embeds: embeds.map(m => m.content) });
        }
        else {
            new a_djs_handler_2.PaginationMenu({
                client,
                channel: message.channel,
                userId: message.author.id,
                pages: embeds,
                ms: 300000
            }).start();
        }
    }
}
exports.default = TradesCommand;
