# C105 evidence

Observed on Node 24, on `main` b1b40b2 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the nine Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1270, T1271, T1272 | `I54.md`, `F77.md` and `A68.md` differ from the drafts (the detective text is still there) |
| T1273 | `release/CTL25 is not listed` |
| T1274 | `promoting.json differs from the draft` |
| T1275, T1276 | `F81.md` and `A72.md` are absent |
| T1277 | `judge-held.mjs is absent` |
| T1278 | `04-controls/CTL22-verify-history is still on the tree` |

The `.red.mjs` files are ignored by the finders and the runner. `node --test engineering/cases/cases.test.mjs` on this tree: 314 tests, 298 pass, 16 fail; the same 16 fail on `main`, so this PLAN adds none.

## Each Case can pass (throwaway copy)

In a throwaway copy the drafts were written as the DO's files (the elements, the controls, `promoting.json`, the `stages.json` declaration, `judge-held.mjs`) and CTL22, its judge and its workflow source removed: T1270 to T1278 all pass. The Cases refuse their hand-made negatives: a promoting source without the rule, a rule traced to an undeclared control, a bypass actor, a rule list without the rule (FAIL, not UNKNOWN), and an input that is not a list of rules or a file that is missing or not JSON (UNKNOWN).

## What the DO breaks (the Accept list)

The runner on that copy: 309 tests, 284 pass, 25 fail. The nine new failures beside the 16 of `main` are the Cases named in the Accept list of `change.md`: T481, T482, T483, T511, T512, T1132, T1174, T1175 and T1176. controls/T1095 failed at first because CTL25 declared one real run; a preventive control needs two, and CTL25 now declares two, so T1095 stays green.

## Not observed here

The live ruleset, a force-push refusal and the rules in force for `main`: they need the Owner's ruleset load and a scratch ruleset, and are the evidence of the ACT.

Mutations of `judge-held.mjs` in the copy (the check type, the FAIL verdict, the PASS verdict) each make T1277 fail.
