"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const Roblox_1 = (0, tslib_1.__importDefault)(require("../../utils/Roblox"));
const config_json_1 = (0, tslib_1.__importDefault)(require("../../../config.json"));
const fs_nextra_1 = require("fs-nextra");
const common_tags_1 = require("common-tags");
const UserTextChannel_1 = (0, tslib_1.__importDefault)(require("../../utils/UserTextChannel"));
class AddAccountCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'addaccount',
            description: 'Adds an account to the account list.',
            ownerOnly: true,
            category: 'owner',
            accessableby: 'Bot owner',
            aliases: ['aa'],
            usage: 'addaccount [Cookie]',
            examples: ['addaccount .ROBLOXSECURITY...']
        });
    }
    async run(client, message, args) {
        if (!args[0])
            return message.channel.send('Please provide a valid Roblox cookie.');
        const user = await Roblox_1.default.login(args[0]).catch(() => null);
        if (!user)
            return message.channel.send('Invalid cookie provided.');
        const thumbnail = await Roblox_1.default.apis.thumbnailsAPI.getUsersFullBodyAvatarImages({ userIds: [user.id], format: 'png', size: '720x720' });
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Prompt')
            .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
            .setDescription((0, common_tags_1.stripIndents) `
        Is this the correct account?
        
        **Username:** ${user.name}
        **User ID:** ${user.id}`)
            .setImage(thumbnail.data[0].imageUrl)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }));
        const confirmationRow = new discord_js_1.MessageActionRow()
            .addComponents([
            new discord_js_1.MessageButton()
                .setCustomId('yes')
                .setStyle('SUCCESS')
                .setLabel('Yes'),
            new discord_js_1.MessageButton()
                .setCustomId('no')
                .setStyle('DANGER')
                .setLabel('No'),
        ]);
        const msg = await message.channel.send({ embeds: [embed], components: [confirmationRow] });
        const confirm = await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: i => i.user.id === message.author.id,
            time: 120000
        }).catch(() => null);
        if (!confirm) {
            await Roblox_1.default.login();
            return message.channel.send('Cancelled prompt.');
        }
        if (confirm.customId === 'no')
            return confirm.update({ embeds: [], components: [], content: 'Cancelled prompt.' });
        await confirm.deferReply();
        if (!(await user.getPremiumMembership()))
            return message.channel.send('This account is not a premium member.');
        if (config_json_1.default.users.find(c => c.username === user.name))
            return message.channel.send('That account already exists.');
        config_json_1.default.users.push({ cookie: args[0], username: user.name, channelId: '', guildId: '' });
        await (0, fs_nextra_1.writeJSON)('./config.json', config_json_1.default);
        client.userTextChannels.push(new UserTextChannel_1.default({
            channelId: '',
            client,
            cookie: args[0],
            guildId: '',
        }));
        await confirm.editReply('Successfully added the account.');
    }
}
exports.default = AddAccountCommand;
