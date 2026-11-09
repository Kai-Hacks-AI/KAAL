# Architecture tree: Testing

## Proposed placement (an inventory, to be settled by the tree and not by guess)

Measured on `kaal/foundation` at 8ea2ef2 plus the boundary DO #1293. The branch is what the tree would derive from the leaf a Case verifies. Cross-cutting is not a Case property: it is a Requirement that leaves in both branches answer, and a Case that verifies two leaves is a Case to split. The first column of "Reading" says which of the two each Case is.

| Case | Targets | Where it sits today | Branch | Reading |
| --- | --- | --- | --- | --- |
| T23 to T26 | F1 to F3 | `02-requirements/functional/requirements.test.mjs` | Solution | one leaf |
| T27, T28 | N1, N2, N4 | `03-architecture/architecture.test.mjs` | Solution | one leaf (N2, no dependency, also has a Delivery leaf: see T62) |
| T31 | F15 | `03-architecture/architecture.test.mjs` | Solution | one leaf: the skill and the documents both ship; I had wrongly called it cross-cutting |
| T29, T30 | F14 | `05-src/skills/kaal-foundation/scripts/kaal-foundation.test.mjs` | Solution | one leaf |
| T50 | F25, F26 | `02-requirements/functional/declaration.test.mjs` | Solution | one leaf (A15) |
| T63 | F34, F35 | `02-requirements/functional/requirements.test.mjs` | Solution | one leaf |
| T54 to T61 | F34 to F37, N20, N22 | `04-test/engineering-check/publisher/boundary.test.mjs` | Solution | one leaf; they only need the built `dist/` |
| T62 | N21 | same file | Solution **and** Delivery | two leaves: scan imports (Solution) and `package.json` dependencies (Delivery). **Split** |
| T15 | F11, F13 | `publisher/capability.test.mjs` | Solution **and** Delivery | two leaves: the installed manifest (Solution) and "the committed manifest is the packed one" (Delivery). **Split** |
| T16 | F12, F17 | same file | Delivery (Packaging) | one leaf. The installed `npm test` ends on the verification line and every declared Case passes: the same for every package. Foundation's I16 (comply with kaal-packaging) relies on it by reference from Foundation's side, listed in A25. Its `tests` edge points at Packaging's own Requirement, never at I16, because Packaging does not know its customers (Owner, 2026-11-09). Governing capability kaal-packaging (L15); Engineering holds it until Packaging lands. Foundation-specific: nothing but the manifest's own Case list |
| T17 | F12, N10 | same file | Delivery (Packaging) **and** Solution | two leaves. Tamper detection (changed document, missing manifest, removed or undeclared Case give `cannot verify`) is generic: Delivery, Packaging. "A wrong library behind a matching manifest is `failed`" is Foundation-specific: A9, Foundation checks with the host's SHA-256, never its own library (Solution). **Split** |
| T18 | F14, N8 | same file | Solution **and** Delivery | two leaves: the command (Solution) and the declared bin through `npm exec` (Delivery). **Split** |
| T32 | F18 | `acquisition.test.mjs` | Delivery | one leaf |
| T33, T34 | F14, F19, N10 | `release.test.mjs` | Delivery | one leaf |
| T35, T36 | F20, F21, N11, N12 | `ownership.test.mjs` | Delivery | one leaf |
| T46 | F25, N16 | `declaration.test.mjs` | Solution **and** Delivery | two leaves: declaration bytes (A15, Solution) and the pack inventory and identity independent of version (Delivery). **Split** |
| T47 | F26, N15 | `declaration-consumer.test.mjs` | Delivery (Packaging) **and** Solution | two leaves. Normal pack keeps committed bytes and exact inventory, and an isolated consumer verifies every declared Case: generic, Delivery, Packaging. That the consumer resolves *Foundation's* owner Node (`kaal/Foundation.md`, A15) is Foundation-specific, Solution. **Split** |
| T48, T49 | F26, F27 | same file | Delivery | one leaf |
| T51 | F25 to F27, N15 | `test/acceptance/declaration-acceptance.test.mjs` | Requirement-level | F25 to F27 are answered in both branches (A15 Solution, A16 distribution Delivery), so this acceptance Case verifies a cross-cutting Requirement and is listed as such |
| no id | C1, C3, C5, manifest currency | `sha256.test.mjs`, `publication.test.mjs`, `verifier.test.mjs`, `manifest.test.mjs` | untitled | each gets the next free T-number and a `tests` edge in the tree DO (Owner, 2026-11-09), and is then placed by what it points at |

**Cross-cutting Requirements found so far** (the list the Architecture would carry): F11 and F13 (manifest: Solution reads, Delivery writes), F14 and N8 (command: Solution behaviour, Delivery bin), N2 (no dependency: scan and library imports, and `package.json`), F25 to F27 and N16 (declaration: Solution bytes, Delivery distribution and ownership).

