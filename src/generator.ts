import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import jsToHtmlWith from './generator/jstohtml'
import {Config} from './config'
import {compileStaticElmWith, compileDynamicElmWith} from './generator/elmtojs'

/**
 * main function for generating the site
 * @param config
 * @param isServer
 */ 
const generateAll = async (config: Config, option?: {isServer?: boolean}) => {
    console.log(`START: ${(new Date).toISOString()}`)
    // 1. generate static pages
    const elm = await compileStaticElmWith(config)
    const appjs = await compileDynamicElmWith(config)
    const contentFiles = 
        glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || [], nodir: true})
    const autoReload = (option || {}).isServer || false
    contentFiles.forEach(x => convertAndSave(x, config, elm, appjs, autoReload))
    // 2. copy static assets
    fs.copySync(config.build.assets.src_dir, config.build.dist_dir)
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
const convertAndSave = (file: string, config: Config, elmcode: string, appjs: string, autoReloader: boolean): void => {
    console.log('--------------------------------')
    console.log(`BEGIN: ${file}`)
    const savePath = savePathFor(file, config)
    const draft = config.build.contents.draft || false
    const html = jsToHtmlWith(file, elmcode, appjs, draft, autoReloader)
    if(html !== '') {
        console.log(`SAVE AS: ${savePath}`)
        fs.ensureFileSync(savePath)
        fs.writeFileSync(savePath, html)
    } else {
        console.log('error: check the preamble is correct form.')
        console.log('ERROR: Failed to convert!')
    }
}

export default generateAll
