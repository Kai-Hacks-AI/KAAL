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

`packages/kaal-core` produces the KAAL Kernel, deployed into `root/.kaal`. The smallest valid Kernel is one file, `.kaal/kernel.json`:

```json
{ "kaal": "kernel", "format": 1 }
```

`deploy(root)` writes it, `isKernel(root)` checks for it, `payload()` returns it as data.
