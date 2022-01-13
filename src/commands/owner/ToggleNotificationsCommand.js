"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const config_json_1 = (0, tslib_1.__importDefault)(require("../../../config.json"));
const a_djs_handler_1 = require("a-djs-handler");
const fs_nextra_1 = require("fs-nextra");
class ToggleNotificationsCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'togglenotifications',
            aliases: ['notifications', 'tofflenotif'],
            description: 'Toggles notifications on or off.',
            category: 'owner',
            usage: 'togglenotifications',
            ownerOnly: true,
        });
    }
    async run(client, message) {
        const notif = !config_json_1.default.notifications.enabled;
        client.notifications.enabled = notif;
        client.notifications.init();
        config_json_1.default.notifications = {
            enabled: notif,
            channelId: message.channel.id,
            guildId: message.guild?.id ?? '',
        };
        await (0, fs_nextra_1.writeJson)('./config.json', config_json_1.default);
        await message.channel.send(`Notifications are now ${notif ? 'on' : 'off'} for this channel.`);
    }
}
exports.default = ToggleNotificationsCommand;
