"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const scaffoldDir = path_1.default.join(__dirname, '../res/scaffold');
const scaffoldName = 'basic';
/**
 * just copy a scaffold
 */
const initialize = () => {
    if (fs_extra_1.default.readdirSync('.').length > 0) {
        console.error('this directory is not empty');
        return;
    }
    console.log(`copying the scaffold "${scaffoldName}"`);
    const scaffold = path_1.default.join(scaffoldDir, scaffoldName);
    fs_extra_1.default.copySync(scaffold, '.');
    console.log('done');
    console.log('\tsiteelm server: run a server for developing');
    console.log('\tsiteelm make: generate a site');
};
exports.default = initialize;
