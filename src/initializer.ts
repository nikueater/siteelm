import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

const scaffoldDir = path.join(__dirname, '../res/scaffold')
const scaffoldName = 'basic'

/**
 * just copy a scaffold
 */
const initialize = () => {
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
