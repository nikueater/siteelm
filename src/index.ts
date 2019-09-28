import program from 'commander'
import readConfigFrom from './config'
import server from './server'
import generateAll from './generator'

const version = '0.1.0'

program
    .version(version, '-v, --version')

// "siteelm make"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('make')
    .action((_) => {
        const option = {
            optimize: program.optimize,
            withDraft: program.draft
        }
        const config = readConfigFrom('./siteelm.yaml', option)
        generateAll(config)
    })

// "siteelm server"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('server')
    .action((_) => {
        const option = {
            optimize: program.optimize,
            withDraft: program.draft
        }
        const config = readConfigFrom('./siteelm.yaml', option)
        server(config)
    })

program.parse(process.argv)

