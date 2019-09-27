"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = __importDefault(require("glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const watch_1 = __importDefault(require("watch"));
const commander_1 = __importDefault(require("commander"));
const generator_1 = __importDefault(require("./generator"));
const config_1 = __importDefault(require("./config"));
const elmToJs_1 = require("./elmToJs");
const version = '0.1.0';
const config = config_1.default('./siteelm.yaml');
/**
 * create a path for saving
 * @param file path of a content file
 */
const savePathFor = (file) => {
    const p = path_1.default.parse(file);
    const dir = path_1.default.normalize(p.dir).split('/').slice(1).join('/');
    if (file === config.build.index) {
        return path_1.default.join(config.build.distDir, dir);
    }
    else {
        return path_1.default.join(config.build.distDir, dir, p.name);
    }
};
/**
 * convert a content file to a static html and save it
 * @param file path of a content file
 * @param elmcode a raw javascript code string
 * @param appjs path for the dynamic elm code
 */
const convertAndSave = (file, elmcode, appjs) => {
    console.log(`Building: ${file}`);
    const html = generator_1.default(file, elmcode, appjs, config.build.draft || false);
    if (html !== '') {
        const savePath = savePathFor(file);
        fs_extra_1.default.ensureDirSync(savePath);
        fs_extra_1.default.writeFileSync(path_1.default.join(savePath, 'index.html'), html);
    }
};
const main = () => {
    // 1. generate static pages
    const elm = elmToJs_1.compileStaticElmWith(config);
    const appjs = elmToJs_1.compileDynamicElmWith(config);
    const contentFiles = config.build.contents
        .map(x => glob_1.default.sync(x))
        .flat();
    contentFiles.forEach(x => convertAndSave(x, elm, appjs));
    // 2. copy static assets
    fs_extra_1.default.copySync(config.build.staticDir, config.build.distDir);
};
commander_1.default
    .version(version, '-v, --version');
// "siteelm make"
commander_1.default
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('make')
    .action((_) => {
    if (commander_1.default.optimize) {
        config.elm.optimize = commander_1.default.optimize;
    }
    if (commander_1.default.draft) {
        config.build.draft = commander_1.default.draft;
    }
    main();
});
// "siteelm server"
commander_1.default
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('server')
    .action((_) => {
    if (commander_1.default.optimize) {
        config.elm.optimize = commander_1.default.optimize;
    }
    if (commander_1.default.draft) {
        config.build.draft = commander_1.default.draft;
    }
    // watch directories
    const contentsDirs = config.build.contents
        .flatMap(x => glob_1.default.sync(x))
        .map(x => path_1.default.normalize(path_1.default.dirname(x)))
        .filter((x, _, xs) => !xs.includes(path_1.default.normalize(path_1.default.join(x, '..'))));
    const dirs = [
        contentsDirs,
        config.elm.staticDir || [],
        config.elm.dynamicDir || [],
        config.build.staticDir
    ]
        .flat();
    dirs.forEach(x => {
        var initial = true;
        watch_1.default.watchTree(x, () => {
            if (!initial) {
                main();
            }
            else {
                initial = false;
            }
        });
    });
    main();
    // start a server
    const app = express_1.default();
    app.set('port', 3000);
    app.use(express_1.default.static(config.build.distDir));
    app.listen(app.get('port'), () => console.log(`running server localhost:${app.get('port')}`));
});
commander_1.default.parse(process.argv);
