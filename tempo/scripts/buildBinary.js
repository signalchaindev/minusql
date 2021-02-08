import { buildBinary } from '../src/buildBinary.js'
import { rimraf } from '../src/utils/rimraf.js'
import { moduleBinDir, modulePackageDir } from '../src/config.js'

function build() {
  rimraf(moduleBinDir)
  buildBinary(moduleBinDir, modulePackageDir)
}
build()
