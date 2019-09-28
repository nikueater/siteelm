"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const jsdom_1 = require("jsdom");
const parsimmon_1 = __importDefault(require("parsimmon"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const html_minifier_1 = require("html-minifier");
const traverse_1 = __importDefault(require("traverse"));
const snippet_1 = require("./snippet");
class ConvertError {
    constructor(message) {
        this.message = message;
        this.name = 'ConvertError';
    }
    toString() {
        return `${this.name}: ${this.message}`;
    }
}
class InvalidPreambleError extends ConvertError {
    constructor() {
        super(...arguments);
        this.name = 'Preamble';
    }
}
/**
 * @param source a file name for creating flags
 * @param elmcode a raw javascript code string
 * @param appjs the path for the dynamic elm code
 * @param withDraft flag for not ignoring drafts
 * @param autoReloader
 * @returns void
 */
const jsToHtmlWith = (sourcePath, elmcode, appjsPath, withDraft, autoReloader) => {
    try {
        // create flags
        const document = parseDocument(fs_1.default.readFileSync(sourcePath, 'utf-8'));
        const p = parsePreamble(document[0], sourcePath);
        const flags = {
            preamble: JSON.stringify(p),
            body: document[1]
        };
        if (p.draft == true && !withDraft) {
            return '';
        }
        // generate a DOM
        const dom = new jsdom_1.JSDOM('', { runScripts: 'outside-only' });
        dom.window.eval(elmcode);
        dom.window.eval(snippet_1.staticElmInitCode(p.module, flags));
        const body = dom.window.document.body.innerHTML;
        // formatting
        var ds = new jsdom_1.JSDOM(body, { runScripts: 'outside-only' });
        const head = ds.window.document.querySelector('head');
        if (head) {
            ds.window.document.querySelectorAll('style').forEach(x => {
                const div = x.parentNode;
                if (div && div.parentNode) {
                    head.appendChild(x);
                    div.parentNode.removeChild(div);
                }
            });
            // add dynamic elm elements
            if (appjsPath !== '') {
                ds = embedDynamicComponents(ds, appjsPath);
            }
        }
        // auto reloader
        if (autoReloader) {
            const s = ds.window.document.createElement('script');
            s.textContent = snippet_1.autoReloaderCode();
            ds.window.document.body.appendChild(s);
        }
        // turn the DOM into string and save it
        return html_minifier_1.minify(ds.serialize(), { minifyCSS: true, minifyJS: true });
    }
    catch (e) {
        console.error('error:');
        console.error(e.toString());
    }
    return '';
};
/**
 * @param source a string which has a preamble wrapped with "---" and a free text
 * @returns a preamble and a body
 */
const parseDocument = (source) => {
    const delimiter = parsimmon_1.default.string("---").skip(parsimmon_1.default.optWhitespace);
    var ls = "";
    const mbody = parsimmon_1.default.takeWhile(c => {
        const result = ls !== "\n---";
        ls = (ls + c).slice(-4);
        return result;
    });
    const matter = delimiter.then(mbody).map(x => x.replace(/(---)$/, ''));
    const content = parsimmon_1.default.all.map(x => x.trim());
    const doc = parsimmon_1.default.seq(matter, content).parse(source);
    return 'value' in doc ? doc.value : [];
};
/**
 * @param p yaml format string
 * @param source path of the current source file
 * @returns preamble interface data
 */
const parsePreamble = (p, source) => {
    const yml = js_yaml_1.default.safeLoad(p);
    const preamble = ((x) => x)(yml);
    if (typeof preamble.module !== 'string') {
        throw new InvalidPreambleError('no "module"');
    }
    if (typeof preamble.draft !== 'boolean') {
        preamble.draft = false;
    }
    // walk through all element to detect special values
    traverse_1.default(preamble).forEach(function (x) {
        switch (this.key) {
            case 'external':
                const dir = path_1.default.dirname(source);
                const file = x || '';
                const y = fs_1.default.readFileSync(path_1.default.normalize(path_1.default.join(dir, file)), 'utf-8');
                const value = js_yaml_1.default.safeLoad(y);
                if (this.parent) {
                    if (Object.keys(this.parent.node).length === 1) {
                        this.parent.update(value);
                    }
                    else {
                        throw new InvalidPreambleError('"external" cannot have siblings');
                    }
                }
                break;
        }
    });
    return preamble;
};
/**
 * @param dom JSDOM
 * @param appjs path for a js file from elm
 */
const embedDynamicComponents = (dom, appjs) => {
    const script = dom.window.document.createElement('script');
    const head = dom.window.document.querySelector('head');
    if (!head) {
        return dom;
    }
    script.src = appjs;
    head.appendChild(script);
    const initialize = dom.window.document.createElement('script');
    initialize.textContent = 'window.app = {}';
    head.appendChild(initialize);
    var treateds = [];
    dom.window.document
        .querySelectorAll('div[data-elm-module]').forEach(x => {
        const modName = x.getAttribute('data-elm-module') || '';
        if (treateds.includes(modName)) {
            return;
        }
        else {
            treateds.push(modName);
        }
        const flagString = x.getAttribute('data-flags') || '{}';
        var flags = {};
        try {
            flags = JSON.parse(flagString);
        }
        catch { }
        const script = dom.window.document.createElement('script');
        script.textContent = snippet_1.dynamicElmInitCode(modName, flags);
        dom.window.document.body.appendChild(script);
    });
    return dom;
};
exports.default = jsToHtmlWith;
