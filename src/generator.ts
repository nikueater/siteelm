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
 * @param withDraft flag for not ignoring drafts
 * @returns void
 */
const generatePageFrom = (source: string, elmcode: string, withDraft: boolean): string => {
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
        const ds = new JSDOM(body, {runScripts: 'outside-only'})
        const head = ds.window.document.querySelector('head')
        ds.window.document.querySelectorAll('style').forEach(x => {
                const div = x.parentNode
                if(head && div && div.parentNode) {
                    head.appendChild(x)
                    div.parentNode.removeChild(div)
                }
            })
        // turn the DOM into string and save it
        return minify(ds.serialize(), {minifyCSS: true})
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

export default generatePageFrom;
