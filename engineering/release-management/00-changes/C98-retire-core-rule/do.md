# C98 do

The DO adds, from the drafts in `interface.md`: the Requirement `F76.md`, and the change of `engineering/change-isolation/check.mjs`: the rule "Core travels alone", `CORE` and `CORE_SUPPORT` are gone, the header names one rule, the ledger comment names "the isolation rule". T1171 and T1172 are renamed from `.red.mjs` to `.test.mjs`. `engineering/change-isolation/README.md` says one rule.

## Cases amended

In `check.test.mjs`: the block "core travels alone" becomes "Core has no special rule" (a Core change passes alone and mixed); `.github` mixed with Core is one violation (the `.github` rule); the aggregate test bundles `.github`, not Core; the CLI test of the mixed NUL-separated change uses `.github`; the ledger tests "refuses the multi-owner change without a matching entry" and "refuses a path the ledger does not name, and a missing path" now assert that nothing refuses them. In `carried-entry.test.mjs` the unmatched run exits 0. In `deferred.test.mjs`: T117's control, T118's omitted-path assertion and T119 now expect exit 0. The Accept list of `change.md` named most of these, from a run without Foundation's file; with it linked (as CI has it) three Cases more went red for the same reason (carried-entry "a carried entry with its attestation is admitted...", T117, T118), and are amended alike. A wrong post blob and a wrong attestation are still refused.

## Not done here

`.kaal/config/guard/Change-Isolation.md` still says "Core travels alone": it is a delivery file, and delivery does not travel with solution; the PLAN's text edit of it is left to a WIRE. The ledger, the attestation, the review check, the merge-group admission and `engineering/controls/README.md` (its I1/F1 lines name the retired rule as history) stay for the next Change. The old rulesets and `.github/workflows/change-isolation.yml` are untouched.

## Verified

`node --test` of the seven Change Isolation test files: 42 pass, 0 fail (46 before: four tests of the retired block went). T1171 and T1172 pass.
