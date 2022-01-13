"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const Roblox_1 = (0, tslib_1.__importStar)(require("../../utils/Roblox"));
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
class ViewTradeCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'viewtrade',
            description: 'Views a trade and accepts/deny a trade.',
            category: 'roblox',
            aliases: ['vt'],
            usage: 'trade [Trade ID]',
            examples: ['trade 123456789'],
        });
    }
    async run(client, message, args) {
        await client.commands.get('switchaccount')?.run(client, message, []);
        if (!args[0] || Number.isNaN(Number(args[0])))
            return message.channel.send('Please provide a valid trade ID.');
        const trade = await Roblox_1.default.apis.tradesAPI.getTrade({ tradeId: Number(args[0]) }).catch(() => null);
        if (!trade || !trade.isActive)
            return message.channel.send('That trade does not exist or is no longer active.');
        const requested = trade.offers.find(c => c.user.id === Roblox_1.default.user?.id);
        const offer = trade.offers.find(c => c.user.id !== Roblox_1.default.user?.id);
        const requestedValues = await (0, Roblox_1.getValues)(requested.userAssets.map(c => c.assetId));
        const offerValues = await (0, Roblox_1.getValues)(offer.userAssets.map(c => c.assetId));
        if (requested.userAssets.some(c => c.assetId === 19027209))
            return;
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
            .setFooter(`Trade ID: ${trade.id} | ${Roblox_1.default.user?.name}`, message.author.displayAvatarURL({ dynamic: true }));
        const confirmationRow = new discord_js_1.MessageActionRow()
            .addComponents([
            new discord_js_1.MessageSelectMenu()
                .setCustomId('trade-confirm')
                .setPlaceholder('Please select an option.')
                .addOptions([
                { label: 'Accept', value: 'accept', description: 'Accept this trade.' },
                { label: 'Deny', value: 'deny', description: 'Deny this trade.' },
                { label: 'Cancel', value: 'cancel', description: 'Cancel the interaction and delete the message. **Does not affect the trade**' }
            ])
        ]);
        const msg = await message.channel.send({ embeds: [embed], components: [confirmationRow] });
        const confirm = await msg.awaitMessageComponent({
            componentType: 'SELECT_MENU',
            filter: i => i.user.id === message.author.id,
            time: 120000
        }).catch(() => null);
        if (!confirm)
            return message.channel.send('Cancelled prompt.');
        if (confirm.values[0] === 'cancel')
            return confirm.update({ content: 'Cancelled prompt.', components: [], embeds: [] });
        switch (confirm.values[0]) {
            case 'accept':
                await Roblox_1.default.apis.tradesAPI.acceptTrade({ tradeId: trade.id }).catch(() => null);
                break;
            case 'deny':
                await Roblox_1.default.apis.tradesAPI.declineTrade({ tradeId: trade.id }).catch(() => null);
                break;
        }
        const newEmbed = new discord_js_1.MessageEmbed(embed)
            .setTitle(`[${confirm.values[0] === 'accept' ? 'ACCEPTED' : confirm.values[0] === 'deny' ? 'DENIED' : 'CANCELLED'}] Trade with ${trade.user.name} [${trade.user.id}]`)
            .setColor(confirm.values[0] === 'accept' ? a_djs_handler_1.COLOR_TYPES.SUCCESS : confirm.values[0] === 'deny' ? a_djs_handler_1.COLOR_TYPES.DANGER : a_djs_handler_1.COLOR_TYPES.WARN);
        await confirm.update({ content: `Successfully ${confirm.values[0] === 'accept' ? 'accepted' : 'declined'} this trade.`, components: [], embeds: [newEmbed] });
        const embeds = await (0, Roblox_1.getInventoryPages)(message);
        if (embeds.length === 1) {
            await message.channel.send({ embeds: [embeds[0].content] });
        }
        else {
            new a_djs_handler_1.PaginationMenu({
                client,
                channel: message.channel,
                userId: message.author.id,
                pages: embeds,
                ms: 120000
            }).start();
        }
    }
}
exports.default = ViewTradeCommand;
