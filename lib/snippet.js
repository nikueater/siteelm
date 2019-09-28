"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticElmInitCode = (moduleName, flags) => {
    return `var app = Elm.${moduleName}.init({flags:${JSON.stringify(flags)}});
    `;
};
exports.dynamicElmInitCode = (moduleName, flags) => {
    const objName = moduleName.replace('.', '');
    return `
        window.app = window.app || {}
        var ns = document.querySelectorAll('div[data-elm-module="${moduleName}"]')
        for(var i=0;i<ns.length;i++){
            var name = '${objName}' + (i > 0 ? ('_' + i) : '')
            window.app[name] = Elm.${moduleName}.init({node:ns[i],flags:${flags}})
        }
    `;
};
exports.autoReloaderCode = () => {
    return `(function(){
        var host = (window.location.origin).replace(/^http/, 'ws');
        var ws = new WebSocket(host);
        ws.onmessage = function(e) {
            if(JSON.parse(e.data).reload) {
                window.location.reload()
            }
        }
    }())`;
};
