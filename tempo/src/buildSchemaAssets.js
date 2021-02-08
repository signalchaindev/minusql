import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import child_process from 'child_process'
import { performance } from 'perf_hooks'
import chalk from 'chalk'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { print } from 'graphql'
import { rimraf } from './utils/rimraf.js'
import { print_elapsed } from './utils/print_elapsed.js'
import { moduleBinDir, moduleTempDirPath, binName, subDir } from './config.js'

const exec = promisify(child_process.exec)

/**
 * Run the Go binary to build the resolver map and concatenate graphql files
 * Runs from the node_modules directory of the project
 */
export async function buildSchemaAssets(options = {}, actions) {
  const opts = {
    dev: options.dev || false,
    dir: options.dir || 'src',
  }

  // Run Go binary
  // TODO: exec calls take around 200ms. convert to wasm when possible.
  const { stdout, stderr } = await exec(`${binName} ${process.cwd()} ${opts.dir} ${actions.ext}`, {
    cwd: path.join(moduleBinDir, subDir),
  })
  const numbers = stdout.match(/[\d.]+/g)
  const letters = stdout.match(/[a-z]+/gi)
  console.log(
    `${chalk.blue('[tempo] Compile schema')} ${chalk.green('in')} ${chalk.blue(
      parseFloat(numbers).toFixed(1) + letters,
    )}`,
  )
  if (stderr) {
    console.error(chalk.red(`Error: ${stderr}`))
  }

  if (actions.ext === '.graphql' || actions.ext === 'any') {
    const start = performance.now()
    const typeDefsTempPath = path.join(moduleTempDirPath, 'typeDefs.graphql')
    const typeDefsPath = path.join(process.cwd(), 'src', 'node_modules', '@tempo', 'typeDefs.js')
    rimraf(typeDefsPath)
    const unmergedTypeDefs = fs.readFileSync(typeDefsTempPath, 'utf-8')
    const typeDefs = mergeTypeDefs([unmergedTypeDefs])
    const printedTypeDefs = print(typeDefs)
    fs.writeFileSync(typeDefsPath, `export const typeDefs = \`${printedTypeDefs}\``, 'utf-8')
    print_elapsed(start, '[tempo] Build type defs')
  }
}
