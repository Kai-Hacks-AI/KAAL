# AGENTS.md

Instructions for an Agent engineering KAAL in this repository.

- `packages/kaal-core/` is the only distributable package. Its source is in `src/`, its unit tests are in `test/`, and the payload every Engine is built from is in `payload/`. Only `dist/` and `payload/` ship.
- `packages/kaal-core/payload/` is the authoritative KAAL content: `KAAL-KERNEL.md`, the Core Nodes in `core/`, and the installed Engine's own `AGENTS.md`. Read the Kernel before changing a Node. Any edit to a Node changes its id and the ids of the Nodes typed by it, so update their type references and the pinned ids in `test/core.test.ts` together.
- `engineering/` is repository-only. Its acceptance tests pack the real tarball, install it into a fresh host, and operate the Engine there.
- Before proposing a change, run `npm install`, `npm test` and `npm run test:acceptance`.
- Do not modify `.github/`.
