# Engineering: PLAN to remove the release shims

Capability: Engineering. Target: `kaal/engineering-release-management`. Record number provisional until integration. PLAN only (F20): of the two full-facade shims in `engineering/release/`, `run.mjs` has no caller and is removed first; `release.mjs` still has four importers in Hosting and Change test files, which are rewired by one small Change per capability before `release.mjs` is removed. Documents only: no code, no `.github`, no promotion.
