import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import jsToHtmlWith from './generator/jstohtml'
import {Config} from './config'
import {compileStaticElmWith, compileDynamicElmWith} from './generator/elmtojs'

class Cache {
    staticCode: string = ""
    dynamicCode: string = ""
    autoReload: boolean = false
    option?: {isServer?: boolean}
    constructor(staticCode: string, dynamicCode: string, autoReload: boolean, option?: {isServer?: boolean} ) {
        this.staticCode = staticCode
        this.dynamicCode = dynamicCode
        this.autoReload = autoReload
        this.option = option
    }
}
var cache = new Cache("", "", false)


/**
 * main function for generating the site
 * @param config
 * @param isServer
 */ 
const generateAll = async (config: Config, option?: {isServer?: boolean}): Promise<boolean> => {
    console.log(`START: ${(new Date).toISOString()}`)
    // 1. generate static pages
    const elm = await compileStaticElmWith(config)
    const appjs = await compileDynamicElmWith(config)
    const contentFiles = 
        glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || [], nodir: true})
    const autoReload = (option || {}).isServer || false
    var result: {ok: string[], ng: string[]} = {ok: [], ng: []}
    contentFiles.forEach(x => {
        const r = convertAndSave(x, config, elm, appjs, autoReload)
        if (r) {
            result.ok.push(x)
        } else {
            result.ng.push(x)
        }
    })

    // 3. show result
    console.log('RESULT:')
    console.log(`  OK: ${result.ok.length}`)
    result.ng.forEach((x, i) => {
        console.log(`  NG(${i+1}): ${x}`)
    })
    
    // cache
    cache = new Cache(elm, appjs, autoReload, option)

    return (result.ok.length > 0 && result.ng.length === 0)
}

/**
 * main function for generating the site
 * @param config
 */
const copyAssets = (config: Config) => {
    fs.copySync(config.build.assets.src_dir, config.build.dist_dir)
}

/**
 * using the cache, convert a content file to a static html and save it 
 * @param file path of a content file
 * @param config
 */ 
const convertOnlyContentFiles = (config: Config): void => {
    if(!cache.staticCode) {
        console.log("Build All")
        generateAll(config, cache.option)
    } else {
        var result: {ok: string[], ng: string[]} = {ok: [], ng: []}
        const contentFiles = 
            glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || [], nodir: true})
        contentFiles.forEach(x => {
            const r = convertAndSave(x, config, cache.staticCode, cache.dynamicCode, cache.autoReload)
            if (r) {
                result.ok.push(x)
            } else {
                result.ng.push(x)
            }
        })
        // 3. show result
        console.log('RESULT:')
        console.log(`  OK: ${result.ok.length}`)
        result.ng.forEach((x, i) => {
            console.log(`  NG(${i+1}): ${x}`)
        })
    }
}


/**
 * create a path for saving
 * @param file path of a content file
 * @param config
 */
const savePathFor = (file: string, config: Config): string => {
    if (file === config.build.contents.index) {
        return path.join(config.build.dist_dir, 'index.html')
    } else {
        const r = path.relative(config.build.contents.src_dir, file) 
        const p = path.parse(r)
        return path.join(config.build.dist_dir, p.dir, p.name, 'index.html')
    }
}

/**
 * convert a content file to a static html and save it 
 * @param file path of a content file
 * @param config
 * @param elmcode a raw javascript code string
 * @param appjs path for the dynamic elm code
 * @param autoReloader enable auto reloading
 */ 
const convertAndSave = (file: string, config: Config, elmcode: string, appjs: string, autoReloader: boolean): boolean => {
    console.log(`> ${file}`)
    const savePath = savePathFor(file, config)
    const draft = config.build.contents.draft || false
    const html = jsToHtmlWith(file, config.build.contents.src_dir, elmcode, appjs, draft, autoReloader, config.build.contents.exclude || [])
    if(html !== '') {
        // console.log(`< ${savePath}`)
        fs.ensureFileSync(savePath)
        fs.writeFileSync(savePath, html)
        return true
    } else {
        console.log('error: check if the preamble is wrong form or head and body output nothing.')
        console.log('ERROR: Failed to convert!')
        return false
    }
}

export {generateAll as default, convertOnlyContentFiles, copyAssets}
