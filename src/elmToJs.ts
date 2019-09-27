import glob from 'glob'
import fs from 'fs'
import tmp from 'tmp'
import {spawnSync} from 'child_process'
import {Config} from './config'

/**
 * @param config Config
 * @returns a raw javascript code string
 */
const compileElmWithConfig = (config: Config): string => {
    const globOption = {ignore: config.elm.exclude}
    const elmFiles = 
            glob.sync(`${config.elm.staticDir || ''}/**/*.elm`, globOption)

    // considering "elm" and "npx elm"
    const command = (config.elm.command || 'elm').split(' ')
    const tmpFile = `${tmp.fileSync().name}.js`
    const args = [ 
        command.slice(1),
        "make", 
        elmFiles,
        config.elm.optimize ? "--optimize" : "",
        `--output=${tmpFile}`
        ]
        .flat()
        .filter((x: string) => x.length > 0)
    const r = spawnSync(command[0], args, {stdio: 'inherit'})
    return r.status === 0 ? fs.readFileSync(tmpFile, 'utf-8') : ''
}

export default compileElmWithConfig
