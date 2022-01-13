"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const GuildSettings_1 = (0, tslib_1.__importDefault)(require("../../utils/models/GuildSettings"));
const Roblox_1 = (0, tslib_1.__importStar)(require("../../utils/Roblox"));
const config_json_1 = require("../../../config.json");
const Notifications_1 = (0, tslib_1.__importDefault)(require("../../utils/Notifications"));
const discord_js_1 = require("discord.js");
const PendingTrades_1 = (0, tslib_1.__importDefault)(require("../../utils/models/PendingTrades"));
const common_tags_1 = require("common-tags");
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
const Trades_1 = (0, tslib_1.__importDefault)(require("../../utils/models/Trades"));
class ReadyEvent extends a_djs_handler_1.BaseEvent {
    constructor() {
        super('ready');
    }
    async run(handler) {
        const { client } = handler;
        console.log(`${client.user?.username} is ready to watch ${client.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0)} users and ${client.guilds.cache.size} servers!`);
        if (config_json_1.ROBLOX_COOKIE.length && config_json_1.ROBLOX_COOKIE.find(c => c.primary === true))
            await Roblox_1.default.login(config_json_1.ROBLOX_COOKIE.find(c => c.primary === true).cookie).then(user => console.log(`Logged in as ${user.name}.`)).catch(() => console.error('Failed to login to Roblox.'));
        client.notifications = new Notifications_1.default(config_json_1.notifications.enabled ?? false);
        client.notifications.init();
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
        client.notifications.on('newTrade', async (trades) => {
            const guild = client.guilds.cache.get(config_json_1.notifications.guildId);
            if (!guild)
                return;
            const channel = guild.channels.cache.get(config_json_1.notifications.channelId);
            if (!channel || !channel.isText())
                return;
            for (const t of trades) {
                const trade = await Roblox_1.default.apis.tradesAPI.getTrade({ tradeId: t.id }).catch(() => null);
                if (!trade)
                    continue;
                const requested = trade.offers.find(c => c.user.id === Roblox_1.default.user?.id);
                const offer = trade.offers.find(c => c.user.id !== Roblox_1.default.user?.id);
                if (!offer || !requested)
                    continue;
                if (requested.userAssets.some(c => c.assetId === 19027209))
                    return;
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
                const thumbnail = await Roblox_1.default.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({ userIds: [offer.user.id] }).catch(() => null);
                const embed = new discord_js_1.MessageEmbed()
                    .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                    .setTitle(`[NEW TRADE] Trade with ${trade.user.name} [${trade.user.id}]`)
                    .setThumbnail(thumbnail?.data?.[0]?.imageUrl ?? '')
                    .addField('Items you will receive', (0, common_tags_1.stripIndents) `
                    ${offer?.userAssets.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}
                
                    **Total Value:** ${(0, numeral_1.default)(offer.userAssets.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
                    .addField('Items you will give', (0, common_tags_1.stripIndents) `
                    ${requested.userAssets.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}
                
                    **Total Value:** ${(0, numeral_1.default)(requested.userAssets.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
                    .setFooter(`Trade ID: ${trade.id}`, client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();
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
                const msg = await channel.send({ embeds: [embed], components: [confirmationRow], content: `Current Account: ${Roblox_1.default.user?.name} [${Roblox_1.default.user?.id}]` });
                await new Trades_1.default({
                    trade,
                    channelId: channel.id,
                    guildId: guild.id,
                    messageId: msg.id,
                }).save();
            }
        });
        setInterval(async () => {
            const trades = await PendingTrades_1.default.findAll();
            for (const t of trades) {
                const trade = await Roblox_1.default.apis.tradesAPI.getTrade({ tradeId: t.tradeId }).catch(() => null);
                if (!trade || trade.errors) {
                    await t.destroy();
                    continue;
                }
                if (trade.isActive)
                    continue;
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
                    .setTitle(`[${trade.status === 'Completed' ? 'ACCEPTED' : trade.status === 'DECLINED' ? 'DENIED' : 'UNKNOWN'}] Trade with ${trade.user.name} [${trade.user.id}]`)
                    .setColor(trade.status === 'Completed' ? a_djs_handler_1.COLOR_TYPES.SUCCESS : trade.status === 'DECLINED' ? a_djs_handler_1.COLOR_TYPES.DANGER : a_djs_handler_1.COLOR_TYPES.WARN);
                await channel.send({ embeds: [embed], content: `Current Account: ${Roblox_1.default.user?.name} [${Roblox_1.default.user?.id}]` });
                await channel.send({ content: `<@${t.userId}> ` });
								await t.destroy();
            }
        }, 60000);
    }
}
exports.default = ReadyEvent;
