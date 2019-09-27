import fs from 'fs'
import {JSDOM} from 'jsdom'
import P from 'parsimmon'
import yaml from 'js-yaml'
import path from 'path'
import {minify} from 'html-minifier'
import traverse from 'traverse'

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
 * @returns void
 */
const generatePageFrom = (source: string, elmcode: string, appjs: string, withDraft: boolean): string => {
    try {
        // create flags
        const document = parseDocument(fs.readFileSync(source, 'utf-8'))
        const p = parsePreamble(document[0], source)
        const flags = {
            preamble: JSON.stringify(p),
            body: document[1]
        }
        if(p.draft == true && !withDraft) {
            return ''
        }
        // generate a DOM
        const dom = new JSDOM('', {runScripts: 'outside-only'})
        const script = `var app = Elm.${p.module}.init({flags:${JSON.stringify(flags)}})`
        dom.window.eval(elmcode)
        dom.window.eval(script)
        const body = dom.window.document.body.innerHTML
        // formatting
        var ds = new JSDOM(body, {runScripts: 'outside-only'})
        const head = ds.window.document.querySelector('head')
        ds.window.document.querySelectorAll('style').forEach(x => {
                const div = x.parentNode
                if(head && div && div.parentNode) {
                    head.appendChild(x)
                    div.parentNode.removeChild(div)
                }
            })
        // add dynamic elm elements
        if(head && appjs !== '') {
            ds = embedDynamicComponents(ds, appjs)
        }
        // turn the DOM into string and save it
        return minify(ds.serialize(), {minifyCSS: true, minifyJS: true})
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
    const initialize = dom.window.document.createElement('script')
    initialize.textContent = 'window.app = {}'
    head.appendChild(initialize)
    var treateds: string[] = []
    dom.window.document
        .querySelectorAll('div[data-elm-module]').forEach(x => {
            const modName = x.getAttribute('data-elm-module') || ''
            if(treateds.includes(modName)) {
                return
            } else {
                treateds.push(modName)
            }
            const objName = modName.replace('.', '')
            const flagString = x.getAttribute('data-flags') || '{}'
            var flags = {}
            try {
                flags = JSON.parse(flagString)
            } catch {
                flags = {}
            }
            const s = `
                var ns = document.querySelectorAll('div[data-elm-module="${modName}"]')
                for(var i=0;i<ns.length;i++){
                    window.app.${objName} = Elm.${modName}.init({node:ns[i],flags:${JSON.stringify(flags)}})
                }

            `
            const script = dom.window.document.createElement('script')
            script.textContent = s
            dom.window.document.body.appendChild(script)
        })
    return dom
}

export default generatePageFrom;
