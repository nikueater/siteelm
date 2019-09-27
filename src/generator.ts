import fs from 'fs'
import {JSDOM} from 'jsdom'
import P from 'parsimmon'
import yaml from 'js-yaml'
import {minify} from 'html-minifier'

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
        const p = parsePreamble(document[0])
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
 * @returns preamble interface data
 */
const parsePreamble = (p: string): Preamble => {
    const yml = yaml.safeLoad(p)
    const preamble = ((x: any): Preamble => x)(yml)
    if(typeof preamble.module !== 'string') {
        throw new InvalidPreambleError('no "module"')
    }
    if(typeof preamble.draft !== 'boolean') {
        preamble.draft = false
    }
    return preamble
}

export default generatePageFrom;
