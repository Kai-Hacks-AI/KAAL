# Release Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A7** [hosting/F15, hosting/F16] (Option A below, as `core/A36` proposes on #622): the rename and every reference to the old name land in one PR into `kaal/hosting`. A rename cannot be split from its importers without breaking the workspace, so each importer's owner reviews that PR, and it changes nothing in their files beyond the reference. The importers today are Graph, Core, Testing, the Engineer skill and Engineering, and the root `package.json` lanes. Hosting's own planned tests of `hosting/C1`–`hosting/C8` change their import specifier only; that is the one edit `hosting/C11` makes to them.

  A throwaway rename, made for this PLAN and not committed, found six files where swapping the quoted name alone is not enough, because the new name sorts, hashes, nests or appears outside quotes. `hosting/C11` makes the smallest adjustment in each and names it in its PR for that owner's review:
  - `engineering/boundary.test.mjs`, `packages/kaal-core/test/boundary.test.ts` and `engineering/lanes/evidence.test.mjs` compare sorted lists, and `@kaihacksai/kaal-hosting` sorts first.
  - Testing's `evidence.kaal.json` pins the bytes of its `test/boundary.test.mjs`, so that digest changes with the specifier.
  - `engineering/lanes/evidence.test.mjs` uses the workspace name as a lane name, and its helper keys captures by their first directory, which a scoped name nests under `@kaihacksai/`. The lane itself already captures the scoped `@kaihacksai/kaal-foundation`.
  - The Engineer skill's `test/check-skill.test.mjs` expects the import rendered as `{ read } from kaal-hosting`, without quotes.
  - Core's `test/plan/record.test.mjs` refuses `from "kaal-hosting"` by a regular expression. Left alone, it would pass vacuously once the specifier changes, so it must name the new one.

  With those six, the throwaway rename turned hosting/T21–T24 GREEN, and `test:hosting`, `test:kaal` and `test:engineering` passed.

  The Owner accepted Option A on #629 with two conditions, which bind `hosting/C11`:
  - It changes only reference-level importer mechanics: the reference itself, and where a test depends on the name, the smallest change that keeps that test discriminating. It changes no behaviour, no other assertion and no test's meaning.
  - Each affected owner reviews its own files explicitly. The PR lists every changed file under its owner, and it asks each owner's thread for review. It merges only once each owner has answered for its own files.

- **hosting/A8** [hosting/F17]: Hosting verifies its packed consumer experience in its own planned test, `test/plan/release.test.mjs`, in Hosting's lanes on Linux, Windows and macOS. It packs and installs through Hosting's own `execute`, from Hosting's build, so it depends on no other KAAL package: Testing's acceptance helpers depend on Hosting and cannot be used here. The installed package is reached by the consumer only through its name.

- **hosting/A9** [hosting/F18, hosting/F19, hosting/F20, hosting/N4]: Product and publisher stay apart inside the package directory.
  - **What ships.** `docs/` is the authoritative product contract. `test/acceptance/` holds one file per outer loop (`intent`, `requirements`, `architecture`) and a harness that resolves the package under test by name; `test/unit/` holds the Code loop. `test/verify.mjs` is the entry and `test/verify.json` the manifest the publisher generates from the cases' titles and the tables in `docs/testing.md`.
  - **What does not ship.** `plan/` stays the record of the PLAN Changes, `src/` the TypeScript source, and the publisher's own tests (the fault-injecting ones, the tests of the verification itself and these planned release tests) stay under `test/` outside the shipped paths.
  - **Scripts.** `test` runs `node test/verify.mjs`. `test:publisher` builds and runs everything the Hosting lanes run today plus the delivered cases from the source tree. The root `test:hosting` lane and `engineering/lanes/hosting.mjs` switch to `test:publisher`, which is Engineering's to review, as Core's `test:publisher` is on #622.
  - **Lanes.** The publisher packs the candidate and runs the consumer verification in a fresh consumer in each of Hosting's Linux, Windows and macOS lanes (hosting/T26), so a release candidate is verified on all three hosts before the Owner's go.
- **hosting/A10** [hosting/N4, hosting/F21–hosting/F25] (Option A below, accepted by the Owner on #629): Hosting realizes the verification in its own `test/verify.mjs`, from Node's built-ins, with the same three results, summary line and manifest shape as Guard's. It copies no Guard file at run time and depends on no Guard or Testing package.
- **hosting/A11** [hosting/F26] (Owner's clarification on #629): Responsibilities stay apart. Hosting owns its tests and its execution adapter, the package-local `test/verify.mjs` behind `npm test` on `node:test`. Duplicating the verifier code is accepted. Testing owns the result and evidence semantics and the conformance cases. Packaging owns the package entrypoint convention. Engineering checks each installed package's verifier against Testing's conformance cases in its own Change, requested on #625. Hosting does not define those cases. It proposes the minimum set in hosting/F26, from what its own cases already exercise, and its verifier must pass them.

## Options considered for hosting/A7

The Owner's answer on #622 (comment 6503689689, `core/A36`) decides this. `hosting/C11` follows it.

| Option | What happens | Cost |
| --- | --- | --- |
| **A. One rename PR updates every reference** (proposed, as `core/A36`) | `hosting/C11` renames Hosting and updates every specifier, dependency entry, workspace selector and lockfile entry that names it, and nothing else. Each affected owner reviews. | One PR touches other owners' files, by the reference only. |
| B. One coordinated PR per importer | Each owner updates its own references in its own PR. | None of them can merge alone without breaking the workspace, so they merge as a set. |
| C. Keep the old name as an alias | A compatibility package `kaal-hosting` re-exports the new one. | A shim, which KAAL does not keep. |

## Options considered for hosting/A10

| Option | What happens | Cost |
| --- | --- | --- |
| **A. Hosting's own entry, Guard's semantics** (proposed) | Hosting ships its own `test/verify.mjs`, as Guard does (guard/N13), with no dependency. | A second implementation of the same semantics, each owned and tested by its package. |
| B. A shared verifier from Testing | Hosting depends on a Testing package that ships the entry. | Testing's 0.0.1 plan (#601) ships host-free modules only and no verifier, and Testing depends on Hosting, so this would be a cycle. |
| C. Rename now, product bar later | hosting/C12 is left out of this PLAN. | Hosting would be published with no consumer verification, below Guard's bar, which the Owner raised on #629. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C10` PLAN: I5–I7, F15–F26, N4, A7–A11; hosting/T21–T31 | Hosting | `hosting/C9`, and the Owner's alignment on #622 and #629 |
| `hosting/C11` DO: the rename, every reference, and hosting/T21–T24 in Hosting's lanes | Hosting | `hosting/C10`, and the Owner's answer on A7 |
| Testing's conformance cases for consumer verifiers (hosting/F26) | Testing | the Owner's review on #629 |
| Engineering's independent check of each installed package's verifier against them (#625) | Engineering | Testing's conformance cases |
| `hosting/C12` DO: `docs/`, the delivered cases, `test/verify.mjs` and its manifest, `test:publisher`, and hosting/T25–T31 in Hosting's lanes | Hosting | `hosting/C11` |
| Hosting's verifier passes that check | Engineering, Hosting | `hosting/C12`, Engineering's check |
| Graph PLAN and DO: rename to `@kaihacksai/kaal-graph` (`core/C28` row 7) | Graph | `hosting/C11` |
| `core/C29` DO: rename to `@kaihacksai/kaal-core` (`core/C28` row 10) | Core | `hosting/C11`, Graph's DO |
| promotion of `kaal/hosting`, and publication of `@kaihacksai/kaal-hosting` 0.0.1 | Owner | `hosting/C12` |
