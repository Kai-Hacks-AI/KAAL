# C36 DO inputs: closure check on the collector head and the interoperability contract

Owner: Testing. Target: `kaal/testing`. Planning only; no test, runtime, manifest, lock or identity change.
Answers Engineering's PR #857 (active-reference closure, computed on main) and its request for
Testing's stated contract for the step 4 verifier harness.

## 1. Closure re-run on the collector head

Search: `git grep -I -c "kaal-testing"` outside `packages/skills/kaal-testing`, on `kaal/testing`
at `e5b0fc7` + #847, diffed against the list in #857 (main `f30221f`).

The collector head holds **20 files** outside Testing (main: 42). Everything on the head is also on
main except `.gitattributes` (2 occurrences, path rules, not an npm identity; kept as is).
Not on the collector head, so not Testing's to carry: Core's `holder` strings and tests, the Change
package and its tests, `engineering/release/run.mjs`, `engineering/acceptance/execution.test.mjs`,
`engineering/execution/**` and the Engineering prose files. These arrive with their own collectors'
promotions and are classified by #857 (items A to D). Re-run the same search after each
`main -> kaal/testing` synchronization and again just before the C36 DO.

On the head, per #857's classes:
- Manifest and lock: `packages/skills/kaal-graph/package.json`, `package.json` (workspace path only,
  unchanged by a rename), `package-lock.json` (5 entries). Not Testing paths.
- Import specifiers: Engineering (`acceptance/embed.test.mjs`, `boundary.test.mjs`,
  `contracts/measure(.test).mjs`, `coverage/measure.mjs`, `inventory/attribute.mjs`,
  `inventory/measure.mjs`, `report/measure.mjs`), Graph tests, Engineer Skill test.
- Acquisition selectors: `engineering/delivery/pack(.test).mjs`, `engineering/lanes/acceptance.mjs`.
- Prose: Engineer Skill `README.md` and `SKILL.md`.

Testing edits only Testing-owned paths (the 16 planned files in `inventory.json`). Every other
path is changed by its owner after the admission route in PLAN #854 is decided by the Owner.

## 2. Interoperability contract (proposal for Owner review)

"Interoperability evidence" for the renamed package means all of the following, on Linux, macOS and
Windows, for **one** tarball packed once by the release engine from `main` and retained with its
release record:

1. **What is installed.** The packed scoped tarball (never a workspace link, never a registry copy)
   plus its accepted packed scoped Hosting dependency, installed into clean temporary consumers with
   a clean `npm ci` or `npm install` from the packed files.
2. **Consumers.** Engineering's acceptance lane, Change, Graph and the Engineer Skill. Each
   installs the scoped tarball through its own acquisition path and imports every public subpath of
   the export map by scoped specifier, plus `package.json`.
3. **Expected result.** Every import resolves, no unscoped `kaal-testing` specifier resolves, the
   installed verifier (`test/verify.mjs`) reports `verified` for all declared Cases, and the tarball
   inventory equals the declared hashes in `test/verify.json`.
4. **Who verifies.** Reuse first (Engineering's PLAN #859): packing once and the manifest come from
   Engineering's acceptance lane, installation from packed bytes and the byte and source checks come
   from Testing's `install` and `accept`, and each consumer keeps its own acquisition scenario.
   Independent observation is required only where Testing would judge itself: the tarball digest
   recomputed without Testing's `sha256`, real resolution of every export-map subpath in a clean
   consumer, absence of the old name, and that the tested tarball is the retained release candidate.
   Engineering adds those as one acceptance scenario in Testing's existing scenario format. Testing
   supplies the tarball, the manifest and the Cases and does not judge that scenario. Every
   installation in the scenario goes through `install()`; an installation made without it is reported
   unknown by `accept` and does not count.
5. **Negatives.** The harness must also show that the old name fails (not packed, not resolved) and
   that a tarball with one altered byte is rejected.
6. **Unknown is not pass.** A consumer that cannot run on a platform is reported unknown, and the
   release is not accepted on unknowns.

Out of scope for 0.0.1: C33, C48, composed-Plan execution, standalone `/observe` and `/red`
(disposition awaits the Owner on #693).

## 3. Open inputs

- The scope name and the accepted Hosting scoped version (Hosting thread).
- The Owner's admission route in PLAN #854 (target-held ledger recommended by Engineering).
- Whether the frozen inspection record keeps `kaal-testing` (Engineering proposes frozen).
