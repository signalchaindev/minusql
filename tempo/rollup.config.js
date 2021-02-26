import fs from "fs"
import path from "path"
import module from "module"
import { performance } from "perf_hooks"
import fg from "fast-glob"
import { buildBinary } from "./src/buildBinary.js"
import { rimraf } from "./src/utils/rimraf.js"
import { print_elapsed } from "./src/utils/print_elapsed.js"
import { binBuildDir, packageDir } from "./src/config.js"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)
if (Object.keys(pkg).length < 1) {
  console.error("Failed to parse package.json")
}

function build() {
  const binDir = path.join(process.cwd(), ".bin")
  const distDir = path.join(process.cwd(), "dist")
  return {
    async buildStart() {
      const start = performance.now()
      const rmBin = rimraf(binDir)
      const rmDist = rimraf(distDir)
      Promise.all([rmBin, rmDist])
      const binary = buildBinary(binBuildDir, packageDir)

      const files = []
      const scriptGlob = fg("scripts/**/*.js")
      const jsGlob = fg("src/**/*.js")
      const goGlob = fg("src/**/*.go")
      const [scriptFiles, jsFiles, goFiles] = await Promise.all([
        scriptGlob,
        jsGlob,
        goGlob,
        binary,
      ])
      files.push(...scriptFiles)
      files.push(...jsFiles)
      files.push(...goFiles)

      for (const file of files) {
        this.addWatchFile(path.join(process.cwd(), file))
      }

      print_elapsed(start, "[tempo] Build complete")
    },
  }
}

export default {
  input: "./src/buildSchemaAssets.js",
  output: [
    { file: pkg.main, format: "cjs", sourcemap: true, exports: "named" },
    { file: pkg.module, format: "es", sourcemap: true, exports: "named" },
  ],
  plugins: [build()],
  external: [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.peerDependencies || {}),
    module.builtinModules,
  ),
  onwarn: (warning, onwarn) =>
    warning.code === "CIRCULAR_DEPENDENCY" && onwarn(warning),
  watch: {
    clearScreen: false,
    exclude: ["node_modules/**", ".bin/**", "dist/**"],
  },
}
