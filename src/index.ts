import program from 'commander'
import readConfigFrom from './config'
import server from './server'
import generateAll, {copyAssets} from './generator'
import initialize from './initializer'
import watchAll from './watcher'

const version = '0.2.2'

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
        copyAssets(config)
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

// "siteelm watch"
program
    .option('-o, --optimize', 'use optimization')
    .option('-d, --draft', 'not to ignore drafts')
    .command('watch')
    .action(() => {
        const option = {
            optimize: program.optimize,
            withDraft: program.draft
        }
        const config = readConfigFrom('./siteelm.yaml', option)
        watchAll(config, () => {})
    })

// "siteelm init"
program
    .command('init')
    .action(() => {
        initialize()
    })

program.parse(process.argv)

