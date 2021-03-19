import fs from "fs"
import path from "path"
import module from "module"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import commonjs from "@rollup/plugin-commonjs"
import url from "@rollup/plugin-url"
import svelte from "rollup-plugin-svelte"
import { terser } from "rollup-plugin-terser"
import typescript from "@rollup/plugin-typescript"
import sveltePreprocess from "svelte-preprocess"
import postcssPresetEnv from "postcss-preset-env"
import postcsseasings from "postcss-easings"
import purgecss from "@fullhuman/postcss-purgecss"
import cssnano from "cssnano"
import config from "sapper/config/rollup.js"
import sapperenv from "./.env.js"

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
)
if (Object.keys(pkg).length < 1) console.error("Failed to parse package.json")

const mode = process.env.NODE_ENV
const dev = mode === "development"

const ENV_VARS = {}
const modes = Object.keys(sapperenv)
const idx = modes.indexOf(mode)
const [_, envVars] = Object.entries(sapperenv)[idx]
ENV_VARS["process.env.NODE_ENV"] = JSON.stringify(mode)

for (const [key, val] of Object.entries(envVars)) {
  ENV_VARS[`process.env.${key}`] = JSON.stringify(val)
}

/**
 * autoprefixer browserslist is in the package.json
 *
 * postcss-preset-env enables Stage 2 by default
 * https://preset-env.cssdb.org/features
 * https://www.npmjs.com/package/postcss-preset-env
 *
 * We are using the older syntax for :is()
 * Until :is() has better support, use :matches()
 *
 */
const postcssProdPlugins = !dev
  ? [
      purgecss({
        content: ["./src/**/*.svelte"],
      }),
      cssnano({
        preset: "default",
      }),
    ]
  : []

const preprocess = sveltePreprocess({
  scss: {
    includePaths: ["src"],
    sourceMap: dev,
  },
  postcss: {
    plugins: [
      postcsseasings(),
      postcssPresetEnv({
        autoprefixer: !dev,
        stage: 0,
        features: {
          "logical-properties-and-values": false,
          "prefers-color-scheme-query": false,
          "gap-properties": false,
        },
      }),
      ...postcssProdPlugins,
    ],
  },
})

const onwarn = (warning, onwarn) =>
  (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
  (warning.code === "CIRCULAR_DEPENDENCY" &&
    /[/\\]@sapper[/\\]/.test(warning.message)) ||
  warning.code === "THIS_IS_UNDEFINED" ||
  onwarn(warning)

const client = {
  input: config.client.input().replace(/\.js$/, ".ts"),
  output: config.client.output(),
  plugins: [
    replace({
      "process.browser": true,
      ...ENV_VARS,
      preventAssignment: true, // Should default to "true" in v3
    }),
    svelte({
      preprocess,
      compilerOptions: {
        dev,
        hydratable: true,
      },
    }),
    url({
      sourceDir: path.resolve(__dirname, "src/node_modules/images"),
      publicPath: "/client/",
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({ sourceMap: dev }),

    !dev &&
      terser({
        module: true,
      }),
  ],

  preserveEntrySignatures: false,
  onwarn,
}

const server = {
  input: { server: config.server.input().server.replace(/\.js$/, ".ts") },
  output: config.server.output(),
  plugins: [
    replace({
      "process.browser": false,
      ...ENV_VARS,
      preventAssignment: true, // Should default to "true" in v3
    }),
    svelte({
      preprocess,
      emitCss: false,
      compilerOptions: {
        dev,
        generate: "ssr",
        hydratable: true,
      },
    }),
    url({
      sourceDir: path.resolve(__dirname, "src/node_modules/images"),
      publicPath: "/client/",
      emitFiles: false,
    }),
    resolve({
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({ sourceMap: dev }),
  ],
  external: [].concat(
    Object.keys(pkg.dependencies || {}),
    module.builtinModules,
  ),

  preserveEntrySignatures: "strict",
  onwarn,
}

// const serviceworker = {
//   input: config.serviceworker.input().replace(/\.js$/, ".ts"),
//   output: config.serviceworker.output(),
//   plugins: [
//     resolve(),
//     replace({
//       'process.browser': true,
//       ...ENV_VARS,
//     }),
//     commonjs(),
//     typescript({ sourceMap: dev }),
//     !dev && terser(),
//   ],
//   preserveEntrySignatures: false,
//   onwarn,
// }

const configuration = {
  client,
  server,
  // serviceworker,
}

export default configuration
