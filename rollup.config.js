import path from 'path'
import { terser } from 'rollup-plugin-terser'

const root = path.join(__dirname)

export default {
  input: path.join(root, 'src', 'index.js'),
  output: [
    {
      file: 'dist/index.js',
      format: 'iife',
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      plugins: [
        terser({
          module: true,
        }),
      ],
    },
  ],
}
