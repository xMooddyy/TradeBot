"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const a_djs_handler_1 = require("a-djs-handler");
const discord_js_1 = require("discord.js");
const config_json_1 = require("../config.json");
const Database_1 = (0, tslib_1.__importDefault)(require("./utils/Database"));
const async_queue_1 = require("@sapphire/async-queue");
require("./utils/string.extensions");
require("dotenv/config");
const winston_1 = require("winston");
const client = new a_djs_handler_1.MoodyClient({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL']
});
const handler = new a_djs_handler_1.Handler(client, {
    token: process.env.TOKEN,
    commandsPath: path_1.default.join(__dirname, '/commands'),
    eventsPath: path_1.default.join(__dirname, '/events'),
    prefix: process.env.BOT_PREFIX,
    owners: config_json_1.allowedUsers,
    mongooseURL: process.env.MONGO_URL
});
client.queue = new async_queue_1.AsyncQueue();
client.userTextChannels = [];
client.logger = (0, winston_1.createLogger)({
    transports: [new winston_1.transports.Console()],
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'MM-DD-YYYY HH:mm:ss'
    }), winston_1.format.colorize(), winston_1.format.printf(info => `[${info.timestamp}] ${info.level.toProperCase()}: ${info.message}`)),
});
(async () => {
    await Database_1.default.authenticate().then(() => client.logger.info('Connected to DB.'));
    await Database_1.default.sync();
    await handler.start();
})();
