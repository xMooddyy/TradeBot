"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
let GuildSettings = class GuildSettings extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], GuildSettings.prototype, "guildId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Default)(process.env.PREFIX),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], GuildSettings.prototype, "prefix", void 0);
GuildSettings = (0, tslib_1.__decorate)([
    sequelize_typescript_1.Table
], GuildSettings);
exports.default = GuildSettings;
