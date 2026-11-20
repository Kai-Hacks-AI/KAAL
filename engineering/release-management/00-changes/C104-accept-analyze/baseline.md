# C104 baseline

The baseline is `main` at 3741577 and the collector `kaal/release/accept-analyze`, created at that commit.

- `.github/workflows/analyze-vulnerabilities.yml` is installed with the settings of release/C56: severity low, runtime scope, Integrating warn-only, Promoting failing. The merge queue has run it 32 times; the run of PROMOTION #2092 on 20 Nov 2026 is run 44716419310, where `analyze Vulnerabilities (Promoting)` succeeded and `(Integrating)` was skipped.
- `.github/workflows/dependency-review.yml` is detective, required by no check of the new rulesets, and runs on pull requests into `main` and `kaal/**` only.
- `00-changes/C48-analyze-vulnerabilities-stages/T583.red.mjs` expects `acceptance.md` beside it and is RED because the file is absent.
- `promoting.json` requires `analyze Vulnerabilities (Promoting)`. Whether the ruleset is loaded in GitHub is not recorded in the repository and is not claimed here.
