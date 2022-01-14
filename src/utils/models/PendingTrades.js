"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
let PendingTrades = class PendingTrades extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    (0, tslib_1.__metadata)("design:type", Number)
], PendingTrades.prototype, "tradeId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    (0, tslib_1.__metadata)("design:type", String)
], PendingTrades.prototype, "userId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    (0, tslib_1.__metadata)("design:type", String)
], PendingTrades.prototype, "robloxUsername", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    (0, tslib_1.__metadata)("design:type", String)
], PendingTrades.prototype, "guildId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    (0, tslib_1.__metadata)("design:type", String)
], PendingTrades.prototype, "channelId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    (0, tslib_1.__metadata)("design:type", String)
], PendingTrades.prototype, "embed", void 0);
PendingTrades = (0, tslib_1.__decorate)([
    sequelize_typescript_1.Table
], PendingTrades);
exports.default = PendingTrades;
