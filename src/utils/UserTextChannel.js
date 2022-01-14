"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bloxy_1 = require("bloxy");
const Notifications_1 = (0, tslib_1.__importDefault)(require("./Notifications"));
const a_djs_handler_1 = require("a-djs-handler");
const Roblox_1 = require("./Roblox");
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
const Trades_1 = (0, tslib_1.__importDefault)(require("./models/Trades"));
const config_json_1 = (0, tslib_1.__importDefault)(require("../../config.json"));
const fs_nextra_1 = require("fs-nextra");
class UserTextChannel {
    constructor(options) {
        this.cookie = options.cookie;
        this.channelId = options.channelId;
        this.roblox = new bloxy_1.Client({ credentials: { cookie: this.cookie } });
        this.guildId = options.guildId;
        this.client = options.client;
        this.notifications = new Notifications_1.default(this.roblox, this.client, true);
        this.notifications.on('newTrade', async (trades) => {
            const guild = this.client.guilds.cache.get(this.guildId);
            if (!guild)
                return;
            const channel = guild.channels.cache.get(this.channelId);
            if (!channel || !channel.isText())
                return;
            for (const t of trades) {
                const trade = await this.roblox.apis.tradesAPI.getTrade({ tradeId: t.id }).catch(() => null);
                if (!trade)
                    continue;
                const requested = trade.offers.find(c => c.user.id === this.roblox.user?.id);
                const offer = trade.offers.find(c => c.user.id !== this.roblox.user?.id);
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
                const thumbnail = await this.roblox.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({ userIds: [offer.user.id] }).catch(() => null);
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
                    .setFooter(`Trade ID: ${trade.id}`, this.client.user.displayAvatarURL({ dynamic: true }))
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
                const msg = await channel.send({ embeds: [embed], components: [confirmationRow], content: `Current Account: ${this.roblox.user?.name} [${this.roblox.user?.id}]` });
                await new Trades_1.default({
                    trade,
                    channelId: channel.id,
                    guildId: guild.id,
                    messageId: msg.id,
                }).save();
            }
        });
    }
    async init() {
        await this.roblox.login();
        await this.notifications.init();
    }
    async updateConfig(channelId, guildId) {
        if (this.channelId === channelId && this.guildId === guildId)
            return;
        this.channelId = channelId;
        this.guildId = guildId;
        config_json_1.default.users.forEach(c => {
            if (c.cookie === this.cookie) {
                c.channelId = channelId;
                c.guildId = guildId;
            }
        });
        await (0, fs_nextra_1.writeJSON)('config.json', config_json_1.default);
    }
}
exports.default = UserTextChannel;
