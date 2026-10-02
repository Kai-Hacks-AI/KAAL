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

## kaal-core

`packages/kaal-core` produces the KAAL Kernel payload, which belongs in `root/.kaal`. The payload is one file, `kernel.json`:

```json
{ "kaal": "kernel" }
```

`payload()` returns it as data, keyed by path relative to `.kaal`. Installing it is not kaal-core's concern.
