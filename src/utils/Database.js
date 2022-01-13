"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
exports.default = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite',
    username: 'root',
    password: '',
    models: [path_1.default.join(__dirname, '/models')],
    logging: false,
});
