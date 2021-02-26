import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import child_process from 'child_process';
import { performance } from 'perf_hooks';
import kleur from 'kleur';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';
import os from 'os';

function rimraf(entry_path) {
  if (!entry_path) {
    throw new Error(kleur.red("rimraf requires a path to a directory or file"))
  }

  if (!fs.existsSync(entry_path)) {
    return
  }

  const stats = fs.statSync(entry_path);

  if (stats.isDirectory()) {
    fs.readdirSync(entry_path).forEach(entry => {
      rimraf(path.join(entry_path, entry));
    });

    fs.rmdirSync(entry_path);
    return
  }

  fs.unlinkSync(entry_path);
}

/**
 * @param {number} start
 * @param {string} msg
 */
function print_elapsed(start, msg) {
  const end = performance.now();
  let elapsed = end - start;
  let unit = "ms";
  if (elapsed >= 1000) {
    elapsed = elapsed * 0.001;
    unit = "s";
  }
  console.log(
    `${kleur.blue(msg)} ${kleur.green("in")} ${kleur.blue(
      elapsed.toFixed(1),
    )}${kleur.blue(unit)}`,
  );
}

const binName = "tempo";
const binBuildDir = path.join(process.cwd(), ".bin");
const packageDir = path.join(process.cwd(), "src", "package");
const moduleBinDir = path.join(
  process.cwd(),
  "node_modules",
  "tempo",
  ".bin",
);
const moduleBuildDir = path.join(process.cwd(), "src", "node_modules");
const modulePackageDir = path.join(
  process.cwd(),
  "node_modules",
  "tempo",
  "src",
  "package",
);
const moduleTempDirPath = path.join(
  process.cwd(),
  "node_modules",
  "tempo",
  "temp",
);

// Mapping from Node's `process.arch` to Golang's `$GOARCH`
const ARCH_MAPPING = {
  ia32: "386",
  x64: "amd64",
  arm: "arm",
};

// Mapping between Node's `process.platform` to Golang's
const PLATFORM_MAPPING = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
  freebsd: "freebsd",
};

const goos = PLATFORM_MAPPING[os.platform()];
const goarch = ARCH_MAPPING[os.arch()];
const subDir = `${goos}-${goarch}`;

const exec = promisify(child_process.exec);

/**
 * Run the Go binary to build the resolver map and concatenate graphql files
 * Runs from the node_modules directory of the project
 */
async function buildSchemaAssets(options = {}, actions) {
  const opts = {
    dev: options.dev || false,
    dir: options.dir || "src",
  };

  // Run Go binary
  // TODO: exec calls take around 200ms. convert to wasm when possible.
  const { stdout, stderr } = await exec(
    `${binName} ${process.cwd()} ${opts.dir} ${actions.ext}`,
    {
      cwd: path.join(moduleBinDir, subDir),
    },
  );
  const numbers = stdout.match(/[\d.]+/g);
  const letters = stdout.match(/[a-z]+/gi);
  console.log(
    `${kleur.blue("[tempo] Compile schema")} ${kleur.green("in")} ${kleur.blue(
      parseFloat(numbers).toFixed(1) + letters,
    )}`,
  );
  if (stderr) {
    console.error(kleur.red(`Error: ${stderr}`));
  }

  if (actions.ext === ".graphql" || actions.ext === "any") {
    const start = performance.now();
    const typeDefsTempPath = path.join(moduleTempDirPath, "typeDefs.graphql");
    const typeDefsPath = path.join(
      process.cwd(),
      "src",
      "node_modules",
      "@tempo",
      "typeDefs.js",
    );
    rimraf(typeDefsPath);
    const unmergedTypeDefs = fs.readFileSync(typeDefsTempPath, "utf-8");
    const typeDefs = mergeTypeDefs([unmergedTypeDefs]);
    const printedTypeDefs = print(typeDefs);
    fs.writeFileSync(
      typeDefsPath,
      `export const typeDefs = \`${printedTypeDefs}\``,
      "utf-8",
    );
    print_elapsed(start, "[tempo] Build type defs");
  }
}

export { buildSchemaAssets };
//# sourceMappingURL=index.es.js.map
