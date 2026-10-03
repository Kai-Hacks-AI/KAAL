# KAAL
KHAIs Artificial Agent League

## Layout

TypeScript npm-workspaces monorepo. Each deployable unit is an npm package under `packages/`.

```
npm install
npm run build
npm test
```

To add a package, create `packages/<name>/` with its own `package.json` and `tsconfig.json` (extend `../../tsconfig.base.json`).

## Controls

Sealed `kaal-core` is protected by two different layers. They are independent and run as separate steps of the `controls` check in `.github/workflows/`.

KAAL controls are portable and work without Git: `npm test` proves semantic correctness (KNIFE), and `npm run check-kaal-seals` proves the current checkout's seals are intact.

Git controls supply memory and policy around Core and know only paths and diffs, never what a seal or a Node means: `.github/scripts/preserve-seals.sh` keeps every seal present on the target branch (new seals may be added), and `.github/scripts/isolate-kaal-core.sh` keeps a change that touches `packages/kaal-core/` or `engineering/kaal-core/` from changing anything outside them. `preserve-seals.sh` currently reads this repository's seal-record files, which a later change is expected to simplify.

A pre-commit hook (`.githooks/`, enabled by `npm install`) runs `npm run check-kaal-seals` early, for developer feedback only. CI is authoritative.
