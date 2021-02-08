import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import child_process from 'child_process'
import { performance } from 'perf_hooks'
import chalk from 'chalk'
import { mkdir } from './utils/mkdir.js'
import { print_elapsed } from './utils/print_elapsed.js'
import { binName, exeName, goarch, subDir, goos } from './config.js'

const exec = promisify(child_process.exec)

/**
 * Build the Go binary
 * Runs during package development
 */
export async function buildBinary(buildDir, packageDir) {
  const start = performance.now()
  const targetDir = path.join(buildDir, subDir)

  if (!fs.existsSync(targetDir)) {
    mkdir(targetDir)
  }

  let bin
  if (os.platform() === 'win32' || os.platform() === 'win64') {
    bin = exec(`env GOOS=windows GOARCH=${goarch} go build -o ${path.join(targetDir, exeName)}`, {
      cwd: packageDir,
    })
  } else {
    bin = exec(`env GOOS=${goos} GOARCH=${goarch} go build -o ${path.join(targetDir, binName)}`, {
      cwd: packageDir,
    })
  }

  const [binBuild] = await Promise.all([bin])

  if (binBuild.stderr) {
    console.error(chalk.red(`${subDir}:`, binBuild.stderr))
  }

  print_elapsed(start, '[tempo] Build binaries')
}
