import fs from 'fs'
import yaml from 'js-yaml'

export interface Config {
    elm: {
        srcDirs?: string[]
        optimize?: boolean
        command?: string
        exclude: string[]
    }
    build: {
        contents: string[]
        index?: string
        draft?: boolean
        distDir: string
        staticDir: string
    }
}

const minumum: Config = {
    elm: {
        exclude: ['./Util/**/*.elm']
    },
    build: {
        contents: ['./contents/**/*.md'],
        index: './contents/index.md',
        distDir: './dist',
        staticDir: './static'
    },
}

/**
 * @param file config file
 * @returns object
 */
const readConfigFrom = (file: string): Config => {
    const yml = fs.readFileSync(file, 'utf-8')
    var conf = yaml.safeLoad(yml)

    if(fs.existsSync('./package.json') && !conf.elm.command) {
        conf.elm.command = 'npx elm'
    }
    if(typeof conf.elm.optimize !== 'boolean') {
        conf.elm.optimize = false
    }
    if(typeof conf.build.distDir !== 'string') {
        conf.build.distDir = './dist'
    }
    if(typeof conf.build.staticDir !== 'string') {
        conf.build.staticDir = './static'
    }
    if(typeof conf.build.draft !== 'boolean') {
        conf.build.draft = false
    }
    if(!conf.elm.srcDirs) {
        const elmJson = JSON.parse(fs.readFileSync('./elm.json', 'utf-8'))
        conf.elm.srcDirs = elmJson['source-directories']
    }
    return conf
}

export default readConfigFrom;
