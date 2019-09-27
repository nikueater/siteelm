"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const minumum = {
    elm: {
        exclude: ['./Util/**/*.elm']
    },
    build: {
        contents: ['./contents/**/*.md'],
        index: './contents/index.md',
        distDir: './dist',
        staticDir: './static'
    },
};
/**
 * @param file config file
 * @returns object
 */
const readConfigFrom = (file) => {
    const yml = fs_1.default.readFileSync(file, 'utf-8');
    var conf = js_yaml_1.default.safeLoad(yml);
    if (fs_1.default.existsSync('./package.json') && !conf.elm.command) {
        conf.elm.command = 'npx elm';
    }
    if (typeof conf.elm.optimize !== 'boolean') {
        conf.elm.optimize = false;
    }
    if (typeof conf.build.distDir !== 'string') {
        conf.build.distDir = './dist';
    }
    if (typeof conf.build.staticDir !== 'string') {
        conf.build.staticDir = './static';
    }
    if (typeof conf.build.draft !== 'boolean') {
        conf.build.draft = false;
    }
    if (!conf.elm.staticDir || !conf.elm.dynamicDir) {
        const elmJson = JSON.parse(fs_1.default.readFileSync('./elm.json', 'utf-8'));
        if (!conf.elm.staticDir) {
            conf.elm.staticDir = elmJson['source-directories'];
        }
        if (!conf.elm.dynamicDir) {
            conf.elm.dynamicDir = elmJson['source-directories'];
        }
    }
    return conf;
};
exports.default = readConfigFrom;
