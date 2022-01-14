"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryPages = exports.getValues = void 0;
const tslib_1 = require("tslib");
const bloxy_1 = require("bloxy");
const lodash_1 = require("lodash");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const roblox = new bloxy_1.Client();
const getValues = async (itemIds) => {
    const items = await axios_1.default.get('https://www.rolimons.com/itemapi/itemdetails').then((d) => d.data).catch(() => null);
    if (!items)
        return [];
    const toReturn = [];
    for (const id of itemIds) {
        if (items.items[id]) {
            toReturn.push(items.items[id][3]);
        }
    }
    return toReturn;
};
exports.getValues = getValues;
const getInventoryPages = async (client, message) => {
    const inventory = await client.apis.inventoryAPI.getUserCollectibles({ userId: client.user.id, limit: 100 }).catch(() => null);
    if (!inventory || !inventory.data.length)
        return Promise.reject('There are no collectibles in the account\'s inventory.');
    const chunks = (0, lodash_1.chunk)(inventory.data, 15);
    const embeds = [];
    let i = 0;
    const promises = chunks.map(async (inv, index) => {
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`${client.user.name}'s Inventory`)
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(`Page ${index + 1}/${chunks.length} | Requested by ${message?.author.tag ?? 'bot'}`, message?.author.displayAvatarURL({ dynamic: true }) ?? '');
        let output = '';
        const values = await (0, exports.getValues)(inv.map(c => c.assetId));
        inv = inv.map((c, ind) => ({
            ...c,
            value: values[ind] < 0 ? 0 : values[ind]
        }));
        const results = inv.map(async (item) => {
            output += `**${i + 1}**. ${item.name} - ${item.value} R$\n`;
            i++;
        });
        await Promise.allSettled(results);
        embed.setDescription(output);
        embeds.push({
            name: `embed${index}`,
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
    });
    await Promise.all(promises);
    return embeds;
};
exports.getInventoryPages = getInventoryPages;
exports.default = roblox;
