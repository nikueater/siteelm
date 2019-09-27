import glob from 'glob'
import fs from 'fs'
import tmp from 'tmp'
import {spawnSync} from 'child_process'
import path from 'path'
import {Config} from './config'

/**
 * @param config Config
 * @returns a raw javascript code string
 */
export const compileStaticElmWith = (config: Config): string => {
    const tmpFile = `${tmp.fileSync().name}.js`
    const srcDir = config.elm.staticDir || ''
    const r = compileElmWith(config, srcDir, tmpFile)
    return r ? fs.readFileSync(tmpFile, 'utf-8') : ''
}

/**
 * @param config Config
 * @returns output file path (absolute in the site)
 */
export const compileDynamicElmWith = (config: Config): string => {
    const fName = 'app.js'
    const outFile = path.join(config.build.distDir, fName)
    const srcDir = config.elm.dynamicDir || ''
    const r = compileElmWith(config, srcDir, outFile)
    return r ? `/${path.relative(config.build.distDir, outFile)}` : ''
}

/**
 * @param config Config
 * @param srcDir source directory
 * @param output a file name to output
 * @returns succeeded or not
 */
const compileElmWith = (config: Config, srcDir: string, output: string): boolean => {
    const globOption = {ignore: config.elm.exclude}
    const elmFiles = 
            glob.sync(`${srcDir}/**/*.elm`, globOption)

    // considering "elm" and "npx elm"
    const command = (config.elm.command || 'elm').split(' ')
    const args = [ 
        command.slice(1),
        "make", 
        elmFiles,
        config.elm.optimize ? "--optimize" : "",
        `--output=${output}`
        ]
        .flat()
        .filter((x: string) => x.length > 0)
    const r = spawnSync(command[0], args, {stdio: 'inherit'})
    return r.status === 0 
}

