import fs from 'fs'
import path from 'path'
import module from 'module'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
)
if (Object.keys(pkg).length < 1) {
  console.error('Failed to parse package.json')
}

const production = !process.env.ROLLUP_WATCH

const tsOptions = {
  check: !!process.env.TS_CHECK_ENABLED,
  tsconfigOverride: {
    compilerOptions: { module: 'esnext' },
  },
}

export default {
  input: './main.js',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
    { file: pkg.module, format: 'es', sourcemap: true, exports: 'named' },
  ],
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.ts'],
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
    warning.code === 'CIRCULAR_DEPENDENCY' && onwarn(warning),
  watch: {
    clearScreen: false,
    exclude: ['node_modules/**', 'dist/**'],
  },
}
