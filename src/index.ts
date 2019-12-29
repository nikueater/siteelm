import program from 'commander'
import readConfigFrom from './config'
import server from './server'
import generateAll from './generator'
import initialize from './initializer'

const version = '0.2.1'

program
    .version(version, '-v, --version')

// "siteelm make"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('make')
    .action(async () => {
        const option = {
            optimize: program.optimize,
            withDraft: program.draft
        }
        const config = readConfigFrom('./siteelm.yaml', option)
        const result = await generateAll(config)
        if(!result) {
            process.exitCode = 1
        }   
    })

// "siteelm server"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('server')
    .action(() => {
        const option = {
            optimize: program.optimize,
            withDraft: program.draft
        }
        const config = readConfigFrom('./siteelm.yaml', option)
        server(config)
    })

// "siteelm init"
program
    .command('init')
    .action(() => {
        initialize()
    })

program.parse(process.argv)

