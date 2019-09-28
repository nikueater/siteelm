import path from 'path'
import fs from 'fs-extra'

const scaffoldDir = path.join(__dirname, '../res/scaffold')
const scaffoldName = 'basic'

/**
 * just copy a scaffold
 */
const initialize = () => {
    if(fs.readdirSync('.').length > 0) {
        console.error('this directory is not empty')
        return
    } 
    console.log(`copying the scaffold "${scaffoldName}"`)
    const scaffold = path.join(scaffoldDir, scaffoldName)
    fs.copySync(scaffold, '.')
    console.log('done')
    console.log('\tsiteelm server: run a server for developing')
    console.log('\tsiteelm make: generate a site')
}

export default initialize
