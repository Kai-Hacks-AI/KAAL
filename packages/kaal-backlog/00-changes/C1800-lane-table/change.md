# C1800 change

## PLAN

1. **One judge, a table of entries.** An entry is `{ kind, roots, name, allow }` (F9). The item lane is the first entry, built from today's call, so T495 to T499 pass unchanged (F11).
2. **Positive per file.** A file qualifies only through an entry and only as `A` or `M`; a file that matches no entry refuses the whole change (F9). Each file is judged by its own entry, so a change may carry items, claims or both (F10).
3. **Collisions per kind.** `existing` is given per kind; the same key in two kinds is not a collision (F10).
4. **Guards for every entry.** F6 holds per entry; an unguarded table is refused (F12).
5. **A new kind is one row.** Its Change adds the entry and its Cases; this Change adds none, only a test fixture kind in the Cases.

### Cases (red, `.red.mjs`)

- backlog/T6600: a mixed diff of items and a second kind qualifies when every file fits its own entry (F9, F10).
- backlog/T6601: a file under a root with a name that fits no entry, a path under no root, a status other than A and M, or a missing status refuses the whole (F9).
- backlog/T6602: collisions are judged per kind: the same key in another kind is fine, a second file with a key of its own kind is refused, editing the same file is not a collision (F10).
- backlog/T6603: no entry, no roots, a root outside its `allow` pattern, or a root covering rule paths is refused whole (F12).
- backlog/T6604: the old call and the same one-entry table give the same verdict and findings on the T495 and T499 inputs, and the module stays pure (F11, N2).

### Questions for the CPO

1. Is `key` by capture group 1 of the name pattern (the whole name when there is none) the right way to say a kind's uniqueness key, or should an entry carry a key function in code?
2. Findings carry `kind`. Is that enough, or should a mixed change report per-kind verdicts?
