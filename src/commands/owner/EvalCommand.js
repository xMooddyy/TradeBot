"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const a_djs_handler_1 = require("a-djs-handler");
const util_1 = require("util");
const sourcebin_1 = (0, tslib_1.__importDefault)(require("sourcebin"));
const yargs_1 = (0, tslib_1.__importDefault)(require("yargs"));
class EvalCommand extends a_djs_handler_1.BaseCommand {
    constructor() {
        super({
            name: 'eval',
            description: 'Execute a given piece of code.',
            category: 'owner',
            aliases: ['ev'],
            usage: 'eval [Code]',
            accessableby: 'Bot owner',
            examples: ['eval console.log(\'this is supposed to run\')'],
            ownerOnly: true
        });
    }
    async run(client, message, args) {
        const parsed = await (0, yargs_1.default)(args).option('async', {
            alias: 'a',
            description: 'Whether it should be async.',
            type: 'boolean'
        }).option('mode', {
            alias: 'm',
            type: 'number',
            description: 'Depth.'
        }).parse();
        try {
            let toEval;
            let evaluated;
            const hrStart = process.hrtime();
            let mode = 0;
            if (parsed.async || parsed.a) {
                toEval = parsed._.join(' ');
                if (parsed.mode || parsed.m)
                    mode = parsed.mode;
                evaluated = (0, util_1.inspect)((await eval(`(async () => {\n${toEval}\n})();`)), { depth: mode });
            }
            else {
                toEval = parsed._.join(' ');
                if (parsed.mode || parsed.m)
                    mode = parsed.mode;
                evaluated = (0, util_1.inspect)(eval(toEval), { depth: mode });
            }
            const hrDiff = process.hrtime(hrStart);
            if (!toEval)
                return message.channel.send('Error while evaluating: `air`');
            if (evaluated && evaluated.toString().length <= 1024) {
                message.channel.send(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.\`\`\`ts\n${evaluated}\`\`\``);
            }
            else if (evaluated && evaluated.toString().length > 1024) {
                sourcebin_1.default.create([{
                        name: 'Eval output',
                        content: evaluated.toString(),
                        language: 'typescript',
                    }]).then(obj => {
                    message.channel.send(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.\n${obj.short}`);
                });
            }
        }
        catch (e) {
            console.error(e);
            await message.channel.send(`Error while evaluating: \`${e}\``);
        }
    }
}
exports.default = EvalCommand;
