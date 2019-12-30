import express from 'express'
import expressWs from 'express-ws'
import {Config} from './config'
import watchAll from './watcher'
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

        // start watching
        const wss = ews.getWss()
        watchAll(config, () => {
            wss.clients.forEach((c)=>{
                c.send(JSON.stringify({reload: true}))
            })
        })
    })    
}

export default server;
