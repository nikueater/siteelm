import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'
import program from 'commander'
import generatePageFrom from './generator'
import readConfigFrom from './config'
import elmToJsWithConfig from './elmToJs'

const version = '0.1.0'
const config = readConfigFrom('./sitelm.yaml')

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
    const savePath = savePathFor(file)
    const html = generatePageFrom(file, elmcode)
    fs.ensureDirSync(savePath)
    fs.writeFileSync(path.join(savePath, 'index.html'), html)
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
    .option('-o, --optimize <bool>', 'use optimization')
    .parse(process.argv)

if(program.optimize != null) {
    config.elm.optimize = (program.optimize as string).toLowerCase() !== 'false'
}

main()
