# Hosting final SYNC preparation: the ledger rule on main, replacing the spent hosting/C11 interim allowance

Owner: Engineering. Target: kaal/hosting. Ordinary working Change; compatibility-only under
the approval of PR #866. Record numbering is provisional until integration.

Main now holds Engineering's transition-ledger rule (#880) in
engineering/change-isolation/check.mjs and its tests, with a README, an empty transitions.json
and the adapter wiring. This collector holds an older version of check.mjs and check.test.mjs
that carries hosting/C11's interim allowance (HOSTING_C11), added by the engineering/C11
amendment, Option A (Owner's approval on #716) to let the unscoped-to-scoped Hosting rename
land. Merging main into the collector therefore conflicts on both files. This Change prepares
the final SYNC so it resolves as one keep-prepared merge.

What changes, all byte-identical to main at a141116:

| Path | Result |
| --- | --- |
| engineering/change-isolation/check.mjs | main's version: the ledger rule, without the interim allowance |
| engineering/change-isolation/check.test.mjs | main's version (the ledger tests, without the allowance's tests) |
| engineering/change-isolation/README.md, transitions.json | added, as on main (empty ledger) |
| engineering/github/change-isolation.sh | main's version (passes the target's ledger to the checker) |
| .kaal/changes/engineering/26/11/02/01/README.md | main's record of the ledger rule, replacing the step 3 record, which moves here from 01 to avoid colliding with it |

The removed allowance is spent and was designed to be removed: it applies only while the target
still names Hosting by its old unscoped name, hosting/C11 has landed on this collector, and its
own text says a separate governed Engineering Change removes it. This is that Change. Removing
it deletes its tests (the HOSTING_C11 cases of check.test.mjs: the exact 44-path set, partial and
swapped sets, the spent case); they test only the removed code, no assertion about the retained
rules is weakened, and every remaining case in main's version passes.

Why check.mjs must equal main's: Route A cannot admit a change to the checker, the ledger or
.github, so the Hosting promotion must not alter engineering/change-isolation/check.mjs. With
this Change the candidate's checker equals main's, and the Hosting ledger entry need not
and cannot list it.

Also moved here: the step 3 preparation record (the 14-path arriving set from 9a9e896 with the
scoped Hosting name, merged as #894), unchanged in content, renumbered from 01 to 03 only
because main's ledger record holds 01.

Verified: engineering/change-isolation/check.test.mjs and engineering/github/lineage.test.ts,
153 tests pass. Not touched: package.json and package-lock.json (the kaal-review workspace hunk
belongs to the Review preparation) and everything under .github.

No synchronization, promotion or publication. Auto-merge is enabled; approval and required
checks govern.
