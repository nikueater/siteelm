import glob from 'glob'
import fs from 'fs'
import tmp from 'tmp'
import {spawn} from 'child_process'
import readline from 'readline'
import path from 'path'
import {Config} from '../config'

/**
 * @param config Config
 * @returns a raw javascript code string
 */
export const compileStaticElmWith = async (config: Config): Promise<string> => {
    const tmpFile = tmp.fileSync({postfix: '.js'})
    const srcDir = config.build.static_elm.src_dir || ''
    const exclude = config.build.static_elm.exclude || []
    const r = await compileElmWith(config, srcDir, exclude, tmpFile.name)
    const code =  r ? fs.readFileSync(tmpFile.name, 'utf-8') : ''
    tmpFile.removeCallback()
    return code
}

/**
 * @param config Config
 * @returns output file path (absolute in the site)
 */
export const compileDynamicElmWith = async (config: Config): Promise<string> => {
    const fName = 'dynamic.js'
    const outFile = path.join(config.build.dist_dir, fName)
    const srcDir = config.build.dynamic_elm.src_dir || ''
    const exclude = config.build.dynamic_elm.exclude || []
    const r = await compileElmWith(config, srcDir, exclude, outFile)
    return r ? `/${path.relative(config.build.dist_dir, outFile)}` : ''
}

/**
 * @param config Config
 * @param srcDir source directory
 * @param exclude glob patterns to ignore
 * @param output a file name to output
 * @returns succeeded or not
 */
const compileElmWith = async (config: Config, srcDir: string, exclude: string[], output: string): Promise<boolean> => {
    const globOption = {ignore: exclude}
    const elmFiles = 
            glob.sync(`${srcDir}/**/*.elm`, globOption)
    if(elmFiles.length === 0) {
        return true
    }

    console.log(`Elm: ${srcDir} (${elmFiles.join(', ')})`)

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
    const r = await promiseSpawn(command[0], args) 
    return r === 0 
}

const promiseSpawn = (command: string, args: string[]) => 
    new Promise((resolve, reject) => {
        const sp = spawn(command, args, {stdio: 'pipe'})
        var msgOk: string[] = []
        var msgNg: string[] = []
        readline
            .createInterface({input: sp.stdout, terminal: false})
            .on('line', data => {
                    msgOk.push(data)
            })

        readline
            .createInterface({input: sp.stderr, terminal: false})
            .on('line', data => {
                msgNg.push(data)
            })

        sp.on('close', code => {
            switch (code) {
                case 0:
                    formatPrintChildProcsssStdOut(msgOk)
                    resolve(0)
                    break
                default:
                    formatPrintChildProcsssStdOut(msgNg)
                    reject(code)
                    break
            }
        })
    })

const formatPrintChildProcsssStdOut = (stdout: string[]): void => {
    //var duplicate: string[] = []
    stdout
        .filter(x => typeof x === 'string' && x.trim() !== '')
        .forEach(x => {
            console.log(`   elm: ${x}`)
        })
}


