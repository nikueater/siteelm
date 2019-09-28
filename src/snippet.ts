import fs from 'fs'




export const staticElmInitCode = (moduleName: string, flags: object): string => {
    return `var app = Elm.${moduleName}.init({flags:${JSON.stringify(flags)}});
    `
}

export const dynamicElmInitCode = (moduleName: string, flags: object): string => {
    const objName = moduleName.replace('.', '')
    return `
        window.app = window.app || {}
        var ns = document.querySelectorAll('div[data-elm-module="${moduleName}"]')
        for(var i=0;i<ns.length;i++){
            var name = '${objName}' + (i > 0 ? ('_' + i) : '')
            window.app[name] = Elm.${moduleName}.init({node:ns[i],flags:${JSON.stringify(flags)}})
        }
    `
}

export const autoReloaderCode = ():string => {
    return `(function(){
        var host = (window.location.origin).replace(/^http/, 'ws');
        var ws = new WebSocket(host);
        ws.onmessage = function(e) {
            if(JSON.parse(e.data).reload) {
                window.location.reload()
            }
        }
    }())`
}
