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
const jstohtml_1 = __importDefault(require("./jstohtml"));
const config_1 = __importDefault(require("./config"));
const elmtojs_1 = require("./elmtojs");
const version = '0.1.0';
const config = config_1.default('./siteelm.yaml');
/**
 * create a path for saving
 * @param file path of a content file
 */
const savePathFor = (file) => {
    if (file === config.build.contents.index) {
        return path_1.default.join(config.build.dist_dir, 'index.html');
    }
    else {
        const r = path_1.default.relative(config.build.contents.src_dir, file);
        const p = path_1.default.parse(r);
        return path_1.default.join(config.build.dist_dir, p.dir, p.name, 'index.html');
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
    const html = jstohtml_1.default(file, elmcode, appjs, config.build.contents.draft || false);
    if (html !== '') {
        const savePath = savePathFor(file);
        fs_extra_1.default.ensureFileSync(savePath);
        fs_extra_1.default.writeFileSync(savePath, html);
    }
};
const main = () => {
    // 1. generate static pages
    const elm = elmtojs_1.compileStaticElmWith(config);
    const appjs = elmtojs_1.compileDynamicElmWith(config);
    const contentFiles = glob_1.default.sync(`${config.build.contents.src_dir}/**/*`, { ignore: config.build.contents.exclude || [], nodir: true });
    contentFiles.forEach(x => convertAndSave(x, elm, appjs));
    // 2. copy static assets
    fs_extra_1.default.copySync(config.build.assets.src_dir, config.build.dist_dir);
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
        config.build.elm.optimize = commander_1.default.optimize;
    }
    if (commander_1.default.draft) {
        config.build.contents.draft = commander_1.default.draft;
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
        config.build.elm.optimize = commander_1.default.optimize;
    }
    if (commander_1.default.draft) {
        config.build.contents.draft = commander_1.default.draft;
    }
    // watch directories
    const contentsDirs = glob_1.default.sync(`${config.build.contents.src_dir}/**/*`, { ignore: config.build.contents.exclude || [] })
        .map(x => path_1.default.normalize(path_1.default.dirname(x)))
        .filter((x, _, xs) => !xs.includes(path_1.default.normalize(path_1.default.join(x, '..'))));
    const dirs = [
        contentsDirs,
        config.build.static_elm.src_dir || '',
        config.build.dynamic_elm.src_dir || '',
        config.build.assets.src_dir
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
    app.use(express_1.default.static(config.build.dist_dir));
    app.listen(app.get('port'), () => console.log(`running server localhost:${app.get('port')}`));
});
commander_1.default.parse(process.argv);
