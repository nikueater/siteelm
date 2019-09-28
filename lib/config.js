"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
/**
 * @param file config file
 * @param option additional options
 * @returns object
 */
const readConfigFrom = (file, option) => {
    const yml = fs_1.default.readFileSync(file, 'utf-8');
    var conf = js_yaml_1.default.safeLoad(yml);
    const opt = option || { optimize: false, withDraft: false };
    if (!conf.build.elm) {
        conf.build.elm = {};
    }
    if (fs_1.default.existsSync('./package.json') && !conf.build.elm.command) {
        conf.build.elm.command = 'npx elm';
    }
    if (typeof conf.build.elm.optimize !== 'boolean') {
        conf.build.elm.optimize = opt.optimize;
    }
    if (typeof conf.build.distDir !== 'string') {
        conf.build.dist_dir = './dist';
    }
    if (typeof conf.build.assets.src_dir !== 'string') {
        conf.build.assets.src_dir = './assets';
    }
    if (typeof conf.build.contents.draft !== 'boolean') {
        conf.build.contents.draft = opt.withDraft;
    }
    if (!conf.build.static_elm.src_dir || !conf.build.dynamic_elm.src_dir) {
        const elm_json = JSON.parse(fs_1.default.readFileSync('./elm.json', 'utf-8'));
        if (!conf.build.static_elm.src_dir) {
            conf.build.static_elm.src_dir = elm_json['source-directories'];
        }
        if (!conf.build.dynamic_elm.src_dir) {
            conf.build.dynamic_elm.src_dir = elm_json['source-directories'];
        }
    }
    return conf;
};
exports.default = readConfigFrom;
