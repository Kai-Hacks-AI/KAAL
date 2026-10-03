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

Sealed `kaal-core` is protected by Git and GitHub controls that only know paths and diffs, never KAAL semantics. A pre-commit hook (`.githooks/`, enabled by `npm install`) runs `npm run check-kaal-seals` for quick local feedback. The `kaal-core controls` check in `.github/workflows/` is authoritative and has three separate steps: `npm run check-kaal-seals` (the checkout's seals are valid), preserve existing seals (every seal on the target branch is still recorded; new seals may be added), and isolate kaal-core (a change touching `packages/kaal-core/` or `engineering/kaal-core/` changes nothing outside them). Semantic correctness stays with `npm test`.
