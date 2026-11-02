# Hosting scoped promotion: coherent migration through Route A

Owner: Engineering. Revised after the Owner's reassessment request on PR #862, Hosting's
reply on #866 and the CTO decision. Recommendation and plan only; nothing here opens a
promotion, SYNC or publish.

## Decision

Hosting promotes as the coherent scoped migration defined in PLAN #833: collector Hosting
(already scoped by hosting/C11, `@kaihacksai/kaal-hosting`), the consumers' pins and
imports, and the lock, admitted through Route A. The first draft of this note proposed
promoting under the unscoped name and renaming later. That is withdrawn:

- The collector is already the coherent scoped state (Hosting and four consumers pin
  `@kaihacksai/kaal-hosting@0.0.1`; verified by `npm ci`, build, native acceptance on three
  hosts and the C16 lock derivation). Promoting unscoped means reverse-renaming it first,
  which is as multi-capability as the forward rename and contradicts the accepted contract
  (hosting/I5, F15 to F17, A7 Option A).
- "Publish scoped first, consumers move, Hosting renames last" is circular: Release packs
  from main, so main must already carry the scoped Hosting.
- A Hosting-only scoped promotion is the E1c case below, so the consumers move with it.

The earlier lockfile conclusion stands: keep the shared root lock; package-local lockfiles
do not remove the sibling coupling. Foundation 0.0.2 remains a distinct track.

## Evidence kept (why the consumers must move in the same promotion)

Scratch worktree at main f30221f; Node 22, npm 11.19.1 (the CI major). Not authoritative
for CI (Node 24), but these are resolution failures, not engine failures.

| Experiment | Result |
| --- | --- |
| E1 rename Hosting only, update the existing lock | `up to date`; `npm ci --dry-run` passes. The lock gains `node_modules/@kaihacksai/kaal-hosting` and keeps `node_modules/kaal-hosting`, both linked to one directory whose `package.json` is scoped. Incoherent; it passes only because nothing re-resolves. |
| E1c same tree, lock regenerated from scratch | Fails: `404 GET registry.npmjs.org/kaal-hosting`. Five consumers still depend on `kaal-hosting`, which no workspace is called any more. Any regeneration, which C16 does twice, breaks. |
| E2 alias `"kaal-hosting": "npm:@kaihacksai/kaal-hosting@0.0.1"` in consumers | Fails: 404. An alias is a registry spec and does not link the workspace. |

A green `npm ci` on an incrementally updated lock does not show a rename is safe.

## Why the root lock stays

- Packages depend on each other by workspace link, resolved only from the root. Without the
  root lock each package would resolve siblings from a registry that holds only
  kaal-foundation 0.0.1 and kaal-guard 0.0.1 to 0.0.4.
- Published tarballs contain no lockfile, so consumers are unaffected either way. Local
  locks would only weaken the single `npm ci` that proves all packages agree.
- The coupling is the cost of exact-pinned siblings. Reduce simultaneous pin edits by
  publishing in order (Foundation, then Hosting, then dependants), not by splitting the lock.

## Route A for the Hosting transition

Route A (PLAN #854) admits a complete, exact path set by blob ids held in the target's
`transitions.json`. The Hosting transition is therefore a ledger entry, separate from the
Foundation 0.0.2 entry. It cannot be written yet:

1. The path set is the exact set of main-side paths that differ in the rename once the
   remaining SYNC steps have absorbed incoming main changes. Hosting produces that list
   from the actual diff after the SYNC; Engineering does not guess it. It spans Hosting's
   package, the consumer manifests, imports and assertions, and the root lock, with
   `.github`, the ledger and the checker excluded (Route A cannot admit them).
2. The entry commits to pre and post blob ids per path (null for absent), so the entry is
   spent by adoption and cannot be reused after a rebase.
3. The root lock in the entry is the one derived twice with the C16 helper on the final
   candidate tree.
4. Sizing: the entry is large (about 80 to 110 paths). It is generated from the diff by a
   script and checked, not hand-written. Prose and plan paths that merely mention the bare
   name need not be in the entry if they are Hosting-owned and not Core.
5. Standing gates are unchanged: full CI, protection, review, freshness and queue.

## Ledger-rule promotion plan (for CTO decision, not authorised)

Route A needs the rule on the target branch of each promotion it admits, so the sequence is:

1. #862 reviewed and merged into kaal/engineering (ledger rule inert, empty ledger).
2. A focused promotion of only the ledger rule (checker, adapter, README, empty ledger,
   tests, record) to main. It is `.github`-free: the adapter lives under
   `engineering/github/`; confirm that during the promotion check. Needs Kai's explicit
   authorisation.
3. After Hosting's remaining SYNC steps, Hosting supplies the exact path list; Engineering
   generates the Hosting entry and lands it on main by an ordinary Change.
4. Hosting promotes; the entry is spent. The Foundation 0.0.2 entry follows the same shape
   once Core (#865), Change and Testing candidates exist.

Hosting's entry comes first because Hosting's registry version precedes Core, Testing,
Graph, Change, Engineer Skill, Review and Product.

## Open points

- Does the Hosting entry also cover Graph and Engineer Skill consumer paths, or only the
  four consumers Hosting named (Core, Graph, Engineer Skill, Testing)? Change's pin must be
  checked; Change's manifest still names the bare name on main.
- First publish of `@kaihacksai/kaal-hosting` is Hosting's, with the Owner's 2FA bootstrap,
  then Trusted Publishing; Release packs from the promoted main.
