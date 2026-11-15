# Change Isolation: transition ledger

The checker (`check.mjs`) decides two rules from changed paths: Core travels alone, and
`.github` travels alone. A change that spans owners by necessity, for example a package
version that its consumers pin exactly, cannot satisfy the first rule. The ledger admits
one such change, exactly, and nothing else. Route and rationale:
`engineering/release/foundation-0.0.2/admission-plan.md` (Route A, Owner-selected).

## What an entry commits to

`transitions.json` holds `{ "version": 1, "transitions": [ ... ] }`. An entry has:

- `id`: unique name of the transition.
- `paths`: the complete set of changed paths. Not `.github` paths, the ledger or the checker.
- `pre` and `post`: for every path, its Git blob id before (at the target) and after (in the
  change), or `null` when the path is absent on that side.

The change is admitted only when its path set equals `paths` and every blob equals the
commitment. A change with one more or fewer path, or one altered byte, is judged by the
default rules and also reports which commitment it broke.

## Why a candidate cannot authorize itself

The adapter (`engineering/github/change-isolation.sh`) reads the ledger from the target
branch's tip, as it already reads the checker. A ledger entry in the candidate is not read. A
change that touches the ledger or the checker is never covered by an entry.

## Absent path or missing evidence

A path that is genuinely absent at a revision (an addition before, a deletion after) is `null` in
the ledger. Git evidence that is missing, invalid or unavailable is not absence: an unresolvable
or non-commit revision, a failing `git`, a directory where a file is expected, or output that is
not exactly one file entry for the path all make the checker exit 2 (cannot judge). The checker
resolves the commit first and then lists the exact path with `git ls-tree`; it does not read
`git rev-parse rev:path` status, because its status for an unresolved `rev:path` (128) and for an
absent path cannot be told apart safely.

## Spent by adoption

After the target holds the post state, its blobs equal `post`, not `pre`, so the entry no
longer matches. It cannot admit a second change, and a stale target is refused for the same
reason.

## Preparing an entry (a separately reviewed Change)

1. The owners prepare the complete change on a candidate branch.
2. Derive the root lock twice from the target's immutable bytes, independently, and confirm
   the candidate lock equals both derivations; run a clean `npm ci` and the packed install.
   (The repository's root-governance helper for this derivation is delivered separately.)
3. Record each path's blob ids with `git rev-parse <rev>:<path>` and open the entry as its
   own Change into the target. Every affected owner reviews it, because the entry is their
   commitment.
4. Only then open the migration Change. It is judged against the target's ledger.

## What this checker does not prove

The ledger is exact by bytes, so it admits only what the owners reviewed. It does not itself
judge whether those bytes are right: that is the independent derivation of the lock, the
owners' review and the unchanged required CI. An entry is a commitment to review, not a
substitute for it.

## Where the rule must exist

The rule is read from the target branch's tip. Landing it on `kaal/engineering` does not make it
available to a change targeting `main`. For an atomic promotion to `main`, such as the Hosting
transition, both this rule and that transition's separately reviewed ledger entry must already be
on `main`, reached by its own governed, focused promotion. Until then a promotion to `main` is
judged by the rules `main` holds. The Foundation 0.0.2 transition has the same dependency on
whichever branch is its target.
