"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const config_json_1 = require("../config.json");
const app = require('express')();
const Database_1 = (0, tslib_1.__importDefault)(require("./utils/Database"));
require("./utils/string.extensions");
require("dotenv/config");
const client = new a_djs_handler_1.MoodyClient({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL']
});
const handler = new a_djs_handler_1.Handler(client, {
    token: process.env.TOKEN,
    commandsPath: path_1.default.join(__dirname, '/commands'),
    eventsPath: path_1.default.join(__dirname, '/events'),
    prefix: process.env.BOT_PREFIX,
    owners: config_json_1.allowedUsers
});

app.get('/', (req, res) => {
	res.status(200).send('Hi');
});

(async () => {
    await Database_1.default.authenticate().then(() => console.log('Connected to DB.'));
    await Database_1.default.sync();
    await handler.start();
		await app.listen(8080);
})();
