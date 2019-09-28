import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'
import express from 'express'
import watch from 'watch'
import program from 'commander'
import jsToHtmlWith from './jstohtml'
import readConfigFrom from './config'
import {compileStaticElmWith, compileDynamicElmWith} from './elmtojs'

const version = '0.1.0'
const config = readConfigFrom('./siteelm.yaml')

/**
 * create a path for saving
 * @param file path of a content file
 */
const savePathFor = (file: string): string => {
    if (file === config.build.contents.index) {
        return path.join(config.build.dist_dir, 'index.html')
    } else {
        const r = path.relative(config.build.contents.src_dir, file) 
        const p = path.parse(r)
        return path.join(config.build.dist_dir, p.dir, p.name, 'index.html')
    }
}

/**
 * convert a content file to a static html and save it 
 * @param file path of a content file
 * @param elmcode a raw javascript code string
 * @param appjs path for the dynamic elm code
 */ 
const convertAndSave = (file: string, elmcode: string, appjs: string): void => {
    console.log(`Building: ${file}`)
    const html = jsToHtmlWith(file, elmcode, appjs, config.build.contents.draft || false)
    if(html !== '') {
        const savePath = savePathFor(file)
        fs.ensureFileSync(savePath)
        fs.writeFileSync(savePath, html)
    }
}


const main = (): void => {
    // 1. generate static pages
    const elm = compileStaticElmWith(config)
    const appjs = compileDynamicElmWith(config)
    const contentFiles = 
        glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || [], nodir: true})
    contentFiles.forEach(x => convertAndSave(x, elm, appjs))
    // 2. copy static assets
    fs.copySync(config.build.assets.src_dir, config.build.dist_dir)
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
            config.build.elm.optimize = program.optimize
        }   
        if(program.draft) {
            config.build.contents.draft = program.draft
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
            config.build.elm.optimize = program.optimize
        }   
        if(program.draft) {
            config.build.contents.draft = program.draft
        }
        // watch directories
        const contentsDirs = 
            glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || []})
            .map(x => path.normalize(path.dirname(x)))
            .filter((x, _, xs) => 
                !xs.includes(path.normalize(path.join(x, '..'))))
        const dirs = [
            contentsDirs,
            config.build.static_elm.src_dir || '',
            config.build.dynamic_elm.src_dir || '',
            config.build.assets.src_dir
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
        app.use(express.static(config.build.dist_dir))
        app.listen(app.get('port'), () => console.log(`running server localhost:${app.get('port')}`))
    })

program.parse(process.argv)

