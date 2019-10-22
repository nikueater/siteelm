import fs from 'fs'
import {JSDOM, VirtualConsole} from 'jsdom'
import P from 'parsimmon'
import yaml from 'js-yaml'
import path from 'path'
import {minify} from 'html-minifier'
import traverse from 'traverse'
import {staticElmInitCode, dynamicElmInitCode, autoReloaderCode} from './snippet'

interface Preamble {
    module: string
    draft?: boolean
}

class ConvertError implements Error {
    public name = 'ConvertError'
    constructor(public message: string) {}
    toString():string {
        return `${this.name}: ${this.message}`
    }
}
class InvalidPreambleError extends ConvertError { name = 'Preamble' }

/**
 * @param source a file name for creating flags
 * @param elmcode a raw javascript code string
 * @param appjs the path for the dynamic elm code
 * @param withDraft flag for not ignoring drafts
 * @param autoReloader 
 * @returns void
 */
const jsToHtmlWith = (sourcePath: string, elmcode: string, appjsPath: string, withDraft: boolean, autoReloader: boolean): string => {
    try {
        // create flags
        const document = parseDocument(fs.readFileSync(sourcePath, 'utf-8'))
        const p = parsePreamble(document[0], sourcePath)
        const flags = {
            preamble: JSON.stringify(p),
            body: document[1]
        }
        if(p.draft == true && !withDraft) {
            return ''
        }
        // generate a DOM
        const vc = new VirtualConsole()
        vc.on('info', (x: string) => {
            console.log(`info: ${x}`)
        })
        vc.on('warn', (x: string) => {
            if(x.startsWith('Compiled in DEV mode.')) { return }
            console.log(`warn: ${x}`)
        })
        vc.on('error', (x: string) => {
            console.log(`error: ${x}`)
        })
        const dom = new JSDOM('', {runScripts: 'outside-only', virtualConsole: vc})
        dom.window.eval(elmcode)
        dom.window.eval(staticElmInitCode(p.module, flags))
        const body = unescapeScripts(dom).window.document.body.innerHTML
        
        // formatting
        var ds = new JSDOM(body, {runScripts: 'outside-only'})
        const head = ds.window.document.querySelector('head')
        if(ds.window.document.body.innerHTML === '') {
            return ''
        }
        if(head) {
            ds.window.document.querySelectorAll('style').forEach(x => {
                    const div = x.parentNode
                    if(div && div.parentNode) {
                        head.appendChild(x)
                        div.parentNode.removeChild(div)
                    }
                })
            // add dynamic elm elements
            if(appjsPath !== '') {
                ds = embedDynamicComponents(ds, appjsPath)
            }
        }

        // auto reloader
        if (autoReloader) {
            const s = ds.window.document.createElement('script')
            s.textContent = autoReloaderCode()
            ds.window.document.body.appendChild(s)
        }
        const html = `<!doctype html>\n${ds.serialize()}`
        // turn the DOM into string and save it
        return minify(html, {minifyCSS: true, minifyJS: true})
    } catch(e) {
        console.error('error:')
        console.error(e.toString())
    }
    return ''
}

/**
 * @param source a string which has a preamble wrapped with "---" and a free text  
 * @returns a preamble and a body
 */
const parseDocument = (source: string): string[] => { 
    const delimiter = P.string("---").skip(P.optWhitespace)
    var ls = ""
    const mbody = P.takeWhile(c => {
        const result = ls !== "\n---"
        ls = (ls + c).slice(-4)
        return result
    })
    const matter = delimiter.then(mbody).map(x => x.replace(/(---)$/, ''))
    const content = P.all.map(x => x.trim())
    const doc = P.seq(matter, content).parse(source)
    return 'value' in doc ? doc.value : []
}
    
/** 
 * @param p yaml format string
 * @param source path of the current source file
 * @returns preamble interface data
 */
const parsePreamble = (p: string, source: string): Preamble => {
    const yml = yaml.safeLoad(p)
    const preamble = ((x: any): Preamble => x)(yml)
    if(typeof preamble.module !== 'string') {
        throw new InvalidPreambleError('no "module"')
    }
    if(typeof preamble.draft !== 'boolean') {
        preamble.draft = false
    }
    // walk through all element to detect special values
    traverse(preamble).forEach(function(x) {
        switch(this.key) {
            case 'external':
                const dir = path.dirname(source)
                const file = x || ''
                const y = fs.readFileSync(path.normalize(path.join(dir, file)), 'utf-8')
                const value = yaml.safeLoad(y)
                if(this.parent) {
                    if(Object.keys(this.parent.node).length === 1) {
                        this.parent.update(value)
                    } else {
                        throw new InvalidPreambleError('"external" cannot have siblings')      
                    }
                } 
                break
        }
    })
    return preamble
}

/**
 * @param dom JSDOM
 * @param appjs path for a js file from elm
 */
const embedDynamicComponents = (dom: JSDOM, appjs: string): JSDOM => {
    const script = dom.window.document.createElement('script')
    const head = dom.window.document.querySelector('head')
    if(!head) {
        return dom
    }
    script.src = appjs
    head.appendChild(script)
    var treateds: string[] = []
    dom.window.document
        .querySelectorAll('div[data-elm-module]').forEach(x => {
            const modName = x.getAttribute('data-elm-module') || ''
            if(treateds.includes(modName)) {
                return
            } else {
                treateds.push(modName)
            }
            const flags = x.getAttribute('data-flags') || '{}'
            const script = dom.window.document.createElement('script')
            script.textContent = dynamicElmInitCode(modName, flags)
            dom.window.document.body.appendChild(script)
        })
    return dom
}

/**
 * @param dom 
 */
const unescapeScripts = (dom: JSDOM): JSDOM => {
    const customs =  
        dom.window.document.querySelectorAll('siteelm-custom[data-tag="script"]') || []

    customs.forEach((x) => {
        const parent = x.parentElement
        if(!parent) {
            return
        }
        const script = dom.window.document.createElement('script')
        const attrs = x.attributes
        script.textContent = x.textContent
        for(var i = 0; i < attrs.length; i++) {
            const attr = attrs.item(i)
            if(attr && attr.nodeValue && !attr.nodeName.startsWith('data-')) {
                script.setAttribute(attr.nodeName, attr.nodeValue)
            }
        }
        parent.insertBefore(script, x.nextSibling)
        parent.removeChild(x)
    })
    return dom
}


export default jsToHtmlWith
