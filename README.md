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
