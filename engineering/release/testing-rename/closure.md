# Testing scoped rename: active-reference closure and admission route

Date: 2026-11-02. Engineering response to Testing's request on C36 (#847). Read-only
inventory of main `f30221f481c4682e81b092e6a772365f3d7a9f6d`, produced by `git grep -I "kaal-testing"` and by reading
each manifest and the root lock. It is not the closure for Testing's own collector, which
holds newer Testing-owned content. Testing must re-run the same search on its collector
head before the DO and diff it against this list. Nothing here renames anything.

## Scope of the name

`kaal-testing` is four different things. Only the first is the npm identity.

1. The package name in `packages/skills/kaal-testing/package.json` (and the import specifiers and manifest entries that resolve to it).
2. The directory `packages/skills/kaal-testing`. It does not need to move for a scope rename; the root workspace entry and the lock's `packages/skills/kaal-testing` key are paths, not names.
3. The Skill and registration identifier: `kaal register skill kaal-testing ...`, the Agent Skill `skills/kaal-testing`, and the `holder: kaal-testing` strings in Core's registration tests. Core and Testing decide whether these keep their value; they are not changed by an npm rename on their own.
4. Prose that names the Skill or package.

## A. Manifest and lock entries (root and cross-owner: not Testing paths)

| Path | Entry | Kind |
| --- | --- | --- |
| `packages/skills/kaal-testing/package.json` | `"name": "kaal-testing"` | Testing |
| `packages/skills/kaal-change/package.json` | devDependencies `"kaal-testing": "0.0.1"` | Change |
| `packages/skills/kaal-graph/package.json` | devDependencies `"kaal-testing": "0.0.1"` | Graph |
| `package-lock.json` | `node_modules/kaal-testing` link entry (resolved `packages/skills/kaal-testing`) | root lock |
| `package-lock.json` | the Change and Graph workspace entries' devDependencies `kaal-testing` | root lock |
| `package-lock.json` | the `packages/skills/kaal-testing` workspace entry | root lock |
| `package.json` | workspace path `packages/skills/kaal-testing` | root; path only, unchanged by a rename |

No other manifest in the repository names it. `.github` and the `*.json` configs contain no reference, so no workflow selector uses the name. Kaal-core's `package.json` does not depend on it.

## B. Import specifiers by subpath (the public API consumers)

Counts of `kaal-testing/<subpath>` occurrences outside Testing: acceptance 12, attribution 8, duplicates 5, inventory 5, contracts 4, coverage 3, report 3, verifiers 2. Importing files:

- Engineering: `engineering/acceptance/embed.test.mjs`, `engineering/acceptance/execution.test.mjs`, `engineering/boundary.test.mjs` (its OUTSIDE list of allowed specifiers), `engineering/contracts/measure.mjs`, `engineering/coverage/measure.mjs`, `engineering/delivery/pack.mjs`, `engineering/delivery/pack.test.mjs`, `engineering/execution/test/plan/adoption.case.mjs`, `engineering/inventory/attribute.mjs`, `engineering/inventory/measure.mjs`, `engineering/lanes/acceptance.mjs`, `engineering/release/run.mjs`, `engineering/report/measure.mjs`.
- Change: `test/acceptance/packed.test.mjs`, `test/acceptance/skill.test.mjs`, `test/publisher/product.test.mjs`, `test/publisher/package-only.mjs`.
- Engineer Skill: `test/acceptance/engineer-skill.test.mjs`.
- Graph: `test/acceptance/graph.test.mjs`, `test/ownership.test.mjs`.
- Testing's own files that import the package name.

## C. Acquisition selectors (name-driven, will fail at runtime if missed)

`kaal-testing/acceptance`'s `install(names)` looks each name up in the run's manifest, which `engineering/delivery/pack.mjs` builds from `npm query .workspace`, i.e. from the workspace's declared `name`. A stale name throws "was not packed for this run". Name literals passed to it or to a packer: `engineering/acceptance/execution.test.mjs:30` (`install(["kaal-testing", "kaal-hosting"])`), and the loop in `packages/skills/kaal-change/test/publisher/package-only.mjs` that iterates `'kaal-core', 'kaal-testing', 'kaal-engineer-skill'`. Every other `install(...)` call installs a different package and imports Testing as a library.

## D. Frozen classification inputs (decisions, not edits)

- `engineering/execution/qualification/inspection.json` records `"package": "kaal-testing"`, `publicModule: "kaal-testing/duplicates"` and Testing paths, plus `README.md` row "kaal-testing@0.0.1". It is a pinned inspection of main #796; historical evidence is not rewritten. Engineering will classify it as frozen unless the Owner directs otherwise.
- `holder: kaal-testing` in Core registration tests (`packages/kaal-core/test/registration.test.ts`, `test/plan/registration.test.mjs`, `test/plan/structured.test.mjs`, `test/embed/intent.test.mjs`): Skill-holder identifiers, not the npm name. Core owns whether they change.
- Engineering prose that names the package: `GLUE.md`, `MOVE.md`, `RATS.md`, `boundaries/README.md`, `platforms/README.md`, `verification/README.md`, `research/representation.md`, `guard/change.md`, `packages/kaal-core/plan/love/architecture.md`, the Engineer Skill's README and SKILL.md. These can follow the rename in each owner's own Change and do not gate it.

## E. Admission route and lock derivation

The Owner selected Route A in PLAN #854: a target-held, single-use ledger entry admits one
atomic, bounded integration transaction under Change Isolation. The mechanism is delivered
inert in #862. Engineering coordinates the transaction; each owner keeps its own Change and
Change numbering, and this document introduces no shared product numbering.

For this rename:

- Testing gets its own, distinct, separately reviewed ledger entry. It is not the Foundation
  0.0.2 entry and is not part of the Hosting entry. Reusing the mechanism does not reuse an entry.
- The entry commits to the complete path set and the exact Git blob before and after of every
  path in sections A and B that changes: Testing's manifest and files, Change's and Graph's
  manifests and importing tests, Engineering's importers and selectors, and the root lock. The
  owners of those paths prepare their candidates; Engineering assembles the entry.
- Section D items are not in the entry unless their owner says so. The frozen inspection record
  stays frozen unless the Owner directs otherwise, and Core's holder identifiers are Core's decision.
- The old name cannot stay as a second workspace and an alias is excluded, so the transaction
  must be atomic. That is why this transition needs an entry rather than staged compatibility.
- Until the entry is merged into the target, Testing edits only Testing-owned paths, as Testing states.

The lock is derived twice from immutable target bytes and all candidate manifests with C16's
helper, then checked by clean `npm ci` and a packed install of Change, Graph and Engineer Skill
with the scoped Testing. A hand-edited or copied lock does not qualify.

## F. Independent verifier harness for interoperability evidence (Testing step 4)

Planned in #859 against Testing's contract in #858. It reuses Testing's consumer-verification
contract and Packaging's package conformance for the shared parts; the harness adds only the
independent, built-ins-only check of the packed scoped tarball. Not yet implemented.
