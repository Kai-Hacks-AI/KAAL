# Consumer boundary: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A13** [foundation/F22, foundation/F23, foundation/N13, foundation/N14]: **One boundary module behind the command.** `lib/boundary.mjs` holds `check` and `boundary`. It imports only `node:` modules and `./sha256.mjs`. It is not a package export: its contract is the command and the last line, so `exports` stays `./sha256` and `./package.json`. `bin/kaal-foundation.mjs` keeps parsing arguments and nothing else (foundation/A10). It loads `lib/boundary.mjs` lazily, as it already loads `lib/sha256.mjs` (foundation/C9). So `verify` still reports on a damaged library and never crashes. The resolution of foundation/F23 is `createRequire(join(consumer, "package.json")).resolve("@kaihacksai/kaal-foundation/package.json")`, Node's public algorithm. The resolved copy's verification runs under `process.execPath` with `spawnSync` and no shell, as foundation/A10 already does.
- **foundation/A14** [foundation/F22, foundation/F23]: **Where it runs.** Foundation ships the check. The consumer, or the lane that verifies the consumer, runs it. Foundation never runs it against anyone:
  - **A consumer's own tests.** A package that depends on Foundation runs `boundary .` on its installed candidate, from its publisher's tests.
  - **Engineering's lane.** Engineering orchestrates Core-owned conformance (#607), so it can run `check` and `boundary` across packages. That includes packages that are not consumers, such as Guard today: `boundary` reports `not a consumer` honestly, and `check` still judges the digests they state.
  - **Packaging.** Packaging's conform may turn a KAAL `test/verify.json` into a list. That translation is Packaging's, because it knows the format. Foundation does not (foundation/N13).

## Sequence

| Order | Change | Depends on |
| --- | --- | --- |
| 1 | foundation/C13 PLAN, this Change | the Owner's ask (2026-10-31) |
| 2 | foundation/C14 DO: `lib/boundary.mjs`, the two commands, documents, skill, `AGENTS.md`, the manifest regenerated, delivered cases T43–T44, and T37–T42 GREEN and moved to `test/publisher/` | 1 |
| 3 | promotion `kaal/foundation` → `main` | 2, the coordinator's turn |
| 4 | publication of `@kaihacksai/kaal-foundation` 0.0.2 | 3, the Owner |

Adopting the boundary check in Graph, Core, Testing or Guard is each consumer's own Change. It is not part of this PLAN.
