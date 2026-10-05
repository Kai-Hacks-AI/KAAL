# The sealing landscape, and who owns each piece

Audited on `kaal/genesis` at 6ca51a7, before Sealing was born; revised after review (general identity grammar, private Core bootstrap sealing). "Owner" is the answer to: if this changed, whose decision would it be?

## Node domain

| piece | where | owner | outcome |
|---|---|---|---|
| Node identity: SHA-256 of exact bytes | `packages/kaal-core/src/nodes.ts` | Core (Node domain) | stays; `registerSkill` and `admit` need it before any Skill exists |
| Admission requires the candidate's own seal | `nodes.ts` `admit()` | Core | stays |
| `seals/<Node-ID>` namespace | `.kaal/seals/`, `packages/*/kaal/seals/`, `packages/kaal-core/artifacts/seals/` | Core | unchanged |
| Create a Core Node seal | Core's private `packages/kaal-core/src/bootstrap.ts` (`sealNode`, `writeSeal`), reached by `engineering/kaal-core/helpers` through the built file | Core bootstrap | lifted into `kaal-core` as private machinery, before Sealing: not exported, not a general sealing API. `sealNode` works on Core's own `payload()` artifacts only and cannot seal a Skill's Node |
| Birth of a Skill's first Node | the repository's `seal-kaal-artifact` helper (engineering) | explicit bootstrap exception | Sealing's own Node was sealed this way, since the general Sealing capability cannot seal its own birth. It is a deliberate path outside Sealing and outside Core's `sealNode`, and Core-private sealing is not widened to cover it |
| Verify Node seals, Kernel genesis seal | `check-kaal-seals`, Core's `checkBootstrap` | Core bootstrap | stays, now beside what it checks |

The bootstrap minimum is therefore: SHA-256 of bytes, an empty marker named by it, the Kernel's genesis check, `admit`, the `Skill` Node and `registerSkill`. None of it is a general sealing capability; it is what has to exist before any Skill can be installed, and it covers Core's own artifacts only. Two mechanics are duplicated on purpose: hashing bytes and writing an empty marker named by an ID (Core's `sha256`/`writeSeal`; Sealing's bare-bytes `artifact-id` and `seal write`). Each is a line or two, and removing the duplicate would make Core depend on what it bootstraps (Core -> Sealing -> Core).

**After birth, do non-Core Skill Nodes use general Sealing?** Yes, as guidance, not as a rule Core enforces: once Sealing is installed, sealing a later Skill Node is `artifact-id` (bare bytes) plus `seal write`. Core's private sealing stays the path for Core's own Nodes only, and Sealing's own birth is the one exception where a Skill Node had to be sealed by the explicit bootstrap helper. Pointing Engineering KAAL Skill at Sealing is a possible follow-up, not part of this Change.

## Change domain

| piece | where | owner | outcome |
|---|---|---|---|
| What a Change is, and its identity parameters (`KAAL Change v1`, root name excluded) | `engineering/change-seal/helpers/change-id.ts` | Changing KAAL (domain) | stays decided there, now only as parameters |
| How a directory is hashed | the same file, before this Change | Sealing | moved: `packages/kaal-sealing/skills/kaal-sealing/scripts/artifact-id.mjs` is the one definition, covering all four forms |
| Seal marker mechanics | `changes.ts` (`mkdir`, empty file, listing) | Sealing | moved: `seal.mjs` |
| Where Change seals live: `seals/changes/<ID>` | `changes.ts` | Changing KAAL | unchanged |
| Closure, when a Change must be sealed | `process.ts`, `seal-kaal-work`, `close-kaal-change` | Changing KAAL | stays in `engineering/change-seal` (see below) |

## Named tree and work/

Sealing's identity is one grammar: {file, directory} by {unnamed, named}, parent and location always excluded, the domain choosing the form and separating kinds. `KAAL Tree v1` (root name + relative paths + bytes) is the named directory form (`--named`), not a second algorithm; `KAAL Change v1` is the unnamed directory form. `work/` is its first consumer; its seals live in `seals/trees/<ID>`. This namespace is not Work-specific, so Work does not become a permanent artifact concept.

## Seal storage, discovery, installation

Three namespaces, none reorganised: `seals/<Node-ID>`, `seals/changes/<ID>`, `seals/trees/<ID>`. `kaal-install` treats the second and third as genuine installed state and still judges the first. Discovery of Change seals is `list-sealed-changes`.

## Enforcement outside KAAL

Whatever enforces seals from outside KAAL is a consumer: it reads seal markers and Change IDs through the existing commands and hashes nothing itself, so it decides nothing about identity. The command names did not change, so it needs no change. The process machinery stays in `engineering/change-seal`, where consumers already find it; moving it would change nothing about who decides what.

## What did not need to move

Core: no change. Nothing in Core is a general sealing capability that merely bootstrapped first. `check-kaal-seals` stays as the bootstrap check.

## Open points

1. Whether enforcement outside KAAL should also cover Skill Nodes' seals and the named-tree seals. Not required for this Change.
2. `KAAL Change v1` stays as it is. Whether a later Change identity should include the root name is undecided and not raised.
