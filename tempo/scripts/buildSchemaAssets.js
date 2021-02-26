import { buildSchemaAssets } from "../src/buildSchemaAssets.js"
import { rimraf } from "../src/utils/rimraf.js"
import { moduleBuildDir } from "../src/config.js"

function build() {
  rimraf(moduleBuildDir)
  buildSchemaAssets()
}
build()
