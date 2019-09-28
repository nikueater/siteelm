"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const watch_1 = __importDefault(require("watch"));
const generator_1 = __importDefault(require("./generator"));
const server = (config) => {
    generator_1.default(config);
    // start a server
    const app = express_1.default();
    app.set('port', 3000);
    app.use(express_1.default.static(config.build.dist_dir));
    app.listen(app.get('port'), () => {
        console.log(`running server localhost:${app.get('port')}`);
        // watch directories
        const dirs = [
            config.build.contents.src_dir || '',
            config.build.static_elm.src_dir || '',
            config.build.dynamic_elm.src_dir || '',
            config.build.assets.src_dir
        ];
        // start watching
        dirs.forEach(x => {
            var initial = true;
            watch_1.default.watchTree(x, () => {
                if (!initial) {
                    generator_1.default(config);
                }
                else {
                    initial = false;
                }
            });
        });
    });
};
exports.default = server;
