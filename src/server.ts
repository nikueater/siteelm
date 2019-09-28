import express from 'express'
import expressWs from 'express-ws'
import watch from 'watch'
import {Config} from './config'
import generateAll from './generator'

const server = (config: Config) => {
    generateAll(config, {isServer: true})        
    // 
    const ews = expressWs(express())
    const app = ews.app
    app.set('port', 3000)
    app.use(express.static(config.build.dist_dir))
    app.ws('/', () => {
        console.log('auto reloader connected')
    })
    // start a server
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
        const wss = ews.getWss()
        dirs.forEach(x => {
            var initial = true
            watch.watchTree(x, {interval: 1.5} , () => {
                if(!initial) {
                    generateAll(config, {isServer: true})
                    wss.clients.forEach((c)=>{
                        c.send(JSON.stringify({reload: true}))
                    })
                } else {
                    initial = false
                }
            })
        })
    })
}

export default server;
