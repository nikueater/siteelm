import fs from 'fs'
import yaml from 'js-yaml'

export interface Config {
    build: {
        dist_dir: string
        contents: {
            src_dir: string
            index: string
            exclude?: string[]
            draft?: boolean
        }
        assets: {
            src_dir: string
        }
        elm: {
            command?: string
            optimize?: boolean
        }
        static_elm: {
            src_dir: string
            exclude?: string[]
        }
        dynamic_elm: {
            src_dir: string
            exclude?: string[]
        }
    }
}


/**
 * @param file config file
 * @param option additional options
 * @returns object
 */
const readConfigFrom = (file: string, option?: {optimize: boolean, withDraft: boolean}): Config => {
    const yml = fs.readFileSync(file, 'utf-8')
    var conf = yaml.safeLoad(yml)
    const opt = option || {optimize: false, withDraft: false}
    if(!conf.build.elm) {
        conf.build.elm = {}
    }
    if(fs.existsSync('./package.json') && !conf.build.elm.command) {
        conf.build.elm.command = 'npx elm'
    }
    if(typeof conf.build.elm.optimize !== 'boolean') {
        conf.build.elm.optimize = opt.optimize
    }
    if(typeof conf.build.dist_dir !== 'string') {
        conf.build.dist_dir = './dist'
    }
    if(typeof conf.build.assets.src_dir !== 'string') {
        conf.build.assets.src_dir = './assets'
    }
    if(typeof conf.build.contents.draft !== 'boolean') {
        conf.build.contents.draft = opt.withDraft
    }
    if(!conf.build.static_elm.src_dir || !conf.build.dynamic_elm.src_dir) {
        const elm_json = JSON.parse(fs.readFileSync('./elm.json', 'utf-8'))
        if(!conf.build.static_elm.src_dir) {
            conf.build.static_elm.src_dir = elm_json['source-directories']
        }
        if(!conf.build.dynamic_elm.src_dir) {
            conf.build.dynamic_elm.src_dir = elm_json['source-directories']
        }
    }
    return conf
}

export default readConfigFrom;
