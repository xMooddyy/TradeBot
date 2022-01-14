"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = (0, tslib_1.__importDefault)(require("events"));
const promises_1 = require("node:timers/promises");
class Notifications extends events_1.default {
    constructor(roblox, client, enabled) {
        super();
        this.roblox = roblox;
        this.client = client;
        this.interval = null;
        this.created = new Date();
        this.enabled = true;
        this.enabled = enabled ?? true;
    }
    async init() {
        await this.client.queue.wait();
        try {
            if (this.enabled === false)
                return;
            const data = await this.roblox.apis.tradesAPI.getTradesByStatusType({ tradeStatusType: 'Inbound' }).catch(() => null);
            if (!data)
                return;
            await (0, promises_1.setInterval)(2000);
            this.created = data.data.length ? new Date(data.data[0].created) : new Date();
        }
        finally {
            this.client.queue.shift();
        }
        this.checkInterval();
    }
    async updateData() {
        await this.client.queue.wait();
        try {
            if (this.enabled === false)
                return;
            const data = await this.roblox.apis.tradesAPI.getTradesByStatusType({ tradeStatusType: 'Inbound' }).catch(() => null);
            if (!data || !data.data.length)
                return;
            const packet = data.data.filter((c) => {
                if (new Date(c.created) > this.created) {
                    this.created = new Date(c.created);
                    return true;
                }
                return false;
            });
            await (0, promises_1.setInterval)(2000);
            if (packet.length > 0)
                this.emit('newTrade', packet);
        }
        finally {
            this.client.queue.shift();
        }
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
