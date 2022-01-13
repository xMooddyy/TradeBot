"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const a_djs_handler_1 = require("a-djs-handler");
class TestCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'test',
            description: 'This is a test command',
            ownerOnly: true,
            category: 'owner',
            accessableby: 'Bot owner',
            aliases: ['t']
        });
    }
    async run(client, message) {
        message.channel.send('This is a test command.');
    }
}
exports.default = TestCommand;
