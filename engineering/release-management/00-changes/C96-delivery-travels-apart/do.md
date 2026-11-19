# C96 do

The DO adds, from the drafts in `interface.md`: the Requirements `F73.md` and `F74.md`; the declaration of the delivery locations with `.agents` and `.claude` (wirable) and the root files `package.json` and `package-lock.json`; the reader `05-src/delivery/locations.mjs` with `files` and `isDelivery`; `deliveryMixed` in `engineering/change-isolation/check.mjs` (detective, printed after the verdict); `05-src/pull-promotion/delivery-evidence.mjs` and its composition in `run.mjs`; and the DO evidence of `pull-promotion/declaration.json` reduced to `packages` and `engineering`. T1165 to T1169 are renamed from `.red.mjs` to `.test.mjs`. The text of A67, F72 and I53 names the five locations.

## Cases amended

T1159 (five roots), T1160 and T1161 (the `.agents` example becomes `agents/...`), as the Accept list of `change.md`.

## Changed after the first CI run

The checker is also run as a lone copy by the wrapper scripts. The first draft imported the delivery reader statically and broke that (Engineering, "run as a lone copy beside Foundation's SHA-256"). The reader is now loaded when reachable; a lone copy reports `detective (not gating): cannot judge`, and gates exactly as before.

## Verified

`node --test engineering/cases/cases.test.mjs`: only the 12 C15 failures of `main` (T268 to T279). All six CI workflows passed on the merged head.

## Not done here

Nothing is gating that was not before: the rule is detective. No workflow, setting or ruleset changed.
