import fs from 'fs'
import yaml from 'js-yaml'

export interface Config {
    site: {
        title: string
    }
    elm: {
        optimize?: boolean
        command?: string
        exclude: string[]
    }
    build: {
        contents: string[]
        index?: string
        distDir: string
        staticDir: string
    }
}

const minumum: Config = {
    site: {
        title: "sitelm"
    },
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
        conf.elm.optimize = true
    }
    if(typeof conf.build.distDir !== 'string') {
        conf.build.distDir = './dist'
    }
    if(typeof conf.build.staticDir !== 'string') {
        conf.build.staticDir = './static'
    }
    return conf
}

export default readConfigFrom;
