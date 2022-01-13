"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const numeral_1 = (0, tslib_1.__importDefault)(require("numeral"));
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const getThumbnail = (assetId) => {
    return `https://www.roblox.com/Thumbs/Asset.ashx?width=420&height=420&format=png&assetId=${assetId}`;
};
const Demands = {
    [-1]: 'Not Assigned',
    [0]: 'Terrible',
    [1]: 'Low',
    [2]: 'Normal',
    [3]: 'High',
    [4]: 'Amazing'
};
const Trend = {
    [-1]: 'Not Assigned',
    [0]: 'Lowering',
    [1]: 'Unstable',
    [2]: 'Stable',
    [3]: 'Raising',
    [4]: 'Fluctuating',
};
class ItemDetailsCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'itemdetails',
            aliases: ['viewitem', 'id'],
            description: 'Get information about a roblox item.',
            usage: 'itemdetails [Item Name]',
            category: 'roblox',
            examples: ['itemdetails legit', 'itemdetails adurite antlers'],
        });
    }
    async run(client, message, args) {
        if (!args[0])
            return message.channel.send('Please provide an item name.');
        const itemName = args.join(' ');
        const items = await axios_1.default.get('https://www.rolimons.com/itemapi/itemdetails').then((d) => d.data).catch(() => null);
        if (!items)
            return message.channel.send('Could not get item details.');
        const [assetId, item] = Object.entries(items.items).find(([key, value]) => value[0].toLowerCase().includes(itemName.toLowerCase()) || value[1].toLowerCase().includes(itemName.toLowerCase()) || key === itemName) ?? [];
        if (!item || !assetId)
            return message.channel.send('I couldn\'t find that item.');
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`${item[0]} (${item[1]})`)
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setThumbnail(getThumbnail(Number(assetId)))
            .setURL(`https://www.rolimons.com/item/${assetId}`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            .addFields([
            { name: 'RAP', value: `${(0, numeral_1.default)(item[2]).format('0,0')}`, inline: true },
            { name: 'Value', value: `${(0, numeral_1.default)(item[3]).format('0,0')}`, inline: true },
            { name: 'Demand', value: `${Demands[item[5]]}`, inline: true },
            { name: 'Trend', value: `${Trend[item[6]]}`, inline: true },
            { name: 'Projected', value: `${item[7] === 1 ? 'Yes' : 'No'}`, inline: true },
            { name: 'Hyped', value: `${item[8] === 1 ? 'Yes' : 'No'}`, inline: true },
            { name: 'Rare', value: `${item[9] === 1 ? 'Yes' : 'No'}`, inline: true },
        ]);
        await message.channel.send({ embeds: [embed] });
    }
}
exports.default = ItemDetailsCommand;
