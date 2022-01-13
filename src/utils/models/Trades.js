"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
let Trades = class Trades extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], Trades.prototype, "tradeId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    (0, tslib_1.__metadata)("design:type", Object)
], Trades.prototype, "trade", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], Trades.prototype, "guildId", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], Trades.prototype, "channelId", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], Trades.prototype, "messageId", void 0);
Trades = (0, tslib_1.__decorate)([
    sequelize_typescript_1.Table
], Trades);
exports.default = Trades;
