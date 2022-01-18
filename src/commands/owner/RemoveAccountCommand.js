"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const config_json_1 = (0, tslib_1.__importDefault)(require("../../../config.json"));
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const fs_nextra_1 = require("fs-nextra");
class RemoveAccountCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'removeaccount',
            description: 'Removes an account from the accounts list.',
            ownerOnly: true,
            category: 'owner',
            accessableby: 'Bot owner',
            aliases: ['ra'],
            usage: 'removeaccount (Username)',
            examples: ['removeaccount moodyy_q']
        });
    }
    async run(client, message, args) {
        if (!args[0]) {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Account List')
                .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
                .setDescription('Please choose one of the following accounts to remove.');
            let output = '';
            for (const acc of config_json_1.default.users) {
                output += `${acc.username}\n`;
            }
            embed.setDescription(`${embed.description}\n\n${output}`);
            const username = await client.handler.prompt(message, embed, {
                filter: m => client.userTextChannels.some(c => c.roblox.user?.name?.toLowerCase() === m.content.toLowerCase()),
                correct: 'Invalid account.',
                time: 120000,
            }).then(m => m.content).catch(() => null);
            if (!username)
                return;
            const user = client.userTextChannels.find(c => c.roblox.user?.name?.toLowerCase() === username.toLowerCase());
            await user.unInit();
            lodash_1.default.pullAllBy(config_json_1.default.users, [{ username }], 'username');
            client.userTextChannels.splice(client.userTextChannels.findIndex(c => c.roblox.user?.name?.toLowerCase() === username.toLowerCase()), 1);
            await (0, fs_nextra_1.writeJSON)('./config.json', config_json_1.default);
            await message.channel.send('Successfully removed the account from the list.');
        }
        else {
            if (!config_json_1.default.users.find(c => c.username === args[0]))
                return message.channel.send('That account is not in the list, this is case-sensitive.');
            const user = client.userTextChannels.find(c => c.roblox.user?.name?.toLowerCase() === args[0].toLowerCase());
            await user.unInit();
            lodash_1.default.pullAllBy(config_json_1.default.users, [{ username: args[0] }], 'username');
            client.userTextChannels.splice(client.userTextChannels.findIndex(c => c.roblox.user?.name?.toLowerCase() === args[0].toLowerCase()), 1);
            await (0, fs_nextra_1.writeJSON)('./config.json', config_json_1.default);
            await message.channel.send('Successfully removed the account from the list.');
        }
    }
}
exports.default = RemoveAccountCommand;
