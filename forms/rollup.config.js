import fs from "fs"
import path from "path"
import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import typescript from "@rollup/plugin-typescript"
import filesize from "rollup-plugin-filesize"
import { rimraf } from "./utils/rimraf.js"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)

const production = !process.env.ROLLUP_WATCH

rimraf(path.join(process.cwd(), "dist"))

export default {
  input: "./lib/index.js",
  output: [
    {
      file: pkg.main,
      format: "es",
      paths: id => id.startsWith("svelte/") && `${id.replace("svelte", ".")}`,
      sourcemap: true,
      exports: "named",
    },
  ],
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        accessors: true,
      },
      emitCss: false,
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    filesize(),
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
    exclude: ["node_modules/**", "dist/**"],
  },
}
