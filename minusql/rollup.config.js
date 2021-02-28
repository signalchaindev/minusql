import fs from "fs"
import path from "path"
import module from "module"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import resolve from "@rollup/plugin-node-resolve"
import typescript from "rollup-plugin-typescript2"
import multiInput from "rollup-plugin-multi-input"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)
if (Object.keys(pkg).length < 1) {
  console.error("Failed to parse package.json")
}

const production = !process.env.ROLLUP_WATCH

const tsOptions = {
  check: !!process.env.TS_CHECK_ENABLED,
  tsconfigOverride: {
    compilerOptions: { module: "esnext" },
  },
}

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
      "utils/**/*.js",
      "index.js",
      "index.es.js",
      "**/*.map",
    ],
  },
}
export default [
  {
    input: "./main.js",
    output: [
      { file: pkg.main, format: "cjs", sourcemap: true, exports: "named" },
      { file: pkg.module, format: "esm", sourcemap: true, exports: "named" },
    ],
    ...config,
  },
  {
    input: "utils/**/*.ts",
    output: {
      dir: ".",
      format: "esm",
      sourcemap: true,
    },
    ...config,
    plugins: [multiInput({ relative: "." }), ...config.plugins],
  },
]
