import glob from 'glob'
import fs from 'fs'
import tmp from 'tmp'
import {spawnSync} from 'child_process'
import path from 'path'
import {Config} from '../config'

/**
 * @param config Config
 * @returns a raw javascript code string
 */
export const compileStaticElmWith = (config: Config): string => {
    const tmpFile = tmp.fileSync({postfix: '.js'})
    const srcDir = config.build.static_elm.src_dir || ''
    const exclude = config.build.static_elm.exclude || []
    const r = compileElmWith(config, srcDir, exclude, tmpFile.name)
    const code =  r ? fs.readFileSync(tmpFile.name, 'utf-8') : ''
    tmpFile.removeCallback()
    return code
}

/**
 * @param config Config
 * @returns output file path (absolute in the site)
 */
export const compileDynamicElmWith = (config: Config): string => {
    const fName = 'app.js'
    const outFile = path.join(config.build.dist_dir, fName)
    const srcDir = config.build.dynamic_elm.src_dir || ''
    const exclude = config.build.dynamic_elm.exclude || []
    const r = compileElmWith(config, srcDir, exclude, outFile)
    return r ? `/${path.relative(config.build.dist_dir, outFile)}` : ''
}

/**
 * @param config Config
 * @param srcDir source directory
 * @param exclude glob patterns to ignore
 * @param output a file name to output
 * @returns succeeded or not
 */
const compileElmWith = (config: Config, srcDir: string, exclude: string[], output: string): boolean => {
    const globOption = {ignore: exclude}
    const elmFiles = 
            glob.sync(`${srcDir}/**/*.elm`, globOption)
    if(elmFiles.length === 0) {
        return true
    }

    // considering "elm" and "npx elm"
    const command = (config.build.elm.command || 'elm').split(' ')
    const args = [ 
        command.slice(1),
        ["make"], 
        elmFiles,
        [config.build.elm.optimize ? "--optimize" : ""],
        [`--output=${output}`]
        ]
        .flat()
        .filter((x: string) => x.length > 0)
    const r = spawnSync(command[0], args, {stdio: 'inherit'})
    return r.status === 0 
}

