"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const a_djs_handler_1 = require("a-djs-handler");
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
        message.channel.send('work in progress');
    }
}
exports.default = SwitchAccountCommand;
