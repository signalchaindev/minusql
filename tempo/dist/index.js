'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var util = require('util');
var child_process = require('child_process');
var perf_hooks = require('perf_hooks');
var kleur = require('kleur');
var merge = require('@graphql-tools/merge');
var graphql = require('graphql');
var os = require('os');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var child_process__default = /*#__PURE__*/_interopDefaultLegacy(child_process);
var kleur__default = /*#__PURE__*/_interopDefaultLegacy(kleur);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);

function rimraf(entry_path) {
  if (!entry_path) {
    throw new Error(kleur__default['default'].red("rimraf requires a path to a directory or file"))
  }

  if (!fs__default['default'].existsSync(entry_path)) {
    return
  }

  const stats = fs__default['default'].statSync(entry_path);

  if (stats.isDirectory()) {
    fs__default['default'].readdirSync(entry_path).forEach(entry => {
      rimraf(path__default['default'].join(entry_path, entry));
    });

    fs__default['default'].rmdirSync(entry_path);
    return
  }

  fs__default['default'].unlinkSync(entry_path);
}

/**
 * @param {number} start
 * @param {string} msg
 */
function print_elapsed(start, msg) {
  const end = perf_hooks.performance.now();
  let elapsed = end - start;
  let unit = "ms";
  if (elapsed >= 1000) {
    elapsed = elapsed * 0.001;
    unit = "s";
  }
  console.log(
    `${kleur__default['default'].blue(msg)} ${kleur__default['default'].green("in")} ${kleur__default['default'].blue(
      elapsed.toFixed(1),
    )}${kleur__default['default'].blue(unit)}`,
  );
}

const binName = "tempo";
const binBuildDir = path__default['default'].join(process.cwd(), ".bin");
const packageDir = path__default['default'].join(process.cwd(), "src", "package");
const moduleBinDir = path__default['default'].join(
  process.cwd(),
  "node_modules",
  "tempo",
  ".bin",
);
const moduleBuildDir = path__default['default'].join(process.cwd(), "src", "node_modules");
const modulePackageDir = path__default['default'].join(
  process.cwd(),
  "node_modules",
  "tempo",
  "src",
  "package",
);
const moduleTempDirPath = path__default['default'].join(
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

const goos = PLATFORM_MAPPING[os__default['default'].platform()];
const goarch = ARCH_MAPPING[os__default['default'].arch()];
const subDir = `${goos}-${goarch}`;

const exec = util.promisify(child_process__default['default'].exec);

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
      cwd: path__default['default'].join(moduleBinDir, subDir),
    },
  );
  const numbers = stdout.match(/[\d.]+/g);
  const letters = stdout.match(/[a-z]+/gi);
  console.log(
    `${kleur__default['default'].blue("[tempo] Compile schema")} ${kleur__default['default'].green("in")} ${kleur__default['default'].blue(
      parseFloat(numbers).toFixed(1) + letters,
    )}`,
  );
  if (stderr) {
    console.error(kleur__default['default'].red(`Error: ${stderr}`));
  }

  if (actions.ext === ".graphql" || actions.ext === "any") {
    const start = perf_hooks.performance.now();
    const typeDefsTempPath = path__default['default'].join(moduleTempDirPath, "typeDefs.graphql");
    const typeDefsPath = path__default['default'].join(
      process.cwd(),
      "src",
      "node_modules",
      "@tempo",
      "typeDefs.js",
    );
    rimraf(typeDefsPath);
    const unmergedTypeDefs = fs__default['default'].readFileSync(typeDefsTempPath, "utf-8");
    const typeDefs = merge.mergeTypeDefs([unmergedTypeDefs]);
    const printedTypeDefs = graphql.print(typeDefs);
    fs__default['default'].writeFileSync(
      typeDefsPath,
      `export const typeDefs = \`${printedTypeDefs}\``,
      "utf-8",
    );
    print_elapsed(start, "[tempo] Build type defs");
  }
}

exports.buildSchemaAssets = buildSchemaAssets;
//# sourceMappingURL=index.js.map
