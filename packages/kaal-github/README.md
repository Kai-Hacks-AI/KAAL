# kaal-github

The GitHub integration for KAAL, as an npm package. It is a KAAL Extension: its one Node, `GitHub` (typed by Core's `Extension`), is delivered in `kaal/` and registered with an installed KAAL through `kaal-core`'s `registerExtension()`, which places it under `extensions/kaal-github/` of the KAAL directory.

The dependence runs one way: a GitHub workflow (or a Git hook) invokes this package, and the package asks KAAL's own commands (`npm run -s check-kaal-admission` and the like) across a process boundary. KAAL knows nothing of Git or GitHub, and this package imports nothing of KAAL. The package reads the Git baseline and the diff; KAAL decides whether a Change is valid.

- `src/cli.ts`: `kaal-github <control> <target-ref>`, exit 0 (holds), 1 (violated), 2 (misuse). Controls: `isolate-boundaries`, `contain-change`, `preserve-sealed-changes`, `preserve-seals`.
- `src/controls.ts`: the controls. Its one rule of its own is which repository paths may only be changed alone (`packages/kaal-core`, `engineering/kaal-core`, `.github`); everything about Changes and seals is delegated to KAAL.
- `hooks/pre-commit`: the Node pre-commit hook, running `check-kaal-seals`. It is a local convenience; CI is authoritative. The root `prepare` script points `core.hooksPath` here.

The public API is `payload()`, returning `{ kaal }` as files keyed by path. Needs Node.js 20 or later and git. Build and test: `npm ci && npm test`. Tests live beside the implementation; the KAAL-backed ones run against this repository's real `.kaal` and root commands.
