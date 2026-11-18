# C68 baseline

The baseline is the collector `kaal/release/verify-envelope` at `main` c90b9fb, with no commit of its own.

- `05-src/plan-body/envelope.mjs` judges the envelope of a pull request from facts handed to it (title, body, base, head, commits, registry) and says PASS, FAIL or UNKNOWN. It runs by hand (`node envelope.mjs <facts file>`). No workflow, ruleset or hook runs it.
- `04-controls/` holds release/CTL1, CTL2, CTL5, CTL7, CTL8 and CTL9. No control names the envelope check, and the finder lists none for release/I7.
- The Intent release/I7 (`01-intent/I7-check-pr-envelope`) says the check judges the whole envelope of a pull request.
- The status of a control (`status`, from release/C62) is not on `main` yet. This Change declares without it; a later small Change adds it, as release/C55 did for release/CTL4.
