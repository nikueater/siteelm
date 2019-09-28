"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const watch_1 = __importDefault(require("watch"));
const generator_1 = __importDefault(require("./generator"));
const server = (config) => {
    generator_1.default(config, { isServer: true });
    // 
    const ews = express_ws_1.default(express_1.default());
    const app = ews.app;
    app.set('port', 3000);
    app.use(express_1.default.static(config.build.dist_dir));
    app.ws('/', () => {
        console.log('auto reloader connected');
    });
    // start a server
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
        const wss = ews.getWss();
        dirs.forEach(x => {
            var initial = true;
            watch_1.default.watchTree(x, { interval: 1.5 }, () => {
                if (!initial) {
                    generator_1.default(config, { isServer: true });
                    wss.clients.forEach((c) => {
                        c.send(JSON.stringify({ reload: true }));
                    });
                }
                else {
                    initial = false;
                }
            });
        });
    });
};
exports.default = server;
