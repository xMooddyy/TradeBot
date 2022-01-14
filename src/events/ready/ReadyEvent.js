"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const GuildSettings_1 = (0, tslib_1.__importDefault)(require("../../utils/models/GuildSettings"));
const discord_js_1 = require("discord.js");
const PendingTrades_1 = (0, tslib_1.__importDefault)(require("../../utils/models/PendingTrades"));
const UserTextChannel_1 = (0, tslib_1.__importDefault)(require("../../utils/UserTextChannel"));
const config_json_1 = (0, tslib_1.__importDefault)(require("../../../config.json"));
class ReadyEvent extends a_djs_handler_1.BaseEvent {
    constructor() {
        super('ready');
    }
    async run(handler) {
        const { client } = handler;
        client.logger.info(`${client.user?.username} is ready to watch ${client.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0)} users and ${client.guilds.cache.size} servers!`);
        const statuses = [
            'commands',
            `${process.env.BOT_PREFIX}help`,
            `over ${client.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0)} users!`
        ];
        client.user?.setActivity(statuses.random(), { type: 'WATCHING' });
        setInterval(() => {
            client.user?.setActivity(statuses.random(), { type: 'WATCHING' });
        }, 60000);
        [...client.guilds.cache.keys()].forEach(async (guildId) => {
            const res = await GuildSettings_1.default.findOne({ where: { guildId } });
            if (!res) {
                await new GuildSettings_1.default({
                    guildId,
                    prefix: handler.options?.prefix
                }).save();
            }
        });
        config_json_1.default.users.forEach(e => client.userTextChannels.push(new UserTextChannel_1.default({
            cookie: e.cookie,
            channelId: e.channelId,
            client: handler.client,
            guildId: e.guildId
        })));
        await Promise.all(client.userTextChannels.map(e => e.init()));
        setInterval(async () => {
            const trades = await PendingTrades_1.default.findAll();
            for (const t of trades) {
                const acc = client.userTextChannels.find(e => e.roblox.user?.name?.toLowerCase() === t.robloxUsername.toLowerCase());
                if (!acc)
                    continue;
                const { roblox } = acc;
                const trade = await roblox.apis.tradesAPI.getTrade({ tradeId: t.tradeId }).catch(() => null);
                if (!trade) {
                    await t.destroy();
                    continue;
                }
                if (trade.isActive)
                    return;
                const guild = client.guilds.cache.get(t.guildId);
                if (!guild) {
                    await t.destroy();
                    continue;
                }
                const channel = guild.channels.cache.get(t.channelId);
                if (!channel || !channel.isText()) {
                    await t.destroy();
                    continue;
                }
                const embed = new discord_js_1.MessageEmbed(JSON.parse(t.embed))
                    .setTitle(`[${trade.status === 'Completed' ? 'ACCEPTED' : trade.status === 'Declined' ? 'DENIED' : 'UNKNOWN'}] Trade with ${trade.user.name} [${trade.user.id}]`)
                    .setColor(trade.status === 'Completed' ? a_djs_handler_1.COLOR_TYPES.SUCCESS : trade.status === 'Declined' ? a_djs_handler_1.COLOR_TYPES.DANGER : a_djs_handler_1.COLOR_TYPES.WARN);
                await channel.send({ embeds: [embed], content: `Current Account: ${roblox.user?.name} [${roblox.user?.id}]` });
                await channel.send({ content: `<@${t.userId}> ` });
                await t.destroy();
            }
        }, 60000);
    }
}
exports.default = ReadyEvent;
