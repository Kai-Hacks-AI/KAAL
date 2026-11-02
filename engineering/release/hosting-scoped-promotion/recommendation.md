# Hosting-only scoped promotion: is Route A needed?

Owner: Engineering. Answers the Owner's reassessment request on PR #862. Recommendation
only; nothing here opens a promotion, SYNC or publish.

## Recommendation

1. Route A is not needed for Hosting. The rename is not a Core-only change, and Route A
   (a ledger entry admitting a fixed set of paths) is the wrong tool for it.
2. The blocker is not the lockfile. It is that the unscoped name `kaal-hosting` is a
   workspace link that six manifests and about 73 files rely on. A rename that leaves any
   of them behind does not resolve.
3. Smallest safe change: do not rename the workspace now. Promote Hosting under its current
   name and make the scoped rename a later, single, coherent Change owned by Hosting that
   touches the consumers' manifests and imports together. Route A is then used only for the
   Foundation 0.0.2 pin transition, where the exact-blob ledger is the right tool.
4. Keep the shared root lock. Package-local lockfiles solve a different problem and add more
   than they remove (see below).
5. Foundation 0.0.2 stays a distinct track. Nothing in this note changes its path.

## What was measured

Scratch worktree at main f30221f; Node 22, npm 11.19.1 (the CI major). Not authoritative for
CI (Node 24), but the failures below are resolution failures, not engine failures.

| Experiment | Result |
| --- | --- |
| E1 rename Hosting only, update the existing lock | `up to date`; `npm ci --dry-run` passes. The lock gains `node_modules/@kaihacksai/kaal-hosting` and keeps `node_modules/kaal-hosting`. Both link to one directory whose `package.json` is now scoped. The lock is internally incoherent and passes only because nothing re-resolves. |
| E1c same tree, lock regenerated from scratch | Fails: `404 GET registry.npmjs.org/kaal-hosting`. Five consumers still depend on `kaal-hosting`, which no workspace is called any more, so npm asks the registry. Any later lock regeneration, which C16 does twice, breaks. |
| E2 alias `"kaal-hosting": "npm:@kaihacksai/kaal-hosting@0.0.1"` in consumers | Fails: 404. An npm alias is a registry spec and does not link the workspace. It works only after the scoped package is published. |
| E3 blast radius of a coherent rename | Six manifests and 73 files reference `kaal-hosting` (manifests, imports, assertions, docs). |

E1 is the trap. A green `npm ci` on an incrementally updated lock does not show that the
rename is safe; the stale link hides the break until the next regeneration.

## Is the root lock unnecessary coupling?

The shared lock does couple every workspace to every change, which is why Core's pin needs
the lock and why `Core travels alone` has a lock exception. But:

- Package-local lockfiles do not remove the coupling here. The packages depend on each
  other by workspace link, which npm resolves only from the root. Removing the root lock
  makes each package resolve its siblings from the registry, which has none of them
  (registry holds only kaal-foundation 0.0.1 and kaal-guard 0.0.1 to 0.0.4).
- Reproducibility and provenance: the Release workflow packs once and publishes that
  tarball. A published tarball never contains a lockfile, so consumers are unaffected by
  either choice. Local locks would only change the repository's CI installs, and give up
  one `npm ci` that proves all packages agree.
- The coupling is legitimate for the lock and the pins; it is the cost of exact-pinned
  siblings. The better fix is to reduce the number of simultaneous pin edits (publish
  Foundation first, then consume), not to split the lock.
- A split is a separate architectural Change and should not be bundled with a release.

## Minimal blocker, restated

For a Hosting-only promotion that keeps the name `kaal-hosting`: none beyond the existing
SYNC and review gates. It touches only Hosting's own paths, so Change Isolation judges it
as an ordinary one-capability Change, no ledger entry.

For a scoped rename: the rename must be one Change with Hosting's manifest, five consumer
manifests, the imports and the lock together. That crosses capabilities, so it needs the
owners' agreement and, on main, either Route A or a sequence of single-capability steps.
The sequence that avoids Route A: (a) publish `@kaihacksai/kaal-hosting`; (b) each consumer
moves to it with its own Change; (c) Hosting renames last. Each step is one capability.
This costs a registry round trip and so is slower, but needs no ledger.

## Smallest safe migration versus Route A

| Option | Capabilities in one Change | Needs Route A | Needs registry first | Risk |
| --- | --- | --- | --- | --- |
| Promote Hosting unscoped now, rename later | 1 | No | No | Name changes later |
| Rename in one Change | 7 | Yes (plus a ledger entry for about 80 paths) | No | Large exact-blob entry; lock must be derived twice |
| Publish scoped first, consumers move, Hosting renames last | 1 each | No | Yes | Slowest; two names coexist |

Recommended: row 1 for the promotion, row 3 if the scoped name is required before consumers
publish. Row 2 is rejected for Hosting: an entry that commits about 80 paths and their blobs
is brittle and is spent at the first rebase.

## Open points for the Owner

- Is the scoped Hosting name required before Hosting's first publish, or only before
  Engineer Skill's? Only the second forces the rename.
- If row 3, which capability publishes the scoped Hosting package: Hosting (its first
  publish, Owner 2FA) or Release?
