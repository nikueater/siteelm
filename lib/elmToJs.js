"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const tmp_1 = __importDefault(require("tmp"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
/**
 * @param config Config
 * @returns a raw javascript code string
 */
exports.compileStaticElmWith = (config) => {
    const tmpFile = `${tmp_1.default.fileSync().name}.js`;
    const srcDir = config.elm.staticDir || '';
    const r = compileElmWith(config, srcDir, tmpFile);
    return r ? fs_1.default.readFileSync(tmpFile, 'utf-8') : '';
};
/**
 * @param config Config
 * @returns output file path (absolute in the site)
 */
exports.compileDynamicElmWith = (config) => {
    const fName = 'app.js';
    const outFile = path_1.default.join(config.build.distDir, fName);
    const srcDir = config.elm.dynamicDir || '';
    const r = compileElmWith(config, srcDir, outFile);
    return r ? `/${path_1.default.relative(config.build.distDir, outFile)}` : '';
};
/**
 * @param config Config
 * @param srcDir source directory
 * @param output a file name to output
 * @returns succeeded or not
 */
const compileElmWith = (config, srcDir, output) => {
    const globOption = { ignore: config.elm.exclude };
    const elmFiles = glob_1.default.sync(`${srcDir}/**/*.elm`, globOption);
    // considering "elm" and "npx elm"
    const command = (config.elm.command || 'elm').split(' ');
    const args = [
        command.slice(1),
        "make",
        elmFiles,
        config.elm.optimize ? "--optimize" : "",
        `--output=${output}`
    ]
        .flat()
        .filter((x) => x.length > 0);
    const r = child_process_1.spawnSync(command[0], args, { stdio: 'inherit' });
    return r.status === 0;
};
