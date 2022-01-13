"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const config_json_1 = (0, tslib_1.__importDefault)(require("../../../config.json"));
const fs_nextra_1 = require("fs-nextra");
const Roblox_1 = (0, tslib_1.__importDefault)(require("../../utils/Roblox"));
class SwitchAccountCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'switchaccount',
            description: 'Switches to another account as primary.',
            ownerOnly: true,
            category: 'owner',
            accessableby: 'Bot owner',
            aliases: ['sa', 'switch'],
            usage: 'switchaccount (Username)',
            examples: ['switchaccount moodyy_q']
        });
    }
    async run(client, message, args) {
        if (!args[0]) {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Account List')
                .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                .setDescription('Please choose one of the following accounts to switch to.');
            for (const acc of config_json_1.default.ROBLOX_COOKIE) {
                embed.addField(acc.username, acc.primary ? 'Primary Account' : 'Not Primary Account');
            }
            const username = await client.handler.prompt(message, embed, {
                filter: m => config_json_1.default.ROBLOX_COOKIE.some(c => c.username.toLowerCase() === m.content.toLowerCase()),
                correct: 'Invalid account.',
                time: 120000,
            }).then(m => m.content.toLowerCase()).catch(() => null);
            if (!username)
                return;
            if (config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === username)?.primary === true)
                return message.channel.send('That account is already your primary account.');
            const user = await Roblox_1.default.login(config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === username).cookie).catch(() => null);
            if (!user)
                return message.channel.send('Failed to login as the new switched account.');
            config_json_1.default.ROBLOX_COOKIE.find(c => c.primary === true).primary = false;
            config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === username).primary = true;
            await (0, fs_nextra_1.writeJSON)('./config.json', config_json_1.default);
            await message.channel.send(`Successfully switched the account to ${user.name}.`);
        }
        else {
            if (!config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === args[0].toLowerCase()))
                return message.channel.send('That account does not exist, note that this is case-sensitive.');
            const user = await Roblox_1.default.login(config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === args[0].toLowerCase()).cookie).catch(() => null);
            if (!user)
                return message.channel.send('Failed to login as the new switched account.');
            config_json_1.default.ROBLOX_COOKIE.find(c => c.primary === true).primary = false;
            config_json_1.default.ROBLOX_COOKIE.find(c => c.username.toLowerCase() === args[0].toLowerCase()).primary = true;
            await (0, fs_nextra_1.writeJSON)('./config.json', config_json_1.default);
            await message.channel.send(`Successfully switched the account to ${user.name}.`);
        }
    }
}
exports.default = SwitchAccountCommand;
