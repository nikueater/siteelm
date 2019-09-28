import express from 'express'
import watch from 'watch'
import {Config} from './config'
import generateAll from './generator'

const server = (config: Config) => {
    generateAll(config)        
    // start a server
    const app = express()
    app.set('port', 3000)
    app.use(express.static(config.build.dist_dir))
    app.listen(app.get('port'), () => {
        console.log(`running server localhost:${app.get('port')}`)
        // watch directories
        const dirs = [ 
            config.build.contents.src_dir || '',
            config.build.static_elm.src_dir || '',
            config.build.dynamic_elm.src_dir || '',
            config.build.assets.src_dir
        ]
        // start watching
        dirs.forEach(x => {
            var initial = true
            watch.watchTree(x, () => {
                if(!initial) {
                    generateAll(config)
                } else {
                    initial = false
                }
            })
        })
    })
}

export default server;
