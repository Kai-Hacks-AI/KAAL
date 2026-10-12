# KAAL
KHAIs Artificial Agent League

This repository engineers KAAL. What it distributes is the npm package `kaal-core`. Everything else here is engineering material that stays in the repository.

```
packages/kaal-core/    the distributable package: source, the foundational payload, unit tests, its own MIT LICENSE
engineering/           repository-only material: acceptance tests that pack, install and embed kaal-core
```

Only what `packages/kaal-core/package.json` lists under `files` is shipped (`dist/`, `payload/`, plus `package.json`, `README.md` and `LICENSE`). The acceptance suite checks the packed tarball itself.

## Build and test

```sh
npm install
npm run build             # compile kaal-core
npm test                  # unit tests
npm run test:acceptance   # pack, install into a fresh host, bootstrap .kaal/, operate it there
npm run pack              # write the tarball to engineering/out/
```

## Bootstrap exception

KAAL 0.0.1 is built without KAAL governance. The repository has no guardrails yet, and its correctness rests on ordinary tests and review. Nothing here seals Nodes or claims that they are immutable. Sealing is planned as the first additional capability in 0.0.2.
