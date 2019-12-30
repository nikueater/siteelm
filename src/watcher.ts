import path from 'path'
import watch from 'watch'
import {Config} from './config'
import fs from 'fs'
import generateAll, {convertOnlyContentFiles, copyAssets} from './generator'

const watchAll = (config: Config, onChange: () => void) => {
    var elmdirs : string[] = []
    if(fs.existsSync('./elm.json')) {
        const json = JSON.parse(fs.readFileSync('./elm.json', 'utf-8')) as any
        elmdirs = (json['source-directories'] || []) as (string[])
    }
    // watch directories(generate all)
    const dirs = [ 
        elmdirs ? '' : (config.build.static_elm.src_dir || ''),
        elmdirs ? '' : (config.build.dynamic_elm.src_dir || ''),
    ].concat(elmdirs).filter(x => x !== '')

    console.log(`WATCH: ${dirs.join(",")}`)

    var filter = (p: string) => 
        path.extname(p) === '.elm'

    // start watching
    dirs.forEach(x => {
        var initial = true
        watch.watchTree(x, {interval: 1.5, filter: filter} , () => {
            if(!initial) {
                generateAll(config, {isServer: true})
                if(onChange) {
                    onChange()
                }
            } else {
                initial = false
            }
        })
    })

    // watch assets
    watch.watchTree(config.build.assets.src_dir, () => {
        copyAssets(config)
    })

    // watch the content dir
    var ignoreOnce = true
    watch.watchTree(config.build.contents.src_dir, {interval: 1.5}, () =>{
        if(!ignoreOnce) {
            convertOnlyContentFiles(config)
            if(onChange) {
                onChange()
            }
        } else {
            ignoreOnce = false
        }
    })
}

export default watchAll;
