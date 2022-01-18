"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const GuildSettings_1 = (0, tslib_1.__importDefault)(require("../../utils/models/GuildSettings"));
const cooldowns = new discord_js_1.Collection();
class MessageEvent extends a_djs_handler_1.BaseEvent {
    constructor() {
        super('messageCreate');
    }
    async run(handler, message) {
        if (message.author.bot)
            return;
        const { client } = handler;
        if (await handler.listenForPrompts(message))
            return;
        const res = await GuildSettings_1.default.findOne({ where: { guildId: message.guild?.id ?? '' } }) || { prefix: process.env.BOT_PREFIX };
        const prefixMention = new RegExp(`^<@!?${client.user?.id}> `);
        const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)?.[0] : res.prefix;
        if (message.content.startsWith(prefix)) {
            const [cmdName, ...cmdArgs] = message.content
                .slice(prefix?.length)
                .trim()
                .split(/\s+/);
            const command = client.commands.get(cmdName.toLowerCase()) || client.aliases.get(cmdName.toLowerCase());
            if (!command)
                return;
            if (!command.checkOwner(handler.options.owners ?? [], message.author))
                return message.channel.send('The bot can only be used by the bot owners.');
            if (!cooldowns.has(command.name))
                cooldowns.set(command.name, new discord_js_1.Collection());
            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown) * 1000;
            if (!timestamps?.has(message.author.id)) {
                timestamps?.set(message.author.id, now);
                setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
            }
            else {
                const expirationTime = timestamps?.get(message.author.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command. ${message.author}`);
                }
            }
            try {
                await command.run(client, message, cmdArgs, handler.util);
            }
            catch (error) {
                if (error instanceof a_djs_handler_1.PromptError)
                    return;
                console.error(error);
                message.channel.send(`An error occured while executing this command! Report this to the bot owner: \`${error}\``);
            }
        }
    }
}
exports.default = MessageEvent;
