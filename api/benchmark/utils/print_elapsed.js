import { performance } from 'perf_hooks'
import chalk from 'chalk'

/**
 * @param {number} start
 * @param {string} msg
 */
export function print_elapsed(start, msg) {
  const end = performance.now()
  let elapsed = end - start
  let unit = 'ms'
  if (elapsed >= 1000) {
    elapsed = elapsed * 0.001
    unit = 's'
  }
  console.log(
    `${chalk.blue(msg)} ${chalk.green('in')} ${chalk.blue(elapsed.toFixed(1))}${chalk.blue(unit)}`,
  )
}
