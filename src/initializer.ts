import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import prompts from 'prompts'

const scaffoldDir = path.join(__dirname, '../res/scaffold')
let scaffoldName = 'basic'

/**
 * just copy a scaffold
 */
const initialize = async () => {
    const whitelist = [
        './package.json',
        './package-lock.json',
        './node_modules/**/*',
    ]
    const files = glob.sync('./**/*',{ignore: whitelist, dot: false, nodir: true})
    console.log(files)

    if(files.length) {
        console.error('this directory is not empty!')
        console.error('(if you need, you can put only "package.json", "package-lock.json", and "node_modules")')
        return
    } 

    console.log(`choose the template`)
    console.log(`[0] basic (default)`)
    console.log(`[1] blog`)
    let template = -1
    while(![0, 1].includes(template)) {
        const res = await prompts({
            'type': 'number',
            'name': 'template',
            'message': 'template:'
        })
        template = res.template ?? 0
    }
    switch(template) {
        case 0:
            scaffoldName = 'basic'
            break
        case 1:
            scaffoldName = 'blog'
            break
    }

    console.log(`copying the scaffold "${scaffoldName}..."`)
    const scaffold = path.join(scaffoldDir, scaffoldName)
    fs.copySync(scaffold, '.')
    console.log('done!')
    console.log('------------')
    console.log('   siteelm server: run a server for developing')
    console.log('   siteelm make: generate a site')
    console.log('------------')
}

export default initialize
