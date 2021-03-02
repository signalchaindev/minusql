import fs from "fs"
import path from "path"
import module from "module"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import resolve from "@rollup/plugin-node-resolve"
import typescript from "rollup-plugin-typescript2"
import multiInput from "rollup-plugin-multi-input"
import dts from "rollup-plugin-dts"
import { rimraf } from "./src/utils/rimraf.js"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)
if (Object.keys(pkg).length === 0) {
  console.error("Failed to parse package.json")
}

const production = !process.env.ROLLUP_WATCH

const tsOptions = {
  check: !!process.env.TS_CHECK_ENABLED,
  tsconfig: "tsconfig.json",
  useTsconfigDeclarationDir: true,
}

rimraf(path.join(process.cwd(), "dist"))
rimraf(path.join(process.cwd(), "typings"))
rimraf(path.join(process.cwd(), "utils"))

const config = {
  plugins: [
    resolve({
      extensions: [".cjs", ".mjs", ".js", ".ts"],
    }),
    commonjs(),
    typescript(tsOptions),
    production &&
      terser({
        output: {
          comments: () => false,
        },
      }),
  ],
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
    input: "./main.ts",
    output: [
      { file: pkg.main, format: "cjs", sourcemap: true, exports: "named" },
      { file: pkg.module, format: "es", sourcemap: true, exports: "named" },
    ],
    ...config,
  },
  {
    input: ["src/utils/**/*.ts"],
    output: {
      dir: "./utils",
      format: "es",
      sourcemap: true,
    },
    ...config,
    plugins: [multiInput({ relative: "./src/utils" }), ...config.plugins],
  },
  {
    input: "./main.d.ts",
    output: [
      {
        file: "typings/types.d.ts",
        format: "es",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [dts()],
  },
]
