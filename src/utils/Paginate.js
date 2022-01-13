"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = exports.Page = void 0;
const events_1 = require("events");
const discord_js_1 = require("discord.js");
class Page {
    constructor(name, content, buttons, index) {
        this.name = name;
        this.content = content;
        this.buttons = buttons;
        this.index = index;
    }
}
exports.Page = Page;
class Menu extends events_1.EventEmitter {
    constructor({ client, channel, userId, pages, ms = 180000 }) {
        super();
        this.pages = [];
        this.menu = null;
        this.collector = null;
        this.interaction = null;
        this.client = client;
        this.channel = channel;
        this.userId = userId;
        this.ms = ms;
        this.pages = [];
        if (!this.channel) {
            this.client.users.cache.get(this.userId)?.createDM();
        }
        let i = 0;
        pages.forEach(page => {
            this.pages.push(new Page(page.name, page.content, page.buttons, i));
            i++;
        });
        this.currentPage = this.pages[0];
        this.pageIndex = 0;
    }
    start() {
        this.emit('pageChange', this.currentPage);
        this.channel.send({ embeds: [this.currentPage.content] }).then(menu => {
            this.menu = menu;
            this.addButtons();
            this.awaitButtons();
        }).catch(error => {
            console.error(`${error.toString()} (whilst trying to send menu message) | You're probably missing 'SEND_MESSAGES' or 'EMBED_LINKS', needed for sending the menu message.`);
        });
    }
    stop() {
        if (this.collector) {
            this.collector.stop();
            this.disableButtons();
        }
    }
    delete() {
        if (this.collector)
            this.collector.stop();
        if (this.menu)
            this.menu.delete();
    }
    disableButtons() {
        if (this.menu) {
            const newRow = new discord_js_1.MessageActionRow(this.menu.components[0])
                .setComponents(this.menu.components[0].components.map(component => {
                return new discord_js_1.MessageButton(component)
                    .setDisabled(true);
            }));
            if (this.interaction) {
                this.interaction.update({ components: [newRow], content: 'This interactive embed has ended.' }).catch(console.error);
            }
            else {
                this.menu.edit({ components: [newRow] }).catch(error => {
                    console.log(`${error.toString()} (whilst trying to remove message reactions) | You're probably missing 'MANAGE_MESSAGES'needed for removing reactions when changing pages.`);
                });
            }
        }
    }
    setPage(page = 0) {
        this.emit('pageChange', this.pages[page]);
        this.pageIndex = page;
        this.currentPage = this.pages[this.pageIndex];
        if (this.interaction) {
            this.interaction.update({ embeds: [this.currentPage.content] }).catch(() => console.log(2));
        }
        else {
            this.menu?.edit({ embeds: [this.currentPage.content] });
        }
        this.collector?.stop();
        console.log('here 1');
        this.awaitButtons();
    }
    addButtons() {
        const row = new discord_js_1.MessageActionRow();
        for (const [name, button] of Object.entries(this.currentPage.buttons)) {
            row.addComponents([
                {
                    type: 'BUTTON',
                    style: button.style,
                    label: name,
                    customId: button.customId.toLowerCase().replace(/\s/g, ''),
                }
            ]);
        }
        if (this.interaction) {
            this.interaction.update({ components: [row] }).catch(() => console.log(3));
        }
        else {
            this.menu?.edit({ components: [row] }).catch(error => {
                console.log(`${error.toString()} (whilst trying to add reactions to message) | You're probably missing 'ADD_REACTIONS' needed for adding reactions to the page.`);
            });
        }
    }
    awaitButtons() {
        if (!this.collector || this.collector.ended === true)
            this.collector = this.menu?.createMessageComponentCollector({ componentType: 'BUTTON', filter: (i) => i.user.id !== this.menu?.client.user?.id, idle: this.ms }) ?? null;
        this.collector?.on('end', () => {
            if (this.collector?.ended) {
                console.log('here 2');
                this.disableButtons();
            }
        });
        this.collector.on('collect', (interaction) => {
            this.interaction = interaction;
            const buttonName = Object.values(this.currentPage.buttons).find(c => c.customId === interaction.component?.customId)
                ? interaction.component?.customId : null;
            if (interaction.user.id !== this.userId || !Object.values(this.currentPage.buttons).find(c => c.customId === buttonName)) {
                return interaction.reply({ content: 'This is not your interaction.', ephemeral: true }).catch(console.error);
            }
            const buttonPressed = Object.values(this.currentPage.buttons).find(c => c.customId === buttonName);
            if (buttonPressed) {
                if (typeof buttonPressed.value === 'function') {
                    return buttonPressed.value(interaction);
                }
                switch (buttonPressed.value) {
                    case 'first':
                        this.setPage(0);
                        break;
                    case 'last':
                        this.setPage(this.pages.length - 1);
                        break;
                    case 'previous':
                        if (this.pageIndex > 0) {
                            this.setPage(this.pageIndex - 1);
                        }
                        break;
                    case 'next':
                        if (this.pageIndex < this.pages.length - 1) {
                            this.setPage(this.pageIndex + 1);
                        }
                        break;
                    case 'stop':
                        this.stop();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    default:
                        this.setPage(this.pages.findIndex(p => p.name === Object.values(this.currentPage.buttons).find(c => c.customId === buttonName)?.customId));
                        break;
                }
            }
        });
    }
}
exports.Menu = Menu;
