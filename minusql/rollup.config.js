import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "./src/minusql.js",
  output: [
    { file: pkg.main, format: "cjs", sourcemap: true, exports: "named" },
    { file: pkg.module, format: "es", sourcemap: true, exports: "named" },
  ],
  plugins: [commonjs(), production && terser()],
  external: Object.keys(pkg.dependencies || {}).concat(
    Object.keys(process.binding("natives"))
  ),
  onwarn: (warning, onwarn) =>
    warning.code === "CIRCULAR_DEPENDENCY" && onwarn(warning),
  watch: {
    clearScreen: false,
    exclude: ["node_modules/**", "dist/**"],
  },
};
