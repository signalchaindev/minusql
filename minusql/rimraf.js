import fs from "fs"
import path from "path"
import kleur from "kleur"

/**
 * @param {string}
 *
 * @returns {void}
 */
export function rimraf(entry_path) {
  if (!entry_path) {
    throw new Error(kleur.red("rimraf requires a path to a directory or file"))
  }

  if (!fs.existsSync(entry_path)) {
    return
  }

  const stats = fs.statSync(entry_path)

  if (stats.isDirectory()) {
    fs.readdirSync(entry_path).forEach(entry => {
      rimraf(path.join(entry_path, entry))
    })

    fs.rmdirSync(entry_path)
    return
  }

  fs.unlinkSync(entry_path)
}
