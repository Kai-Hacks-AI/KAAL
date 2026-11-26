# C139 baseline

The baseline is `main` with controls/C142 merged: `findUnadapted({controls, delivered, observed, revision})` (controls/F206, `scripts/verify-adapter.mjs`) is pure and on `main`; `runControl` (controls/C141, `scripts/adapter.mjs`) owns the mode, the ratchet filter and failing closed. `observeAdapted` (controls/F212, controls/C148) is a PLAN on its own collector and is not on `main`.

No release control runs through the adapter: the entries of release's controls (`05-src/phase/run-controls-act.mjs`, `05-src/triggers/verify-triggers.mjs`, `05-src/stages/judge.mjs`, the workflow sources under `05-src/wiring/workflows/` and the hooks) print their own verdict and exit code. No delivery map exists, and no workflow runs `verify Adapter`.
