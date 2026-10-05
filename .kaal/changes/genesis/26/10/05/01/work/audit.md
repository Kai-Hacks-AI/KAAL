# The sealing landscape, and who owns each piece

Audited on `kaal/genesis` at 6ca51a7, before Sealing was born. "Owner" is the answer to: if this changed, whose decision would it be?

## Node domain

| piece | where | owner | outcome |
|---|---|---|---|
| Node identity: SHA-256 of exact bytes | `packages/kaal-core/src/nodes.ts` | Core (Node domain) | stays; `registerSkill` and `admit` need it before any Skill exists |
| Admission requires the candidate's own seal | `nodes.ts` `admit()` | Core | stays |
| `seals/<Node-ID>` namespace | `.kaal/seals/`, `packages/*/kaal/seals/`, `packages/kaal-core/artifacts/seals/` | Core | unchanged |
| Create a Node seal | `engineering/kaal-core/helpers/seal.ts` (`sha256`, `writeSeal`), `seal-kaal-artifact`, `seal-kaal-bootstrap` | Core bootstrap | stays: Sealing's own Node was sealed by `seal-kaal-artifact`, so the way to seal a Node cannot depend on Sealing |
| Verify Node seals, Kernel genesis seal | `check-kaal-seals`, `bootstrap.ts` | Core bootstrap | stays |

The bootstrap minimum is therefore: SHA-256 of bytes, an empty marker named by it, the Kernel's genesis check, `admit`, the `Skill` Node and `registerSkill`. None of it is a general sealing capability; it is what has to exist before any Skill can be installed. One mechanic is duplicated on purpose: writing an empty marker file named by an ID (`writeSeal`, and Sealing's `seal write`). It is one line, and removing the duplicate would make bootstrap depend on what it bootstraps.

## Change domain

| piece | where | owner | outcome |
|---|---|---|---|
| What a Change is, and its identity parameters (`KAAL Change v1`, root name excluded) | `engineering/change-seal/helpers/change-id.ts` | Changing KAAL (domain) | stays decided there, now only as parameters |
| How a tree is hashed | the same file, before this Change | Sealing | moved: `packages/sealing/skills/sealing/scripts/tree-id.mjs` is the one definition |
| Seal marker mechanics | `changes.ts` (`mkdir`, empty file, listing) | Sealing | moved: `seal.mjs` |
| Where Change seals live: `seals/changes/<ID>` | `changes.ts` | Changing KAAL | unchanged |
| Closure, when a Change must be sealed | `process.ts`, `seal-kaal-work`, `close-kaal-change` | Changing KAAL | stays in `engineering/change-seal` (see below) |

## Named tree and work/

`KAAL Tree v1` (root name + relative paths + bytes, parent excluded) is a parameter of the same tree identity (`--named`), not a second algorithm. `work/` is its first consumer; its seals live in `seals/trees/<ID>`. This namespace is not Work-specific, so Work does not become a permanent artifact concept.

## Seal storage, discovery, installation

Three namespaces, none reorganised: `seals/<Node-ID>`, `seals/changes/<ID>`, `seals/trees/<ID>`. `kaal-install` treats the second and third as genuine installed state and still judges the first. Discovery of Change seals is `list-sealed-changes`.

## Repository controls (consumers)

- `preserve-sealed-changes` consumes `npm run list-sealed-changes` and compares IDs; it hashes nothing. Good, and it needs no change: the command names did not change.
- `preserve-seals` reads Core's `artifacts/seals/` and legacy record files. It does not watch Skill Nodes' seals (`packages/*/kaal/seals/`) or `.kaal/seals/`. A gap, not fixed here.
- Nothing watches `seals/trees/`. Until a Change is closed, its Work seal is protected only by `check-kaal-changes`, which is not a required check; after closing, the Change seal covers the tree but not the marker. A gap, not fixed here.
- `.github/scripts/preserve-sealed-changes.test.sh` drives `engineering/change-seal/dist/helpers/cli.js` by path. That is why the process machinery stays in `engineering/change-seal` and was not relocated beside Changing KAAL: moving it would need a `.github` bridge PR, for no change in who decides what.

## What did not need to move

Core: no change. Nothing in Core is a general sealing capability that merely bootstrapped first. `check-kaal-seals` and the hook stay as the bootstrap check.

## Open points for Kai

1. `.github` follow-ups (isolated PRs): preserve Skill Node seals; protect `seals/trees/`; make `check-kaal-changes` a control. Not required for this Change.
2. `KAAL Change v1` stays as is. Whether Change v2 should include the root name is undecided and not raised.