**Placement of T16, T17 and T47 (Owner, 2026-11-09).** What they check is how any package is accepted, which is the same for every package, so it is Delivery and governed by kaal-packaging (L15). Engineering holds it as a workaround until Packaging lands, and a Packaging Requirement then replaces it. Foundation keeps only what is Foundation-specific: the host-SHA-256 check behind a wrong library (A9) and the resolution of its own owner Node (A15). The pack-and-install harness is then a Delivery matter and no Solution Case needs delivery machinery, so the question of a Solution Case pulled by the engineering suite does not arise. F17 and N10 are cited by T16 and T17 but defined nowhere; with this placement they are Packaging Requirements, and the DO retargets the Foundation-specific halves to F12 and A9.

One fixture in `capability.test.mjs` writes a fake Case named `foundation/T999` to prove that an undeclared Case is refused. It is not a Case, but it looks like one to a reader or a scanner, so the DO gives it the obviously fictitious id `foundation/TX-undeclared` (Owner, 2026-11-09), which can never collide with a real Case.

## Publisher's planned cases

`04-test/engineering-check/plan/architecture-tree.test.mjs` holds these planned cases. They are immutable to DO and CHECK. The DO moves the file unchanged to a `delivery/` folder beside the Architecture Node. They read the repository and the generated `dist/`; run `npm run build` first.

| Test | Loop | Checks | The state it must fail |
| --- | --- | --- | --- |
| foundation/T64 | Requirements | foundation/F38: `architecture.md` has exactly the branches Solution and Delivery (and Cross-cutting), and every Architecture element is defined under exactly one | Today's flat list of elements |
| foundation/T65 | Requirements | foundation/F39, foundation/N23: every Case title in the repository has an id and targets, every target is answered by an Architecture element, and a Case that verifies leaves in both branches either targets a listed cross-cutting Requirement or is refused as unsplit | Untitled Cases, no tree to trace into, and unsplit Cases such as T15, T18, T46 and T62 |
| foundation/T66 | Requirements | foundation/F40: no `04-test/*-check/` folder (apart from `plan/`) holds a `test(` call | The ~25 Cases held in `04-test/engineering-check/publisher/` |
| foundation/T67 | Requirements | foundation/F41: the build, run on a copy of the package that has a `delivery/` folder beside a Node, leaves it out of `dist/` | A build that copies every folder |
| foundation/T68 | Requirements | foundation/F42: `package.json` names no `.test.mjs` file in `test:publisher`; the engineering suite is collected | A hand-kept list of 20 test files |
| foundation/T69 | Architecture | foundation/N23: the Cross-cutting section lists exactly the Requirements and Intents that leaves in both branches answer, each with a reason, and the shipped `verify.json` lists no file from a `delivery/` folder | No Cross-cutting section |

No Defect exists in `06-defects/` today, so no Case about Defects can be RED. The DO adds the check that a Defect names exactly one Architecture element, with a fixture Defect, as a delivered or planned Case of its own.

All seven are expected RED today, each because the tree, the folders or the build rule do not exist. This is missing-deliverable evidence, not behavioural.

## The carrier of the pointers (foundation/F43): decided

The Owner ruled on 2026-11-09 that each Case carries a `tests` edge in its own YAML front matter, pointing at the Defect, Requirement, Intent or Architecture element it verifies. Suites are derived backwards ("who points at this?"). Today a Case's targets are only text in its title, `foundation/T<n> [<targets>]: …`, and no Case carries front matter, so foundation/T70 is RED. The DO adds the edge to every Case, then generates the manifest's `cases` and `model` and the suites from the edges. Left to the DO: the exact JavaScript form of the front matter (T70 accepts a leading `/*---` … `---` comment block or a plain `---` block).

## Soft-trying capabilities (Owner, 2026-11-09)

The placements above are the current best home. A Case or element can move when its owner capability lands, and the move is its own Change. foundation/A25 is where Architecture records such things, and foundation/F44 requires the list. No planned Case is added for F44 yet: its check is a section of the Architecture the DO writes, and the DO adds the Case with the section.

**Direction of edges.** For T16, T17 and T47 the Packaging halves, when they move to kaal-packaging, carry `tests` edges at Packaging's Requirements (F17, N10 and their kin) and Architecture only. A suite in Foundation's `04-test/` collects them by reference (from I16), as a suite collects any Case it relies on; until Packaging lands, the suite collects the Engineering-held copies. The Foundation-specific halves (A9, A15) keep edges at Foundation's own elements. No edge goes from a Packaging element to Foundation.
