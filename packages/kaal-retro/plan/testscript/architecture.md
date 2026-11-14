# Architecture (retro/C3)

One line in `package.json`: `pretest` builds kaal-core by path (`npm run build --prefix ../kaal-core`) instead of by workspace name. `test` is unchanged. The new Case lives in `test/plan/testscript.test.mjs` and is not part of the package `test` script, so running the script does not run the Case that runs the script.

The path assumes the package sits beside kaal-core in `packages/`, which holds in this repository. The package is not installed or published, so no consumer meets the path.
