# C101 baseline

The baseline is `main` (45c78b8).

- The rule `deliveryMixed` is in `engineering/change-isolation/check.mjs`. It traces to Intent release/I53, Requirement release/F73 and Architecture release/A67. No control in `04-controls` is the rule: no classification, no declared minimum evidence.
- The checker loads the reader with `await import("../release-management/05-src/delivery/locations.mjs").catch(() => null)`. Both wrappers, `engineering/github/change-isolation.sh` (the Change Isolation job) and `engineering/github/push-check.sh` (the pre-push check), copy only `check.mjs` (and Foundation's SHA-256) into a temporary directory and run it there, so the relative import fails and the reader is null.
- Observed in the runs since the rule reached `main`: of four Change Isolation logs read, three (every one that targets `main`) end with `detective (not gating): cannot judge: the delivery declaration cannot be read: the delivery reader is not reachable from the checker`; the fourth targeted `wire/wire-pr-template`, whose own `check.mjs` (e221e99) predates the rule, so it printed no line at all: it did not judge either. All 51 runs passed; none showed a mix.
