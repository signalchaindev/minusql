# Editing Utils

The .js files are generated by Rollup. Only edit the .ts files.

This also means any editable file must have a .ts extension. Otherwise it will be overwritten or cause the watcher to get into a loop.

Why not use a dist folder and eliminate the confusion? Node's resolution algorithm, NPM's package export configuration, ESM vs. CJS ... sheeesh!

If this bothers you, PR's welcome :)