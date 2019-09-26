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
    const elmJson = JSON.parse(fs.readFileSync('./elm.json', 'utf-8'))
    const elmFiles = 
            elmJson['source-directories']
                .map((x: string):string => `${x}/**/*.elm`)
                .map((x: string):string[] => glob.sync(x, globOption))
                .flat()
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
