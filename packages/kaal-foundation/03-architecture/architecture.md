# Architecture

Foundation's Architecture is a small forest (foundation/I15). Every element is placed by two questions in order: ours or not ours, then Delivery or Solution. The ours trees are the two branches below; the not-ours trees are held here, indexed by foundation/A25, until their owner lands. Each element states, in brackets, the Requirements and Intents it answers.

## Solution

What ships in the package.

- **foundation/A1** [foundation/I1, foundation/N1, foundation/N2]: **Position.** Foundation and Hosting are siblings at the bottom of KAAL's packages. Neither depends on the other or on anything above.

- **foundation/A7** [foundation/I1, foundation/I2, foundation/I3, foundation/I7, foundation/I14, foundation/F1, foundation/F2, foundation/F3, foundation/F14, foundation/F15, foundation/F16, foundation/F18, foundation/F20, foundation/F34, foundation/F37, foundation/N1, foundation/N2, foundation/N3, foundation/N4, foundation/N7, foundation/N8, foundation/N9]: **Layout of what ships.**

  | Path in the package | Role |
  | --- | --- |
  | `01-intent/`, `02-requirements/`, `03-architecture/`, `06-defects/` | the Nodes of the Foundation graph, each loop with its Test Cases beside the Nodes. They ship under `dist/docs/`. |
  | `05-src/skills/kaal-foundation/scripts/sha256.mjs`, `sha256.d.ts` | `@kaihacksai/kaal-foundation/sha256`, plain ESM with no build step. A consumer imports only the concern it uses. |
  | `05-src/skills/kaal-foundation/scripts/kaal-foundation.mjs` | the `kaal-foundation` command |
  | `05-src/skills/kaal-foundation/` | the skill (`SKILL.md`) and its `references/` (limitations, operations) |
  | `kaal/Foundation.md` | the owner declaration |
  | `*.test.mjs` beside a Node | the delivered cases, each titled `foundation/T<n> [<targets>]: …`. They ship beside the Nodes in `dist/` |
  | `04-test/package-check/` | the verification (`verify.mjs`, which imports only Node's built-in modules and the temporary `collect.mjs`), the manifest `verify.json` (every other shipped file with its SHA-256, the delivered cases, and the cases as a Testing model) and `testing.md` |

- **foundation/A9** [foundation/F11, foundation/F12, foundation/F13, foundation/N10, foundation/I7]: **An independent check.** Foundation's own `sha256` wrote the manifest before the package was packed. The verification checks it with the host's SHA-256, never with Foundation's own library, so a broken library cannot hide itself.

- **foundation/A15** [foundation/F20, foundation/F25, foundation/F26, foundation/N16, foundation/I10]: `kaal/Foundation.md` (shipped as `dist/kaal/Foundation.md`) is the one owner declaration.
  `./capability` exposes that file as data. It needs no loader or generated copy;
  its bytes participate in the existing committed manifest and delivered Case.

- **foundation/A16** [foundation/F26, foundation/F27, foundation/I10]: Foundation's package owns declaration bytes and distribution.
  Core owns explicit registration and Engine lifecycle. No Foundation-owned
  installation record or automatic registration hook exists in this delivery.

- **foundation/A19** [foundation/F34, foundation/N20, foundation/N22, foundation/I14]: **One definition, no script, targets as arguments.** `04-test/boundary-check/boundary-check.md` holds Foundation's three Boundary Tests as typed data in its front matter, and the record below it. It is not a package export and not a `bin`, and Foundation ships no scanner and no YAML parser: parsing, traversal, the typed detectors (`file-identity`, `token-sequence`, `call-with-literal`) and reporting are Engineering's Boundary Engine (`engineering/boundary/`). `scripts/kaal-foundation.mjs` is unchanged, and there are no `check` or `boundary` commands. The tests are data in the definition. Targets are never.

- **foundation/A20** [foundation/F36, foundation/I14]: **Where it runs, and who decides.** Foundation ships the definition. Whoever promotes a package, or the repository's own lane, gives it to the Boundary Engine and names the packages and the repository as targets. Foundation never runs it against anyone. The engine reports and Foundation ships no finding list. A finding is audit, held by Engineering; the repository records its decisions about findings against the finding `id` and `digest`, with the deciders its own role mapping names. Packaging may read the finding list later (its C23 reads only `id`, references and line digest); nothing here depends on Packaging.

- **foundation/A21** [foundation/F35, foundation/N21, foundation/I14]: **The engine's output shape.** The evidence line, the per-line finding and the exit codes 0 and 2 are the Boundary Engine's, one shape for every provider. The id prefix is the provider's own (`Foundation`), and the tests are Foundation's. Each test carries a `tests` edge and a `ships` flag, so it can become a Boundary Case of BEST when Testing is embedded; until then Engineering's Case adapter is provisional.

## Delivery

How it is built, packed, published, accepted and checked. It never ships.

- **foundation/A6** [foundation/F4, foundation/F7, foundation/F9, foundation/F17, foundation/N6, foundation/N2, foundation/I4, foundation/I6]: **The delivered layout and the scripts.** `files` is `["dist"]`; `npm` adds `package.json`, `README.md` and `LICENSE`. `dist/` is built by `04-test/engineering-check/build.mjs` and holds the Nodes, their delivered Cases, the skill, the declaration, the verification and the Boundary Check. `npm test` builds `dist/` first in source and runs `dist/test/package-check/verify.mjs`; `npm run test:publisher` runs the publisher's Cases. Plans, the publisher's Cases and `00-changes/` never ship. The delivered Cases are plain `node:test` files that import the package by its name, so they exercise whichever copy is installed.

- **foundation/A26** [foundation/F11, foundation/F13, foundation/F14, foundation/F17, foundation/F25, foundation/F26, foundation/F27, foundation/N2, foundation/N8, foundation/N15, foundation/N16, foundation/F4, foundation/F19]: **How it is built, packed and accepted (Delivery layout).** What does not ship, and how the shipped parts are made and checked.

  | Path in the package | Role |
  | --- | --- |
  | `04-test/engineering-check/` | the build, the collector (`collect.mjs`, which runs every publisher Case without a hand-kept list) and the publisher's tests. Never shipped |
  | `dist/` | the only thing shipped (`files: ["dist"]`), built by `04-test/engineering-check/build.mjs` as byte-for-byte copies of the folders above. It is not committed. |
  | `npm test` | in source it builds `dist/` first (`pretest`) and then runs `dist/test/package-check/verify.mjs`, exactly as in an installed package. |

  The manifest generator writes `verify.json` (the installed verification only reads it); the declared `bin` is run through `npm exec` by the acceptance Cases; the committed manifest is the packed one.

- **foundation/A27** [foundation/I8, foundation/F21, foundation/N11, foundation/N12, foundation/N16]: **The repository ownership claim.** `ownership.kaal.json` at the package root is the repository's claim over `packages/kaal-foundation/`. It never ships and claims only that path; it is how the repository knows the location is Foundation's own. The authoritative Node it names, `kaal/Foundation.md`, ships (foundation/A15).

- **foundation/A28** [foundation/I1, foundation/I2, foundation/I7, foundation/I14]: **The publisher's outer checks of the shipped parts.** Before release the publisher checks the shipped parts from the repository: the library's digests, its imports, the boundary definition, the verifier's behaviour and the Capability Node. These checks run from the repository (they import its workspace, read its files or pack it) and are never installed, so they never ship; the installed verification (foundation/A9) is the copy that does. A Case that checks a shipped part from outside names this element beside the Requirements it covers, and so is Delivery.

- **foundation/A22** [foundation/F38, foundation/F39, foundation/N23, foundation/I15]: **The forest, and the two questions.** Every node is placed first by ours or not ours, then by Delivery or Solution. The ours trees live in one file. `03-architecture/architecture.md` holds `## Solution`, `## Delivery` and `## Cross-cutting`, in that order. The first two hold the leaves; the third lists the Intents and Requirements that leaves in both branches answer. Existing elements are placed by the rule in `testing.md` ("Proposed placement"): A1, A7 (the shipped rows), A9, A15, A16 and A19 to A21 under Solution; the build, the manifest generator, the pack and publication path and the ownership claim under Delivery. No element is renamed; only its place changes.

- **foundation/A23** [foundation/F40, foundation/F42, foundation/F43, foundation/N24, foundation/I15]: **One computed graph.** Engineering's Case graph computer reads each Case file's front matter (`tests`, `ships`), each Case's title and this Architecture, and writes `04-test/engineering-check/cases.json`: for each Case file, whether it ships and which Cases it holds, and for each Case its targets and branch. `verify.mjs` pulls the Cases that ship; the collector `collect.mjs` runs the others from the same file. Neither keeps a list of files, and both refuse a file the graph does not list. The computer's YAML parser is Engineering's, so the package stays dependency-free.

- **foundation/A24** [foundation/F41, foundation/I15]: **A visible rule in the build.** `build.mjs` copies the folders as it does and leaves out every Case file the graph marks `ships: false`. The rule reads `cases.json`, so it follows the Architecture and not a folder name.

- **foundation/A25** [foundation/F44, foundation/I16, foundation/I15]: **Placed here, belongs elsewhere: the not-ours trees.** These are the Solution/not-ours and Delivery/not-ours trees of the forest, each rooted at its governing capability (kaal-packaging, kaal-testing) and held by Engineering until that capability lands. Architecture's job includes spotting a thing that is implemented here but belongs to an outside package. The section lists each such thing with its owner. Today: the generic install-and-verify acceptance (tamper detection, pack keeps the bytes), owner kaal-packaging, relied on by Foundation's I16 through a suite in Foundation's `04-test/` that collects Packaging's Cases by reference, never through a reference from Packaging back; the temporary collector `collect.mjs`, owner kaal-testing. Until the owner lands, Engineering holds the generic Cases (not Foundation, so other packages can reuse them) and Foundation's suite collects them from Engineering by reference. The edge goes to Engineering, which is never a package, and not to Packaging: Packaging embeds into Engineering and every package uses Engineering, so no package has a dev edge to another package. Engineering and its dev edges exist in the KAAL repository only. The suite and what it collects sit in the Delivery branch: Foundation's dependency on Packaging through it is a dev dependency, never a solution dependency, so it is not in `package.json` dependencies, `verify.json` or `dist/` (foundation/N2 holds).

  **Index of the held items** (each stays in its Node, in a section "Held for <capability>", until its owner lands; a move leaves a `moved:` tombstone, ids never reused: Engineering's TOMBSTONES):
  - kaal-packaging: Intent I4, I5, I6; Requirements F4 to F8, F11, F19; Architecture A5 (below).
  - kaal-testing: Requirements F9, F13, F17.
  - kaal-agents: Requirements F16.

### Held for kaal-packaging

Not ours: carried forward from the publication Change and held here until kaal-packaging lands on main (foundation/I16).

- **foundation/A5** [foundation/F5, foundation/F6, foundation/F8, foundation/I4]: **Release acceptance.** Acceptance packs the package with `npm pack`, installs the tarball with `npm install` into a directory under the operating system's temporary directory, and runs there: the import, the file inventory and the installed `npm test`.

## Cross-cutting

Requirements that leaves in both branches answer. Each is answered on both sides on purpose, and each has its reason. It lists no Case and no element.

- **foundation/F11**: The manifest is read by the installed verification (Solution, A9) and written and checked by the manifest generator and the pack acceptance (Delivery, A26).
- **foundation/F13**: The Cases the manifest declares are verified when installed (Solution, A9) and generated from the delivered titles (Delivery, A26).
- **foundation/F14**: The command is behaviour (Solution, A7) and its declared `bin` is reached through `npm exec` in the acceptance Cases (Delivery, A26).
- **foundation/N8**: The command's exit and usage behaviour is Solution (A7), and the same exits are what the `bin` acceptance checks (Delivery, A26).
- **foundation/N2**: No dependency shows in what ships, the library's imports (Solution, A1 and A7), and in `package.json` (Delivery, A6).
- **foundation/F25**: The public data export is Foundation's declaration bytes (Solution, A15) and its distribution through the pack and the manifest (Delivery, A26).
- **foundation/F26**: The committed manifest lists the declaration (Solution, A15 and A16) and verification of an installed copy is acceptance (Delivery, A26).
- **foundation/F27**: Delivery performs no Engine lifecycle action (Solution, A16) and the acceptance Cases check it on an installed copy (Delivery, A26).
- **foundation/N16**: The declaration keeps its identity (Solution, A15) and the repository claim does not ship and claims only the package path (Delivery, A27).
- **foundation/I1**: The digest is Solution (A1) and the publisher checks it from the repository (Delivery, A28).
- **foundation/I2**: The library's stability is Solution (A1) and the publisher checks it from the repository (Delivery, A28).
- **foundation/I7**: The independent check is Solution (A9) and its behaviour is checked from the repository (Delivery, A28).
- **foundation/I14**: The Boundary Tests definition is Solution (A19 to A21) and it is checked from the repository (Delivery, A28).
