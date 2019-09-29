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
    const tmpFile = tmp_1.default.fileSync({ postfix: '.js' });
    const srcDir = config.build.static_elm.src_dir || '';
    const exclude = config.build.static_elm.exclude || [];
    const r = compileElmWith(config, srcDir, exclude, tmpFile.name);
    const code = r ? fs_1.default.readFileSync(tmpFile.name, 'utf-8') : '';
    tmpFile.removeCallback();
    return code;
};
/**
 * @param config Config
 * @returns output file path (absolute in the site)
 */
exports.compileDynamicElmWith = (config) => {
    const fName = 'app.js';
    const outFile = path_1.default.join(config.build.dist_dir, fName);
    const srcDir = config.build.dynamic_elm.src_dir || '';
    const exclude = config.build.dynamic_elm.exclude || [];
    const r = compileElmWith(config, srcDir, exclude, outFile);
    return r ? `/${path_1.default.relative(config.build.dist_dir, outFile)}` : '';
};
/**
 * @param config Config
 * @param srcDir source directory
 * @param exclude glob patterns to ignore
 * @param output a file name to output
 * @returns succeeded or not
 */
const compileElmWith = (config, srcDir, exclude, output) => {
    const globOption = { ignore: exclude };
    const elmFiles = glob_1.default.sync(`${srcDir}/**/*.elm`, globOption);
    if (elmFiles.length === 0) {
        return true;
    }
    // considering "elm" and "npx elm"
    const command = (config.build.elm.command || 'elm').split(' ');
    const args = [
        command.slice(1),
        ["make"],
        elmFiles,
        [config.build.elm.optimize ? "--optimize" : ""],
        [`--output=${output}`]
    ]
        .flat()
        .filter((x) => x.length > 0);
    const r = child_process_1.spawnSync(command[0], args, { stdio: 'inherit' });
    return r.status === 0;
};
