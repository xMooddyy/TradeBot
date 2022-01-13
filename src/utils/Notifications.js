"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = (0, tslib_1.__importDefault)(require("events"));
const Roblox_1 = (0, tslib_1.__importDefault)(require("./Roblox"));
class Notifications extends events_1.default {
    constructor(enabled) {
        super();
        this.interval = null;
        this.created = new Date();
        this.enabled = true;
        this.enabled = enabled ?? true;
    }
    async init() {
        if (this.enabled === false)
            return;
        const data = await Roblox_1.default.apis.tradesAPI.getTradesByStatusType({ tradeStatusType: 'Inbound' }).catch(console.error);
        if (!data)
            return;
        this.created = data.data.length ? new Date(data.data[0].created) : new Date();
        this.checkInterval();
    }
    async updateData() {
        if (this.enabled === false)
            return;
        const data = await Roblox_1.default.apis.tradesAPI.getTradesByStatusType({ tradeStatusType: 'Inbound' }).catch(console.error);
        if (!data || !data.data?.length)
            return;
        const packet = data.data.filter((c) => {
            if (new Date(c.created) > this.created) {
                this.created = new Date(c.created);
                return true;
            }
            return false;
        });
        if (packet.length > 0)
            this.emit('newTrade', packet);
        this.checkInterval();
    }
    clearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    checkInterval() {
        if (!this.interval)
            this.interval = setInterval(this.updateData.bind(this), 10000);
    }
}
exports.default = Notifications;
