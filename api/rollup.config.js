import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import * as esbuild from 'esbuild'
import chokidar from 'chokidar'
import chalk from 'chalk'
import { isEmpty } from './src/utils/isEmpty.js'
import { rimraf } from './src/utils/rimraf.js'
import { mkdir } from './src/utils/mkdir.js'
import { print_elapsed } from './src/utils/print_elapsed.js'
import { buildSchemaAssets } from 'tempo'
import pkg from './package.json'

//! This is not a rollup config
//! It's a Tempo config (I just like having the icon)
// TODO: Move this to a CLI

async function init(options) {
  // We are not passing options yet
  options = null
  //
  const opts = {
    srcdir: (options && options.dir) || 'src',
    outdir: (options && options.outdir) || 'dist',
  }

  watch(opts)
}
init()

function watch(options) {
  if (options && isEmpty(options.srcdir)) {
    throw new Error('Must specify "srcdir" option')
  }

  const watchDirs = []
  if (options && options.srcdir && options.srcdir.constructor === String) {
    watchDirs.push(`./${options.srcdir}/**/*.js`)
    watchDirs.push(`./${options.srcdir}/**/*.ts`)
    watchDirs.push(`./${options.srcdir}/**/*.graphql`)
  }
  if (options && options.srcdir && options.srcdir.constructor === Array) {
    for (const dir of options.srcdir) {
      if (path.extname(dir) === '.js') watchDirs.push(`./${dir}/**/*.js`)
      if (path.extname(dir) === '.ts') watchDirs.push(`./${dir}/**/*.ts`)
      if (path.extname(dir) === '.graphql') {
        watchDirs.push(`./${dir}/**/*.graphql`)
      }
    }
  }

  chokidar
    .watch(watchDirs, {
      ignored: [/node_modules/],
    })
    .on('ready', () => {
      serve(options, {
        action: 'STARTING_WATCH',
        message: 'Starting watch...',
        actionPath: '.',
      })
    })
    .on('change', actionPath => {
      serve(options, {
        action: 'CHANGED_FILE',
        message: 'Changed file',
        actionPath,
      })
    })
    .on('add', actionPath => {
      serve(options, {
        action: 'ADDED_FILE',
        message: 'Added file',
        actionPath,
      })
    })
    .on('addDir', actionPath => {
      serve(options, {
        action: 'ADDED_DIRECTORY',
        message: 'Added directory',
        actionPath,
      })
    })
    .on('unlink', actionPath => {
      serve(options, {
        action: 'REMOVED_FILE',
        message: 'Removed file',
        actionPath,
      })
    })
    .on('unlinkDir', actionPath => {
      serve(options, {
        action: 'REMOVED_DIRECTORY',
        message: 'Removed directory',
        actionPath,
      })
    })
    .on('error', error => {
      console.log(`[tempo] Watch error: ${error}`)
    })
}

let initialized = false
let proc = null
let openQueue = false
let called = 0
let queued = false
let delay = 3000
let actionOptions
async function serve(options, actions) {
  actionOptions = actions
  const start = performance.now()
  if (performance.now() - called < delay && initialized === true) {
    queued = true
    return
  }
  if (proc) proc.kill()
  called = performance.now()
  if (initialized === true) {
    console.log(
      `${chalk.blue('[tempo] ' + actions.message)} ${chalk.green(
        actions.actionPath,
      )}`,
    )
  } else {
    console.log(chalk.blue('[tempo] Starting watch...'))
  }
  initialized = true

  await build(options, {
    ...actions,
    ext: openQueue ? path.extname(actions.actionPath) : 'any',
  })
  proc = child_process.fork(path.join(process.cwd(), 'dist', 'server.js'))

  if (proc && openQueue && queued === true) {
    setTimeout(() => {
      serve(options, actionOptions)
    }, delay)
    queued = false
  }

  if (openQueue === false) {
    setTimeout(() => {
      queued = false
    }, delay)
  }
  openQueue = true
  delay = performance.now() - start + 1000
}

async function build(options, actions) {
  const initStart = performance.now()
  try {
    const targetDir = path.join(process.cwd(), options.outdir)
    if (fs.existsSync(targetDir)) {
      rimraf(targetDir)
    }
    mkdir(targetDir)

    await buildSchemaAssets({ dir: options.srcdir }, actions)

    const bundleStart = performance.now()
    await esbuild.build({
      entryPoints: [`${path.join(process.cwd(), 'src', 'server.js')}`],
      outdir: targetDir,
      bundle: true,
      sourcemap: true,
      minify: false,
      external: Object.keys(pkg.dependencies).concat(
        require('module').builtinModules ||
          Object.keys(process.binding('natives')),
      ),
      format: 'esm',
      platform: 'node',
      // plugins: [],
    })
    print_elapsed(bundleStart, '[tempo] Build bundle')
  } catch (err) {
    throw new Error(err)
  }
  print_elapsed(initStart, '[tempo] Total build')
}
