"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const glob_1 = __importDefault(require("glob"));
const scaffoldDir = path_1.default.join(__dirname, '../res/scaffold');
const scaffoldName = 'basic';
/**
 * just copy a scaffold
 */
const initialize = () => {
    const whitelist = [
        './package.json',
        './package-lock.json',
        './node_modules/**/*',
    ];
    const files = glob_1.default.sync('./**/*', { ignore: whitelist, dot: false, nodir: true });
    console.log(files);
    if (files.length) {
        console.error('this directory is not empty!');
        console.error('(if you need, you can put only "package.json", "package-lock.json", and "node_modules")');
        return;
    }
    console.log(`copying the scaffold "${scaffoldName}..."`);
    const scaffold = path_1.default.join(scaffoldDir, scaffoldName);
    fs_extra_1.default.copySync(scaffold, '.');
    console.log('done!');
    console.log('------------');
    console.log('   siteelm server: run a server for developing');
    console.log('   siteelm make: generate a site');
    console.log('------------');
};
exports.default = initialize;
