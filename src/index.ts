import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'
import express from 'express'
import watch from 'watch'
import program from 'commander'
import generatePageFrom from './generator'
import readConfigFrom from './config'
import elmToJsWithConfig from './elmToJs'

const version = '0.1.0'
const config = readConfigFrom('./siteelm.yaml')

/**
 * create a path for saving
 * @param file path of a content file
 */
const savePathFor = (file: string): string => {
    const p = path.parse(file)
    const dir = path.normalize(p.dir).split('/').slice(1).join('/')
    if (file === config.build.index) {
        return path.join(config.build.distDir, dir)
    } else {
        return path.join(config.build.distDir, dir, p.name)
    }
}

/**
 * convert a content file to a static html and save it 
 * @param file path of a content file
 * @param elmcode a raw javascript code string
 */ 
const convertAndSave = (file: string, elmcode: string): void => {
    console.log(`Building: ${file}`)
    const html = generatePageFrom(file, elmcode, config.build.draft || false)
    if(html !== '') {
        const savePath = savePathFor(file)
        fs.ensureDirSync(savePath)
        fs.writeFileSync(path.join(savePath, 'index.html'), html)
    }
}


const main = (): void => {
    // 1. generate static pages
    const elm = elmToJsWithConfig(config)
    const contentFiles = 
        config.build.contents
            .map(x => glob.sync(x))
            .flat()
    contentFiles.forEach(x => convertAndSave(x, elm))
    // 2. copy static assets
    fs.copySync(config.build.staticDir, config.build.distDir)
}

program
    .version(version, '-v, --version')

// "siteelm make"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('make')
    .action((_) => {
        if(program.optimize) {
            config.elm.optimize = program.optimize
        }   
        if(program.draft) {
            config.build.draft = program.draft
        }
        main()
    })

// "siteelm server"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('server')
    .action((_) => {
        if(program.optimize) {
            config.elm.optimize = program.optimize
        }   
        if(program.draft) {
            config.build.draft = program.draft
        }
        // watch directories
        const contentsDirs = 
            config.build.contents
            .flatMap(x => glob.sync(x))
            .map(x => path.normalize(path.dirname(x)))
            .filter((x, _, xs) => 
                !xs.includes(path.normalize(path.join(x, '..'))))
        const dirs = [
            contentsDirs,
            config.elm.staticDir || [],
            config.elm.dynamicDir || [],
            config.build.staticDir
        ]
            .flat()
        dirs.forEach(x => {
            var initial = true
            watch.watchTree(x, () => {
                if(!initial) {
                    main()
                } else {
                    initial = false
                }
            })
        })
        main()        
        // start a server
        const app = express()
        app.set('port', 3000)
        app.use(express.static(config.build.distDir))
        app.listen(app.get('port'), () => console.log(`running server localhost:${app.get('port')}`))
    })

program.parse(process.argv)


