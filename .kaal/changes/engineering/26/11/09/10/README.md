# Engineering: PLAN to remove the release shims

Capability: Engineering. Target: `kaal/engineering-release-management`. Record number provisional until integration. PLAN only (F20): of the two full-facade shims in `engineering/release/`, `run.mjs` has no caller and is removed first; `release.mjs` still has four importers in Hosting and Change test files, which are rewired by one small Change per capability before `release.mjs` is removed. Documents only: no code, no `.github`, no promotion.

RED then DO of step 2 of the PLAN: the callerless shim `engineering/release/run.mjs` is removed. RED: T14 and T12 describe the folder after removal (only `release.mjs`). DO: `run.mjs` deleted; `current-state`, `transformation` and `cases` corrected (`release.mjs` is still imported by four Hosting and Change test files). T13 keeps both legacy paths in its monitored set, so a removed shim with a surviving caller stays RED (CPO condition on #1331).
