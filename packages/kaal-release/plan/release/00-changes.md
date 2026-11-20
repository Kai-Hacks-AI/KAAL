# Release 0.0.1: Change (A to B)

This is `release/C1`, a PLAN Change. It ships no code and no package. It references the target in [intent.md](intent.md), [requirements.md](requirements.md), [architecture.md](architecture.md) and [testing.md](testing.md) by id and does not restate it. It ends when the Release target above is reached by `kaal-release` 0.0.1 and the DO Change has been accepted.

The CPO clarified the product boundary (see intent.md): the generic loop serves branch promotion and package release; KAAL consumes it for both and keeps its own decisions.

The CPO's target architecture (9 Nov 23:48) is adopted: Release Management owns the end-to-end process, with Change (implementation), Guard (protection), Testing (verification), Review (validation) and CI/CD as delegated roles (role split of the Owner, 10 Nov). Engineering Release Management remains KAAL's implementation and the vehicle for any CI consolidation; this Change adds none.

The Owner asked for "some basic setup with a skill, potentially mnemonics if we have some for release work already".

## A: the present

No `kaal-release` package exists. General release guidance is mixed into KAAL's own Delivery work (`engineering/release/`, and `engineering/release-management/` landing from its collector). Both stay as they are.

## The gap and the route

1. This PLAN, approved by exact-head CPO review. Lands in the clean `kaal/release/plan` collector (squash).
2. DO: create the package shape from architecture.md, write the Cases RED, then GREEN: T1 to T13.
2a. The analyze Flow Script and its Cases (coordination/C1, plan in `plan/coordination/`), once the package shape exists.
3. Acceptance on the packed artifact in a clean directory.
3a. CARGO: a separate Change adds `engineering/CARGO.md` (KAAL Definition) with its Cases; the Skill names it only after that is on `main` (T6).
4. Release of `kaal-release` itself is the final step, after release management is on `main`, with its own explicit Owner go.

## Interim and temporary

- The collector is `kaal/release/plan` (collector naming `kaal/<capability>/<leaf>`). It replaced a bare `kaal/release` that git could not hold beside it and that carried a stray first copy of this PLAN; that branch was deleted by the Owner. The interim ended when #1334 was retargeted.
- T5 reads forbidden identities from the Delivery target, which is not on `main` yet. Until it lands, T5 is written against the collector's copy and is marked as interim.
- Auto-merge must be enabled within seconds of a push: today's `Branching` check fails (not holds) while auto-merge is off, and GitHub then refuses to enable it. Release management takes the fix (report "held" instead of fail). This item ends when that fix lands.

## Out of scope

- Releasing `kaal-release`.
- The Release engine (`engineering/release-management/05-src/release-engine/`), owned by Engineering.
- Writing or landing the CARGO Node. It lands through its own Change (see architecture.md); no other new mnemonic is added.

## USE vs BUILD

| Need | Decision | Why |
| --- | --- | --- |
| Skill format check | USE `kaal-engineer-skill` checker | It already decides `standard` and `kaal` conformance. |
| Version rules | USE Semantic Versioning 2.0.0 | An industry standard; the Skill cites it. |
| Publishing identity and provenance | USE npm trusted publishing and provenance | The registry's own mechanism; no equivalent to build. |
| Markdown reading in tests | USE `commonmark` | A parser does what a hand-written reader would do. |
| Release engine for consumers | NOT in 0.0.1 | It is KAAL's realization; whether any part generalizes is a later Change with its own USE vs BUILD. |
| Version comparison script | NOT in 0.0.1 | The `semver` package exists; a Script level is added only when a behaviour must repeat exactly. |
| analyze Flow script | BUILD in 0.0.1 | Listing the next release action must repeat exactly and needs no judgment; see coordination/C1. |



## Open for the Owner

1. Decided (Owner, 12 Nov 2026, #1463): the package name is `@kaihacksai/kaal-release`.
2. Decided (Owner, 12 Nov 2026): 0.0.1 is not Skill-only. The release helper lives in kaal-release as a Script inside the Skill, hosted at `skills/kaal-release/scripts/analyze-flow.mjs`. This PLAN is the prerequisite: it specifies the Skill and fixes the Script's host and place in the package, but it does not specify or accept the Script itself. The Script's contract and Cases are `coordination/C1` (`plan/coordination/`, PLAN accepted 12 Nov 2026), and the full 0.0.1 target is not complete until its DO is accepted.
3. Decided: the collector is `kaal/release/plan`; the bare `kaal/release` was deleted by the Owner. No promotion or publication is authorized by this record.

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- Exact-head review at each step found real gaps before they cost anything: the contradiction between the Script decision and I5, N3 and T9, and the PR bodies that did not match their phase.
- Cases with a positive and a negative fixture caught my own wording at once: the npm example's file name tripped T4 and a trailing full stop tripped T5.
- The packed tarball, installed into a clean directory, held exactly the six intended files. The Skill and the Node came out byte-identical, the Node kept its id, and the Skill checker passed.

### Learned

- A first `Branching` run on a new PR fails when it starts before auto-merge is registered, and the `auto_merge_enabled` event re-runs it. Enabling auto-merge straight after opening the PR clears it.
- A collector's head branch is deleted when its PR merges, and force pushes are blocked. The next phase on the same branch name starts from the collector, never from history.
- A Case sourced from something not yet on the collector has to state what it falls back to and assert that it found something, or it passes vacuously.
- Keeping verification (scripts) and validation (a reviewer's reading of recorded consumers) apart made each easy to state and to review.

### Lacked

- The Delivery target on the collector, so T5 reads workflow names as a stand-in.
- Early knowledge of the per-phase PR templates; two bodies were written and corrected before I found them.
- A Case for the packed artifact. I ran that acceptance by hand and recorded its result here: six files, clean install, checker ok.
- A stated answer to what "all green" means when a Change's Script is carried by a sibling Change.

### Longed For

- The Delivery target landing, so T5 switches to its real source without an edit.
- The hosted Script's DO landing, which completes the package for release.
- The packed-artifact acceptance written as a Case, not run by hand.
