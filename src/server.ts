import express from 'express'
import expressWs from 'express-ws'
import path from 'path'
import watch from 'watch'
import {Config} from './config'
import fs from 'fs'
import generateAll, {convertOnlyContentFiles} from './generator'

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
        //
        var elmdirs : string[] = []
        if(fs.existsSync('./elm.json')) {
            const json = JSON.parse(fs.readFileSync('./elm.json', 'utf-8')) as any
            elmdirs = (json['source-directories'] || []) as (string[])
        }
        // watch directories(generate all)
        const dirs = [ 
            elmdirs ? '' : (config.build.static_elm.src_dir || ''),
            elmdirs ? '' : (config.build.dynamic_elm.src_dir || ''),
            config.build.assets.src_dir,
        ].concat(elmdirs).filter(x => x !== '')

        var pageDir = path.normalize(config.build.contents.src_dir)

        // start watching
        console.log(`WATCH: ${dirs.join(",")}`)
        const wss = ews.getWss()
        dirs.forEach(x => {
            var initial = true
            watch.watchTree(x, {interval: 1.5, ignoreDirectoryPattern: RegExp(pageDir)} , () => {
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

        // watch the content dir
        var ignoreOnce = true
        watch.watchTree(config.build.contents.src_dir, {interval: 1.5}, () =>{
            if(!ignoreOnce) {
                convertOnlyContentFiles(config)
                wss.clients.forEach((c)=>{
                    c.send(JSON.stringify({reload: true}))
                })
            } else {
                ignoreOnce = false
            }
        })
    })
}

export default server;
