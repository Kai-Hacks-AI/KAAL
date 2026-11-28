# release/C191: the fast lane judges a table of payload kinds

## Reason
Kai (28 Nov): backlog items and identity claims reach main by the same fast-lane mechanism, implemented once, travelling alone or together; the lane is a route, so Release owns it. This takes over the design of backlog/C1800 (PR #3021, which is superseded by this Change) and puts the judge where the route lives. Backlog keeps its item entry and its `check`; Core owns the identity-claim payload and adds its entry the same way.

## The contract
1. **One judge, a table of entries.** `qualify(diff, { lanes, existing })` in `engineering/release-management/05-src/lane/qualify.mjs` judges a diff against a table of lane entries. An entry is `{ kind, roots, name, allow, status }`: the payload kind, the roots the routing declares for it, the pattern of a file name directly in a root (capture group 1, when present, is the uniqueness key, otherwise the whole file name), the pattern every root of that kind must match, and `status`, the list of change statuses the kind permits (default `['A','M']`; an add-only kind such as an identity claim says `['A']`).
2. **Positive per file.** A file qualifies only when its status is in its entry's `status` list (default `A` or `M`), its path is directly in a root of one entry and its name matches that entry, and **exactly one** entry matches it: a file whose path and name fit two entries (including an add-only kind overlapping an editable kind) is ambiguous and refuses the whole change with `ambiguous-lane`. A file that matches no entry, a deletion, a rename, a copy, a symlink, a submodule, a mode change or a missing status refuses the whole change. Each file is judged by its own entry, so a change may carry items, claims or both.
3. **Collisions per kind.** `existing` is given per kind and judged on the full resulting tree: the same key in two kinds is not a collision, a second file with a key of its own kind is `duplicate-number`, editing the same file is not a collision. The list of existing files of a kind is complete evidence or none: for each kind a change adds or modifies a file in, `existing[kind]` must be a list of paths; a missing or malformed list is never an empty inventory and gives UNKNOWN (finding `existing-unknown`, naming the kind), never qualified. A refusal stands without evidence.
4. **Guards for every entry.** The roots never cover the lane's own rules or Backlog's rules: a table with no entry, an entry with no roots, a root outside its entry's `allow` pattern, or a root covering a rule path is refused whole with `roots-cover-rules`.
5. **The old call is one lane.** `qualify(diff, { roots, existing })` of backlog/C2 equals the table of one entry of kind `item` for the same input (backlog T495 to T499 give the same verdicts and findings). The module stays pure: the table, the diff and `existing` arrive as data.
6. **A new kind is one row.** The Change that adds a kind adds its entry as data and its Cases; this Change adds none of its own beyond a fixture kind in the Cases.
7. **The route is separate.** The branch kind, its stage, the ruleset, the workflow and the PR template are release/C192 and its successors; nothing here activates the lane.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1710: a mixed diff of items and a second kind qualifies when every file fits its own entry; a file of one kind in the root of the other is refused.
- T1711: a file under a root with a name that fits no entry, a path under no root, a status the entry does not list (an `M` on an entry with `status: ['A']` is refused, an `M` on an entry without the field is not), a missing status, a deletion refuses the whole change.
- T1715: a file that fits two entries (one add-only, one editable, or two of the same status list) refuses the whole change with `ambiguous-lane`, naming both kinds; the same file against either entry alone qualifies.
- T1712: collisions are judged per kind: the same key in another kind is fine, a second file with a key of its own kind is refused, editing the same file is not a collision, and a finding carries the kind of its file.
- T1713: no entry, no roots, a root outside its `allow` pattern, a root covering rule paths or the repository root is refused whole with `roots-cover-rules`.
- T1716: a missing or malformed list of existing files for a kind the change lands in is UNKNOWN, never qualified; a kind the change does not land in needs no list; a refusal stands without evidence.
- T1714: the old call and the same one-entry table give the same verdict and findings on the inputs of backlog T495 to T499, and the module stays pure.
All red until the DO.

## Questions for the CPO (from backlog/C1800, carried over)
1. Is the key by capture group 1 of the name pattern (the whole name when there is none) the right way to say a kind's uniqueness key, or should an entry carry a key function in code? Recommendation: the capture group, because data is reviewable and a function is not.
2. Findings carry `kind`. Is that enough, or should a mixed change report per-kind verdicts? Recommendation: findings with `kind` are enough for the first lane.

## DO
`05-src/lane/qualify.mjs` and the Cases; Backlog's `qualify` becomes a call of this one (its Change, after this lands) and its item entry is data of Backlog read by the route. Sources only.

## Not in this Change
No claim entry (Core), no branch kind, ruleset, workflow, template, WIRE or activation: each is its own Change and the activation is the Owner's go.

## Design: split and overlap
Split: none. Overlap: backlog/C1800 (superseded), backlog/C2 (the judge it generalises), change/C250 and the Core claim payload.
