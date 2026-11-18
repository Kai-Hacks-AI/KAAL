# C64 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `05-src/show-wip/` holds the command (`run.mjs`, `read.mjs`, `show-wip.json`) and its Skill Script. It prints text to standard output; nothing publishes it.
- The `settled` view and the delivered / discarded counts are release/C61, not yet on `main`. The job's `settled` section depends on it, so the job is installed only after release/C61 is on `main`. Every Case of this Change works with `main` alone.
- `05-src/wiring/workflows/` holds the source of one workflow (analyze Vulnerabilities). A workflow reaches `.github/workflows` only through a WIRE, which travels alone.
- No GitHub Pages site exists for the repository.

The corporate visual identity is read from the public repository ChBrain/website (`src/styles/tokens.css`, `src/lib/brand.ts`, `public/favicon.svg`, the CVI page). Read-only; that repository is not changed.
