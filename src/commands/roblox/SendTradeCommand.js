"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
const Roblox_1 = (0, tslib_1.__importStar)(require("../../utils/Roblox"));
const PendingTrades_1 = (0, tslib_1.__importDefault)(require("../../utils/models/PendingTrades"));
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const multiSend = async (embeds, message) => {
    if (embeds.length <= 10) {
        message.channel.send({ embeds });
    }
    else {
        const chunks = lodash_1.default.chunk(embeds, 10);
        for (const chunk of chunks) {
            await message.channel.send({ embeds: chunk });
            await delay(1000);
        }
    }
};
class SendTradeCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'sendtrade',
            category: 'roblox',
            description: 'Send a trade request to a user.',
            usage: 'sendtrade [user]',
            guildOnly: true,
            aliases: ['st'],
            examples: ['sendtrade moodyy_q']
        });
    }
    async run(client, message, args) {
        if (!Roblox_1.default.isLoggedIn())
            return message.channel.send('You are not logged in to Roblox, use the `switchaccount` or the `addaccount` command to login.');
        if (!args[0])
            return message.channel.send('Invalid usage, please provide a username to send a trade request to.');
        await client.commands.get('switchaccount')?.run(client, message, []);
        const userId = await Roblox_1.default.getUserIdFromUsername(args[0]).catch(console.error);
        if (!userId)
            return message.channel.send('Could not find a user with that username.');
        const user = await Roblox_1.default.getUser(userId.id);
        if (!(await user.getPremiumMembership()))
            return message.channel.send('That user does not have premium.');
        const inventory = await Roblox_1.default.apis.inventoryAPI.getUserCollectibles({ userId: Roblox_1.default.user.id, limit: 100 }).catch(console.error);
        const userInventory = await Roblox_1.default.apis.inventoryAPI.getUserCollectibles({ userId: user.id, limit: 100 }).catch(console.error);
        if (!userInventory || !inventory)
            return message.channel.send('Failed to send trade to user, most likely their inventory is private.');
        const chunks = lodash_1.default.chunk(inventory.data, 10);
        const embeds = [];
        let i = 0;
        const promises = chunks.map(async (inv) => {
            const embed = new discord_js_1.MessageEmbed()
                .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                .setTitle(`${Roblox_1.default.user.name} Inventory`)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            let output = '';
            const results = inv.map(async (item) => {
                output += `**${i + 1}**. ${item.name} [${item.assetId}] - ${item.recentAveragePrice} R$\n`;
                i++;
            });
            await Promise.allSettled(results);
            embed.setDescription(output);
            embeds.push(embed);
        });
        await Promise.all(promises);
        const embed1 = new discord_js_1.MessageEmbed()
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setTitle('Prompt')
            .setDescription((0, common_tags_1.stripIndents) `
        Please enter the number of the item you would like to trade, you may keep sending numbers until you reach 4 items.
        
        Respond with \`cancel\` to end this prompt.
        Respond with \`done\` to continue.`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
        await multiSend(embeds, message);
        let itemsToSend = await client.handler.prompt(message, embed1, {
            time: 300000,
            multiple: true,
            messages: 4,
            correct: async (msg, p) => {
                const content = msg.content.toLowerCase();
                if (content === 'done' && p.values.size < 1)
                    return 'You must select at least 1 item to trade.';
                const num = Number(content);
                if (Number.isNaN(num) || num < 0 || num > inventory.data.length)
                    return 'Please enter a valid number.';
                return 'Invalid input.';
            },
            filter: (m, p) => {
                if (m.content.toLowerCase() === 'done' && p.values.size < 1)
                    return false;
                else if (m.content.toLowerCase() === 'done' && p.values.size >= 1)
                    return true;
                const num = Number(m.content);
                if (Number.isNaN(num) || num < 0 || num > inventory.data.length)
                    return false;
                return true;
            },
            matchUntil: (m, p) => m.content.toLowerCase() === 'done' && p.values.size >= 1,
        }).then(coll => coll.map((c) => inventory.data[Number(c.content) - 1])).catch(console.error);
        if (!itemsToSend)
            return;
        const chunks2 = lodash_1.default.chunk(userInventory.data, 10);
        const embeds2 = [];
        let i2 = 0;
        const promises2 = chunks2.map(async (inv) => {
            const embed = new discord_js_1.MessageEmbed()
                .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                .setTitle(`${user.name} Inventory`)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            let output = '';
            const results = inv.map(async (item) => {
                output += `**${i2 + 1}**. ${item.name} [${item.assetId}] - ${item.recentAveragePrice} R$\n`;
                i2++;
            });
            await Promise.allSettled(results);
            embed.setDescription(output);
            embeds2.push(embed);
        });
        await Promise.all(promises2);
        const embed2 = new discord_js_1.MessageEmbed()
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setTitle('Prompt')
            .setDescription((0, common_tags_1.stripIndents) `
    Please enter the number of the item you would like to trade, you may keep sending numbers until you reach 4 items.
    
    Respond with \`cancel\` to end this prompt.
    Respond with \`done\` to continue.`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
        await multiSend(embeds2, message);
        let itemsToReceive = await client.handler.prompt(message, embed2, {
            time: 300000,
            multiple: true,
            messages: 4,
            correct: async (msg, p) => {
                const content = msg.content.toLowerCase();
                if (content === 'done' && p.values.size < 1)
                    return 'You must select at least 1 item to trade.';
                const num = Number(content);
                if (Number.isNaN(num) || num < 0 || num > userInventory.data.length)
                    return 'Please enter a valid number.';
                return 'Invalid input.';
            },
            filter: (m, p) => {
                if (m.content.toLowerCase() === 'done' && p.values.size < 1)
                    return false;
                else if (m.content.toLowerCase() === 'done' && p.values.size >= 1)
                    return true;
                const num = Number(m.content);
                if (Number.isNaN(num) || num < 0 || num > userInventory.data.length)
                    return false;
                return true;
            },
            matchUntil: (m, p) => m.content.toLowerCase() === 'done' && p.values.size >= 1,
        }).then(coll => coll.map((c) => userInventory.data[Number(c.content) - 1])).catch(console.error);
        if (!itemsToReceive)
            return;
        if (itemsToSend.some(c => c.assetId === 19027209))
            return;
        const receiveValues = await (0, Roblox_1.getValues)(itemsToReceive.map(c => c.assetId));
        const sendValues = await (0, Roblox_1.getValues)(itemsToSend.map(c => c.assetId));
        itemsToReceive = itemsToReceive.map((c, ind) => ({ ...c, value: receiveValues[ind] < 0 ? 0 : receiveValues[ind] }));
        itemsToSend = itemsToSend.map((c, ind) => ({ ...c, value: sendValues[ind] < 0 ? 0 : sendValues[ind] }));
        const embed = new discord_js_1.MessageEmbed()
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setTitle(`Trade with ${user.name} [${user.id}]`)
            .addField('Items you will receive', (0, common_tags_1.stripIndents) `
        ${itemsToReceive.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}

        **Total Value:** ${(0, numeral_1.default)(itemsToReceive.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
            .addField('Items you will give', (0, common_tags_1.stripIndents) `
        ${itemsToSend.map(c => `${c.name} - ${(0, numeral_1.default)(c.value).format('0,0')} RS`).join('\n')}

        **Total Value:** ${(0, numeral_1.default)(itemsToSend.reduce((prev, val) => prev + val.value, 0)).format('0,0')} RS`)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
        const row = new discord_js_1.MessageActionRow()
            .addComponents([
            new discord_js_1.MessageButton()
                .setCustomId('yes')
                .setLabel('Yes')
                .setStyle('SUCCESS'),
            new discord_js_1.MessageButton()
                .setCustomId('no')
                .setLabel('No')
                .setStyle('DANGER'),
        ]);
        const msg = await message.channel.send({ embeds: [embed], components: [row], content: 'Are you sure you want to send this trade?' });
        const confirm = await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: (int) => int.user.id === message.author.id,
            time: 120000
        }).catch(console.error);
        if (!confirm)
            return message.channel.send('Cancelled prompt.');
        if (confirm.customId === 'no')
            return confirm.update({ components: [], content: 'Cancelled prompt.' });
        await confirm.update({ components: [] });
        const trade = await Roblox_1.default.apis.tradesAPI.sendTrade({
            offers: [
                {
                    userId: user.id,
                    robux: 0,
                    userAssetIds: itemsToReceive.map(c => c.userAssetId),
                },
                {
                    userId: Roblox_1.default.user.id,
                    robux: 0,
                    userAssetIds: itemsToSend.map(c => c.userAssetId),
                }
            ],
        }).catch(console.error);
        if (!trade)
            return message.channel.send('Failed to send trade, this is most likely because their trades are turned off.');
        await message.channel.send(`Successfully sent a trade to ${user.name} [${user.id}].`);
        await PendingTrades_1.default.create({
            channelId: message.channel.id,
            userId: message.author.id,
            guildId: message.guild.id,
            tradeId: trade.id,
            embed: JSON.stringify(embed.toJSON()),
        });
    }
}
exports.default = SendTradeCommand;
