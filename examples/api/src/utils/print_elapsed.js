import { performance } from "perf_hooks"
import kleur from "kleur"

/**
 * @param {number} start
 * @param {string} msg
 */
export function print_elapsed(start, msg) {
  const end = performance.now()
  let elapsed = end - start
  let unit = "ms"
  if (elapsed >= 1000) {
    elapsed = elapsed * 0.001
    unit = "s"
  }
  console.log(
    `${kleur.blue(msg)} ${kleur.green("in")} ${kleur.blue(
      elapsed.toFixed(1),
    )}${kleur.blue(unit)}`,
  )
}
