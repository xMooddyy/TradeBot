"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Trades_1 = (0, tslib_1.__importDefault)(require("../../utils/models/Trades"));
const Roblox_1 = (0, tslib_1.__importStar)(require("../../utils/Roblox"));
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
class InteractionCreate extends a_djs_handler_1.BaseEvent {
    constructor() {
        super('interactionCreate');
    }
    async run(handler, interaction) {
        if (!interaction.inCachedGuild())
            return;
        if (interaction.isSelectMenu()) {
            const trade = await Trades_1.default.findOne({ where: { guildId: interaction.guildId, channelId: interaction.channelId, messageId: interaction.message.id } });
            if (trade && handler.options.owners?.includes(interaction.user.id)) {
                switch (interaction.values[0]) {
                    case 'accept': {
                        await Roblox_1.default.apis.tradesAPI.acceptTrade({ tradeId: trade.trade.id }).catch(() => null);
                        break;
                    }
                    case 'deny': {
                        await Roblox_1.default.apis.tradesAPI.declineTrade({ tradeId: trade.trade.id }).catch(() => null);
                        break;
                    }
                    case 'cancel': {
                        await trade.destroy();
                        break;
                    }
                }
                const embed = new discord_js_1.MessageEmbed(interaction.message.embeds[0])
                    .setTitle(`[${interaction.values[0] === 'accept' ? 'ACCEPTED' : interaction.values[0] === 'deny' ? 'DENIED' : 'CANCELLED'}] Trade with ${trade.trade.user.name} [${trade.trade.user.id}]`)
                    .setColor(interaction.values[0] === 'accept' ? a_djs_handler_1.COLOR_TYPES.SUCCESS : interaction.values[0] === 'deny' ? a_djs_handler_1.COLOR_TYPES.DANGER : a_djs_handler_1.COLOR_TYPES.WARN);
                if (interaction.values[0] === 'cancel')
                    return interaction.update({ content: 'Cancelled prompt.', components: [], embeds: [embed] });
                await interaction.update({ content: `Successfully ${interaction.values[0] === 'accept' ? 'accepted' : 'declined'} this trade.`, components: [], embeds: [embed] });
                await trade.destroy();
                const embeds = await (0, Roblox_1.getInventoryPages)();
                if (embeds.length === 1) {
                    await interaction.channel?.send({ embeds: [embeds[0].content] });
                }
                else {
                    new a_djs_handler_1.PaginationMenu({
                        client: handler.client,
                        channel: interaction.channel,
                        userId: interaction.user.id,
                        pages: embeds,
                        ms: 120000
                    }).start();
                }
            }
        }
    }
}
exports.default = InteractionCreate;
