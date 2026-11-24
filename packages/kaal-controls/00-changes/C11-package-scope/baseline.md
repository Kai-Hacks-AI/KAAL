# C11 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` at `71394da4ccd1b915ffe8090717f3b5baabbfe871` holds `packages/kaal-controls/` with `"name": "kaal-controls"`, private, version 0.0.1, `files` holding only `skills`. The package is not published.
- Other KAAL packages are scoped (for example `@kaihacksai/kaal-guard`). Kai's rule of 16 Nov 2026: a package that is not scoped is renamed the next time a Change works on it.
- Nothing in the repository refers to the package by its npm name except the Case T13.
