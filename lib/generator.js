"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const jstohtml_1 = __importDefault(require("./jstohtml"));
const elmtojs_1 = require("./elmtojs");
/**
 * main function for generating the site
 * @param config
 * @param isServer
 */
const generateAll = (config, option) => {
    // 1. generate static pages
    const elm = elmtojs_1.compileStaticElmWith(config);
    const appjs = elmtojs_1.compileDynamicElmWith(config);
    const contentFiles = glob_1.default.sync(`${config.build.contents.src_dir}/**/*`, { ignore: config.build.contents.exclude || [], nodir: true });
    const autoReload = (option || {}).isServer || false;
    contentFiles.forEach(x => convertAndSave(x, config, elm, appjs, autoReload));
    // 2. copy static assets
    fs_extra_1.default.copySync(config.build.assets.src_dir, config.build.dist_dir);
};
/**
 * create a path for saving
 * @param file path of a content file
 * @param config
 */
const savePathFor = (file, config) => {
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
 * @param config
 * @param elmcode a raw javascript code string
 * @param appjs path for the dynamic elm code
 * @param autoReloader enable auto reloading
 */
const convertAndSave = (file, config, elmcode, appjs, autoReloader) => {
    console.log(`Building: ${file}`);
    const draft = config.build.contents.draft || false;
    const html = jstohtml_1.default(file, elmcode, appjs, draft, autoReloader);
    if (html !== '') {
        const savePath = savePathFor(file, config);
        fs_extra_1.default.ensureFileSync(savePath);
        fs_extra_1.default.writeFileSync(savePath, html);
    }
};
exports.default = generateAll;
