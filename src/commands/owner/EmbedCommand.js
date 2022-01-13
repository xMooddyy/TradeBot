"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const common_tags_1 = require("common-tags");
const ms_1 = (0, tslib_1.__importDefault)(require("ms"));
const discord_js_1 = require("discord.js");
const makeEmbed = ({ description, time }) => {
    return new discord_js_1.MessageEmbed()
        .setTitle('Prompt')
        .setColor(a_djs_handler_1.COLOR_TYPES.INFO)
        .setDescription((0, common_tags_1.stripIndents) `
    ${description}
    
    Respond with \`cancel\` to end this prompt.`)
        .setTimestamp()
        .setFooter(`This prompt will end in ${(0, ms_1.default)(time, { long: true })}`);
};
class EmbedCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'embed',
            description: 'Generates an embed.',
            category: 'owner',
            aliases: ['em'],
            accessableby: 'Administrators',
            userPermissions: ['MANAGE_MESSAGES'],
        });
    }
    async run(client, message) {
        await message.channel.send('This prompt will resume in your DMs.');
        const dm = await message.author.createDM().catch(() => null);
        if (!dm)
            return;
        const channel = await client.handler.prompt(message, makeEmbed({ description: 'Please specify a channel to send the embed in.', time: 120000 }), {
            channel: dm,
            time: 120000,
            filter: (m) => !!client.handler.util.resolveChannel(m.content, message.guild.channels.cache, false, true),
            correct: 'You must specify a valid channel.',
            formatCorrect: (_, args) => args,
        }).then((m) => client.handler.util.resolveChannel(m.content, message.guild?.channels.cache, false, true)).catch(() => null);
        if (!channel || !channel.isText())
            return;
        const title = await client.handler.prompt(message, makeEmbed({ description: 'Please specify a title for the embed, respond with `none` if there is no title.', time: 120000 }), {
            channel: dm,
            time: 120000,
            filter: 256,
            correct: 'Title must be under 256 characters.',
        }).then((m) => m.content).catch(() => null);
        if (!title)
            return;
        const description = await client.handler.prompt(message, makeEmbed({ description: 'Please specify a description for the embed.', time: 300000 }), {
            time: 300000,
            channel: dm,
            filter: 4096,
            correct: 'Description must be under 4096 characters.',
        }).then((m) => m.content).catch(() => null);
        if (!description)
            return;
        const footer = await client.handler.prompt(message, makeEmbed({ description: 'Please specify a footer for the embed, respond with `none` for no footer, or `default` for the default footer (server name and icon).', time: 300000 }), {
            time: 300000,
            channel: dm,
            filter: 2048,
            correct: 'Footer must be under 2048 characters.',
        }).then((m) => m.content).catch(() => null);
        if (!footer)
            return;
        const image = await client.handler.prompt(message, makeEmbed({ time: 120000, description: 'Please specify an image for the embed, `none` for no image.' }), {
            time: 120000,
            channel: dm,
            filter: (m) => {
                if (m.content.toLowerCase() === 'none')
                    return true;
                if (m.attachments.size === 0 && a_djs_handler_1.urlRegex.test(m.content))
                    return true;
                if (!m.content && m.attachments.size >= 1)
                    return true;
                return false;
            },
            correct: (m) => {
                if (!a_djs_handler_1.urlRegex.test(m.content) && !m.attachments.size)
                    return 'You must provide a valid URL or an attachment.';
                if (!m.content && !m.attachments.size)
                    return 'You must provide a valid URL or an attachment';
                return 'You must provide a valid URL or an attachment';
            },
        }).then(m => m.content ? m.content.toLowerCase() : m.attachments.first().url);
        if (!image)
            return;
        const color = await client.handler.prompt(message, makeEmbed({ description: 'Please specify a color for the embed. It must be in hex format.', time: 300000 }), {
            time: 300000,
            channel: dm,
            filter: (m) => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(m.content) || m.content.toLowerCase() === 'none',
            correct: 'Invalid hex color.',
        }).then((m) => m.content).catch(() => null);
        if (!color)
            return;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(color.toLowerCase() === 'none' ? 0x000000 : parseInt(color.replace('#', ''), 16));
        if (title.toLowerCase() !== 'none')
            embed.setTitle(title);
        embed.setDescription(description);
        if (footer.toLowerCase() === 'default')
            embed.setFooter(message.guild?.name ?? '', message.guild?.iconURL({ dynamic: true }) ?? '');
        else if (footer.toLowerCase() !== 'none')
            embed.setFooter(footer, message.guild?.iconURL({ dynamic: true }) ?? '');
        if (image.toLowerCase() !== 'none')
            embed.setImage(image);
        const confirmationRow = new discord_js_1.MessageActionRow()
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
        const msg = await dm.send({ content: 'Here is a preview of your embed, do you wish to send it?', embeds: [embed], components: [confirmationRow] });
        const confirmation = await msg.awaitMessageComponent({
            filter: (i) => i.user.id === message.author.id && ['yes', 'no'].includes(i.customId),
            time: 120000,
            componentType: 'BUTTON',
        }).catch(() => null);
        if (!confirmation)
            return dm.send('Cancelled prompt.');
        if (confirmation.customId === 'no')
            return confirmation.reply('Cancelled prompt.');
        await confirmation.deferReply();
        await channel.send({ embeds: [embed] });
        await confirmation.editReply('Successfully sent the embed.');
    }
}
exports.default = EmbedCommand;
