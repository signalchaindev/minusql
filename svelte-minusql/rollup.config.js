import fs from "fs"
import path from "path"
import module from "module"
import typescript from "rollup-plugin-typescript2"
import dts from "rollup-plugin-dts"
import filesize from "rollup-plugin-filesize"
import { rimraf } from "./rimraf.js"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)
if (Object.keys(pkg).length === 0) {
  console.error("Failed to parse package.json")
}

rimraf(path.join(process.cwd(), "dist"))
rimraf(path.join(process.cwd(), "typings"))

const tsOptions = {
  check: !!process.env.TS_CHECK_ENABLED,
  tsconfig: "tsconfig.json",
  useTsconfigDeclarationDir: true,
}

const config = {
  external: [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.peerDependencies || {}),
    module.builtinModules,
  ),
  onwarn: (warning, onwarn) =>
    warning.code === "CIRCULAR_DEPENDENCY" && onwarn(warning),
  watch: {
    clearScreen: false,
    exclude: [
      "node_modules",
      "dist",
      "typings",
      "utils",
      "**/*.map",
      "**/*.d.ts",
    ],
  },
}

export default [
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs", sourcemap: true, exports: "named" },
      { file: pkg.module, format: "es", sourcemap: true, exports: "named" },
    ],
    plugins: [typescript(tsOptions), filesize()],
    ...config,
  },
  {
    input: "src/index.ts",
    output: {
      file: "typings/types.d.ts",
      format: "es",
      sourcemap: true,
      exports: "named",
    },
    plugins: [dts()],
    ...config,
  },
]
