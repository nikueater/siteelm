"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const config_1 = __importDefault(require("./config"));
const server_1 = __importDefault(require("./server"));
const generator_1 = __importDefault(require("./generator"));
const version = '0.1.0';
commander_1.default
    .version(version, '-v, --version');
// "siteelm make"
commander_1.default
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('make')
    .action((_) => {
    const option = {
        optimize: commander_1.default.optimize,
        withDraft: commander_1.default.draft
    };
    const config = config_1.default('./siteelm.yaml', option);
    generator_1.default(config);
});
// "siteelm server"
commander_1.default
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('server')
    .action((_) => {
    const option = {
        optimize: commander_1.default.optimize,
        withDraft: commander_1.default.draft
    };
    const config = config_1.default('./siteelm.yaml', option);
    server_1.default(config);
});
commander_1.default.parse(process.argv);
